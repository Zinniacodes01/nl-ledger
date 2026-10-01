"""Tests for supplier name matching, for CI (no data download needed).

1. pipeline/common.py entity_key and site/lib/mcp.mjs entityKey give the same key for every
   name in tests/fixtures/names.txt (the AI server looks suppliers up by name).
2. suppliers.match joins and keeps apart the cases below, each one a real pattern from the
   records: a join that must happen, or a false join that once happened.

  uv run python check_matching.py
"""
import json
from contextlib import redirect_stdout
from io import StringIO
import subprocess
import sys
from pathlib import Path

from common import entity_key, name_forms
import suppliers

ROOT = Path(__file__).resolve().parent.parent


def rec(name, dataset="fed_grant", **kw):
    return {"forms": name_forms(name, bilingual=dataset == "fed_grant"), "dataset": dataset, "amount": kw.pop("amount", 1000.0), **kw}


# (description, records, names that must share a supplier, names that must not)
CASES = [
    ("legal suffix, case and apostrophe", [rec("Bishop's Falls Inc.", "ppa"), rec("BISHOP’S FALLS LIMITED", "paradise")],
     [("Bishop's Falls Inc.", "BISHOP’S FALLS LIMITED")], []),
    ("the two Catholic dioceses before suffix removal", [
        rec("The Roman Catholic Episcopal Corporation", bn="107876468RP0020", postal="A0G3M0"),
        rec("Roman Catholic Episcopal Corporation", bn="107910176RR0035", postal="A1N2C4"),
        rec("The Roman Catholic Episcopal Corp.", bn="107876468RP0028", postal="A0K1B0"),
        rec("Roman Catholic Episcopal Corporation of St. John's", bn="107910176RP0010", postal="A0B2Y0")],
     [(0, 2), (1, 3)], [(0, 1), (0, 3)]),
    ("conflicting numbers alone do not split a published name", [
        rec("Shared Name Inc.", bn="107876468"), rec("Shared Name Corp.", bn="107910176"),
        rec("Shared Name", "ppa")], [(0, 1), (0, 2)], []),
    ("conflicting numbers and disjoint postcodes split", [
        rec("Shared Name Inc.", bn="107876468", postal="A0G3M0"),
        rec("Shared Name Corp.", bn="107910176", postal="A1N2C4"),
        rec("Shared Name", "ppa"), rec("Shared Name", "fed_contract", postal="A0G3M0")],
     [(0, 3)], [(0, 1), (0, 2), (1, 2)]),
    ("conflicting numbers and disjoint localities split without postcodes", [
        rec("Shared Name Inc.", bn="107876468", city="Norris Arm"),
        rec("Shared Name Corp.", bn="107910176", city="Mount Pearl")], [], [(0, 1)]),
    ("overlapping location evidence keeps a town together", [
        rec("Example Town", bn="107876468", postal="A0G3M0", city="Example"),
        rec("Example Town", bn="107876468", postal="A1N2C4", city="Example"),
        rec("Example Town", bn="107910176", postal="A1N2C4", city="EXAMPLE")], [(0, 2)], []),
    ("same root charity suffix conflict alone does not split", [
        rec("Example Foundation", bn="119229896RR0045", postal="A0G3M0"),
        rec("Example Foundation", bn="119229896RR0021", postal="A0G3M0")], [(0, 1)], []),
    ("charity suffixes and different locations split", [
        rec("Example Parish", bn="119229896RR0045", postal="A0G3M0"),
        rec("Example Parish", bn="119229896RR0021", postal="A1N2C4"),
        rec("Example Parish", bn="119229896RP0001")], [], [(0, 1), (0, 2), (1, 2)]),
    ("bilingual names cannot bridge located conflicts", [
        rec("Example Inc.|Societe exemple", bn="107876468", postal="A0G3M0"),
        rec("Example Corp.|Societe exemple", bn="107910176", postal="A1N2C4")], [], [(0, 1)]),
    ("postal typo evidence can join conflicting numbers at one location", [
        rec("Frozen in Time Ltd.", bn="107876468", postal="A0G3M0"),
        rec("Frozen in Tyme Ltd.", bn="107910176", postal="A0G3M0")], [(0, 1)], []),
    ("a unit cannot bridge located number conflicts", [
        rec("Example University", bn="107876468", postal="A0G3M0"),
        rec("Example University - School of Music", bn="107910176", postal="A1N2C4")], [], [(0, 1)]),
    ("whole groups retain conflicts after a join at a shared address", [
        rec("Example University", bn="107876468", postal="A0G3M0"),
        rec("Example University - Faculty of Arts", bn="107910176", postal="A0G3M0"),
        rec("Example University - Faculty of Arts - School of Music", bn="119229896", postal="A1N2C4")],
     [(0, 1)], [(0, 2), (1, 2)]),
    ("a missing-location identity cannot bridge separated identities", [
        rec("Example Inc.", bn="107876468", postal="A0G3M0"),
        rec("Example Corp.", bn="107910176", postal="A1N2C4"),
        rec("Example", bn="119229896")], [], [(0, 1), (0, 2), (1, 2)]),
    ("full charity accounts survive joins across different name keys", [
        rec("Example Parish", bn="119229896RR0045", postal="A0G3M0"),
        rec("Example Parish Council", bn="119229896RR0021", postal="A1N2C4")], [], [(0, 1)]),
    ("full accounts and another root cannot lose the charity conflict", [
        rec("Example Inc.", bn="119229896RR0045", postal="A0G3M0"),
        rec("Example Corp.", bn="107910176RR0010", postal="A1N2C4"),
        rec("Example Council", bn="119229896RR0021", postal="A1N2C4")], [], [(0, 1), (0, 2)]),
    ("same-identifier aliases supply location evidence before partitioning", [
        rec("Example Community Council", bn="107876468", postal="A0G3M0", city="North"),
        rec("Example Community Council", bn="107910176", postal="A1N2C4", city="South"),
        rec("Example Council", bn="107876468", postal="A1N2C4", city="South")], [(0, 1), (0, 2)], []),
    ("a province suffix is not a different locality", [
        rec("Summerford Age Friendly", bn="107876468", postal="A0G3M0", city="Summerford, NL"),
        rec("Summerford Age Friendly", bn="107910176", postal="A0G3M0", city="Summerford Newfoundland and Labrador")], [(0, 1)], []),
    ("same award cannot bridge located conflicts", [
        rec("Example Inc.", "fed_contract", bn="107876468", postal="A0G3M0", date="2023-09-07", amount=1000),
        rec("Example Corp.", "canadabuys", bn="107910176", postal="A1N2C4", date="2023-09-07", amount=1000)], [], [(0, 1)]),
    ("a named anchor separates recipients at the same GEO Centre", [
        rec("Johnson GEO CENTRE", bn="107690273RR0001", postal="A1A1B2"),
        rec("Johnson GEO CENTRE", bn="892350612RR0001", postal="A1A1B2")], [], [(0, 1)]),
    ("bilingual grant name", [rec("Memorial University of Newfoundland|Université Memorial de Terre-Neuve"), rec("Université Memorial de Terre-Neuve")],
     [("Memorial University of Newfoundland", "Université Memorial de Terre-Neuve")], []),
    ("a French half that is a placeholder joins nothing", [rec("Town of Mount Carmel|N/A"), rec("Some Other Town|N/A")],
     [], [("Town of Mount Carmel", "Some Other Town")]),
    ("a bar outside federal grants is not a bilingual pair", [rec("FOX ISLAND RIVER | POINT AU MAL RECREATION COMMITTEE", "mha"), rec("Point au Mal Recreation Committee", "paradise")],
     [], [("FOX ISLAND RIVER | POINT AU MAL RECREATION COMMITTEE", "Point au Mal Recreation Committee")]),
    ("an operating name is not a join", [rec("Cavendish Hotel LP o/a Sheraton", "ppa"), rec("Sheraton", "mha")],
     [], [("Cavendish Hotel LP o/a Sheraton", "Sheraton")]),
    ("business number and a spelling slip", [rec("Frozen in Time Ltd.", bn="750936296RC0001"), rec("Frozen In Tyme Inc.", bn="750936296")],
     [("Frozen in Time Ltd.", "Frozen In Tyme Inc.")], []),
    ("an umbrella number with a charity account per congregation", [rec("Clarenville Pentecostal Tabernacle", bn="107833394RR0117", postal="A5A1K7"), rec("Pentecostal Tabernacle", bn="107833394RR0071", postal="A0G2M0")],
     [], [("Clarenville Pentecostal Tabernacle", "Pentecostal Tabernacle")]),
    ("a department placeholder is not a business number", [rec("Gary Rose", bn="000000000"), rec("Gary Ross", bn="000000000")],
     [], [("Gary Rose", "Gary Ross")]),
    ("a publisher XX identifier is not a CRA business number", [
        rec("Example Inc.", bn="900053596XX9999"), rec("Example Corporation", bn="107910176")],
     [(0, 1)], []),
    ("a longer numeric identifier is not a truncated business number", [
        rec("Example Inc.", bn="1078764680"), rec("Example Corporation", bn="107910176")],
     [(0, 1)], []),
    ("same postal code, different initials", [rec("H & S Harvesters Limited", postal="A0G 4R0", bn="855885505RC0001"), rec("J & W Harvesters Ltd", postal="A0G 4R0")],
     [], [("H & S Harvesters Limited", "J & W Harvesters Ltd")]),
    ("same postal code and a spelling slip", [rec("Newfoundland Aqua Services Ltd.", postal="A0H 1A0"), rec("Newfoundland Aqua Service Ltd.", postal="A0H1A0")],
     [("Newfoundland Aqua Services Ltd.", "Newfoundland Aqua Service Ltd.")], []),
    ("a company and its limited partnership", [rec("Right Coast Wind Corp.", "ppa"), rec("Right Coast Wind Limited Partnership", "ppa")],
     [], [("Right Coast Wind Corp.", "Right Coast Wind Limited Partnership")]),
    ("a department printed after its government", [rec("Government of Newfoundland and Labrador"), rec("Government of Newfoundland and Labrador, Department of Education")],
     [("Government of Newfoundland and Labrador", "Government of Newfoundland and Labrador, Department of Education")], []),
    ("the province's name alone is not a body", [rec("Newfoundland and Labrador"), rec("Newfoundland and Labrador Department of Justice")],
     [], [("Newfoundland and Labrador", "Newfoundland and Labrador Department of Justice")]),
    ("the same federal award in two files", [rec("B & R ENTERPRISES LIMITED", "fed_contract", date="2023-09-07", amount=5495116.88),
                                            rec("B & R ENTERPRIES LIMITED", "canadabuys", date="2023-09-07", amount=5495116.88)],
     [("B & R ENTERPRISES LIMITED", "B & R ENTERPRIES LIMITED")], []),
    ("a '/' before a name that is not French is part of the name", [rec("Black Duck Brook/Winter Houses Recreation Committee"), rec("Black Duck Brook Development Association")],
     [], [("Black Duck Brook/Winter Houses Recreation Committee", "Black Duck Brook Development Association")]),
    ("a bracket that is not the name's acronym stays part of it", [rec("Minister of Finance (PEI)", "pa_tp"), rec("Minister of Finance (NS)", "pa_tp")],
     [], [("Minister of Finance (PEI)", "Minister of Finance (NS)")]),
    ("a charity's GST account is the same body", [rec("Town of Burin", bn="107512345RT0001"), rec("Town Council of the Town of Burin", bn="107512345RR0001")],
     [("Town of Burin", "Town Council of the Town of Burin")], []),
    ("close names with no evidence stay apart", [rec("Pittman Enterprises Ltd.", "fed_contract"), rec("Pittman's Enterprises Limited", "fed_contract")],
     [], [("Pittman Enterprises Ltd.", "Pittman's Enterprises Limited")]),
]


