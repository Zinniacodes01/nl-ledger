"""Source-backed PPA repeat decisions. Run: uv run python check_awards.py."""
import copy
import csv
import json
import tempfile
from decimal import Decimal
from pathlib import Path

from award_repeats import contract_key, count_once, locator, reviewed_pairs, write_pair_audit
from bodies import canonical_body
from common import entity_key
from parse_ppa import parse_file

ROOT = Path(__file__).resolve().parent.parent
with (ROOT / "tests/fixtures/award_rows.csv").open(newline="") as fh:
    fixture = list(csv.DictReader(fh))


def item(r):
    return {"_row": r, "supplier_key": r["review_supplier_key"], "amount": float(r["amount"]),
            "currency": r["currency"], "buyer_key": entity_key(canonical_body(r["public_body"])),
            "extra": "{}", "locator": f"page {r['page']}, award {r['award_on_page']} in the table on that page"}


def pair_rows(review):
    return [next(r for r in fixture if locator(r) == (review[f"file_{lab}"], review[f"page_{lab}"], review[f"row_{lab}"]))
            for lab in ("a", "b")]


# Every source-reviewed pair pins its counting action, correction direction and receipts.
for review in reviewed_pairs().values():
    a, b = pair_rows(review)
    kept, repeats = count_once([item(a), item(b)])
    assert len(kept) == (2 if review["decision"] == "keep" else 1), review
    if review["decision"] != "keep":
        chosen, other = (b, a) if review["decision"] == "correction" else (a, b)
        assert locator(kept[0]["_row"]) == locator(chosen), review
        printings = json.loads(kept[0]["extra"])["repeat_printings"]
        assert len(printings) == 1
        assert printings[0]["source_url"] == other["source_url"]
        assert printings[0]["description"] == other["description"]
        assert printings[0]["amount"] == float(other["amount"])
        assert "not added again" in printings[0]["note"]
        assert repeats[0][2] == review["evidence"]
        reverse, _ = count_once([item(b), item(a)])
        if review["decision"] == "correction":
            assert locator(reverse[0]["_row"]) == locator(b), "correction must survive reversed input order"

# Read both real report PDFs in CI. The source prints two full contract/PO identifiers.
ms = []
for file in sorted((ROOT / "tests/fixtures/awards").glob("*.pdf")):
    rows = parse_file(file, "ppa/" + file.name)
    row = next(r for r in rows if r["amount"] == 53689740)
    row["review_supplier_key"] = "microsoft"
    row["source_url"] = "https://www.gov.nl.ca/ppa/files/" + file.name
    ms.append(row)
assert {r["contract_no"] for r in ms} == {"2023-3532 / po 018905", "2023-3805 / PO 018835"}
assert {(r["page"], r["award_on_page"]) for r in ms} == {(2, 6), (2, 14)}
assert {r["award_date"] for r in ms} == {"2023-05-19"}
assert {r["term"] for r in ms} == {"5 Years"}
kept, repeats = count_once([item(r) for r in ms])
assert len(kept) == 2 and not repeats
assert sum(Decimal(str(i["amount"])) for i in kept) == Decimal("107379480.0")

# Broken or merged left borders must not turn a printed buyer into a blank.
# Real PDFs pin all five corrections, their physical award positions and prices.
for name, page, row_id, award, supplier, buyer, amount in [
    ("June-16th-30th-2021Exceptions.pdf", 1, "t1r16", 13, "Boland Marine & Industrial LLC", "Newfoundland and Labrador Hydro", 224387.77),
    ("Contract-and-Exceptions-Awards_-September-16th-30th-2021.pdf", 4, "t1r11", 8, "Infor (Canada) Ltd", "Newfoundland and Labrador Centre for Health Information", 117133.37),
    ("2026-Apr-1-15-Contract-Awards-Report.pdf", 1, "t1r23", 19, "VitalSine", "City of St. John's", 34071.81),
    ("2026-July-1-15-Contract-Awards-Report.pdf", 2, "t1r14", 10, "NL Kubota Limited", "City of St. John's", 13894.00),
    ("2026-August-16-31-Contract-Awards-Report.pdf", 1, "t1r5", 1, "Dynavox Canada", "Department of Education and Early Childhood Development", 12564.48),
]:
    file = ROOT / "tests/fixtures/awards/buyer-transcriptions" / name
    rows = parse_file(file, "ppa/" + name)
    parsed = next(r for r in rows if r["page"] == page and r["row"] == row_id)
    assert (parsed["supplier"], parsed["public_body"], parsed["amount"], parsed["award_on_page"]) == (supplier, buyer, amount, award), parsed
    # The override must never fill a matching row in a different report.
    unreviewed = parse_file(file, "ppa/unreviewed.pdf")
    assert not next(r for r in unreviewed if r["page"] == page and r["row"] == row_id)["public_body"]