# All eight over-splits in the independent review: no reviewed merge exceptions.
for name, numbers, pc in [
    ("City of Corner Brook", ["122333271RP0001", "829388883"], "A2H6E1"),
    ("Point Lance Community Council", ["107850448", "707217311RP0001", "727420325RP0001"], "A0B1E0"),
    ("Town of Forteau", ["107394033RP0001", "821385556"], "A0K2P0"),
    ("Town of Hant's Harbour", ["130639982", "882656374"], "A0B1Y0"),
    ("Town of Irishtown-Summerside", ["129789277RP0001", "837151646RT0001"], "A2H4A1"),
    ("Town of North West River", ["132633579", "788294130RP0001"], "A0P1M0"),
    ("Town of Springdale", ["108129933RP0001", "818402877RP0001"], "A0J1T0"),
    ("Burin Peninsula Health Care Foundation", ["106818610RR0001", "106818610RR1068"], "A0E1E0"),
]:
    records = [rec(name, bn=bn, postal=pc) for bn in numbers] + [rec(name.upper(), "ppa")]
    CASES.append((f"reviewed over-split rejoins by the rule: {name}", records,
                  [(0, i) for i in range(1, len(records))], []))


def check_parity() -> list[str]:
    names = [n for n in (ROOT / "tests" / "fixtures" / "names.txt").read_text().splitlines() if n.strip()]
    js = subprocess.run(["node", "--input-type=module", "-e",
                         "import { entityKey } from './site/lib/mcp.mjs';"
                         "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.stringify(JSON.parse(s).map(entityKey))));"],
                        cwd=ROOT, input=json.dumps(names), capture_output=True, text=True, check=True)
    return [f"name key differs for {n!r}: Python {entity_key(n)!r}, AI server {j!r}"
            for n, j in zip(names, json.loads(js.stdout)) if entity_key(n) != j]