vitalsine = [r for r in fixture if r["supplier"] == "VitalSine"]
kept, _ = count_once([item(r) for r in vitalsine])
assert len(kept) == 1 and kept[0]["amount"] == 34071.81
assert json.loads(kept[0]["extra"])["repeat_printings"][0]["buyer"] == "City of St. John's"

# Each of these formerly removed source rows must remain: products, zones, renewal terms,
# or far-apart award dates. Never infer a repeat from only a shared contract and price.
for name, cno in [("Brenntag", "PO2023-0423"), ("Clarion", "2026-1170"),
                  ("Canadian Health Labs", "2022-2638"), ("BRANDT", "223019506"),
                  ("Domtar", "226002048")]:
    rs = [r for r in fixture if name in r["supplier"] and contract_key(r["contract_no"]) == contract_key(cno)]
    assert len(rs) == 2, (name, cno)
    kept, repeats = count_once([item(r) for r in rs])
    assert len(kept) == 2 and not repeats, name

# Batch school-bus awards with different COV identifiers are all retained.
rs = [r for r in fixture if "Student Transportation" in r["description"]]
assert len(rs) >= 5
assert len(count_once([item(r) for r in rs])[0]) == len(rs)

# New source rows exercise the automatic rule, not reviewed locators.
a = copy.deepcopy(ms[0])
a.update(source_file="ppa/new-a.pdf", contract_no="2027-123 / PO#00045", description="Supply of sensors", award_date="2027-01-01", term="1 Year", renewal="N/A")
b = {**a, "source_file": "ppa/new-b.pdf", "contract_no": "2027-123 PO 00045", "description": "Supply of sensors."}
kept, repeats = count_once([item(a), item(b), item({**b, "source_file": "ppa/new-c.pdf"})])
assert len(kept) == 1 and len(repeats) == 2
assert len(json.loads(kept[0]["extra"])["repeat_printings"]) == 2
for changed in ({"contract_no": "2027-124 / PO00045"}, {"contract_no": "2027-123 / PO00046"},
                {"award_date": "2027-02-01"}, {"description": "Supply of valves"},
                {"public_body": "Town of Gander"}, {"term": "2 Years"}, {"renewal": "2 Years"},
                {"currency": "USD"}, {"amount": "1.0"}, {"contract_no": "N/A"}):
    kept, _ = count_once([item(a), item({**b, **changed})])
    assert len(kept) == 2, changed
assert contract_key("PO 123") == contract_key("PO # 123") == contract_key("123")
assert contract_key("00123") != contract_key("123")
assert contract_key("12/34") != contract_key("1234")
assert not contract_key("N/A")
# The class scan uses raw printings, includes the 31-day boundary and USD prices without
# conversion, excludes missing dates and unlike currencies, and clears a stale empty audit.
with tempfile.TemporaryDirectory() as tmp:
    path = Path(tmp) / "pairs.csv"
    a.update(award_date="2027-01-01")
    b = {**a, "source_file": "ppa/other.pdf", "contract_no": "different", "award_date": "2027-02-01"}
    rows = [item(a), item(b)]
    assert len(write_pair_audit(rows, [], path)) == 1
    assert not write_pair_audit([item(a), item({**b, "award_date": "2027-02-02"})], [], path)
    assert len(path.read_text().splitlines()) == 1
    assert not write_pair_audit([item(a), item({**b, "award_date": ""})], [], path)
    usd = [{**i, "currency": "USD", "amount": None, "amount_original": 50} for i in rows]
    assert write_pair_audit(usd, [], path)[0]["currency"] == "USD"
    assert not write_pair_audit([rows[0], usd[1]], [], path)
print("PPA award source and counting checks: pass")