def check_cases() -> list[str]:
    original_rules = suppliers.RULES
    suppliers.RULES = ROOT / "tests" / "fixtures" / "no-rules.csv"  # the cases test the rules in code, not reviewed decisions
    problems = []
    for what, records, same, apart in CASES:
        matched = suppliers.match(records)
        def group(n):
            i = n if isinstance(n, int) else next(i for i, r in enumerate(records) if r["forms"][0] == name_forms(n)[0])
            return matched["record_keys"][i]

        problems += [f"{what}: {a!r} and {b!r} should be one supplier" for a, b in same if group(a) != group(b)]
        problems += [f"{what}: {a!r} and {b!r} should stay apart" for a, b in apart if group(a) == group(b)]
    suppliers.RULES = original_rules
    # The reviewed Grand Falls alias must apply to the correct partition only.
    records = [rec("The Roman Catholic Episcopal Corporation", bn="107876468RP0020", postal="A0G3M0"),
               rec("Roman Catholic Episcopal Corporation", bn="107910176RR0035", postal="A1N2C4"),
               rec("Roman Catholic Episcopal Corporation of Grand Falls", bn="107876468RP0025")]
    with redirect_stdout(StringIO()):  # this small fixture does not contain unrelated reviewed names
        keys = suppliers.match(records)["record_keys"]
    if keys[0] != keys[2] or keys[1] == keys[2]:
        problems.append("reviewed Grand Falls alias must join root 107876468 and exclude St. John's root 107910176")
    return problems


def main() -> int:
    problems = check_parity() + check_cases()
    for p in problems:
        print("  " + p)
    print(f"FAIL: {len(problems)} matching checks" if problems else f"PASS: name keys agree; {len(CASES)} matching cases hold")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
