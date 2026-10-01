"""Re-run the supplier-only audit against a saved pre-fix PR ledger.

uv run python audit_supplier_splits.py --before /path/to/pre-fix-ledger.db \
    --original-movements /path/to/pre-fix-supplier-split-records.csv

The original movements recover the pre-PR grouping on exactly the same records.
No source values are changed. Writes exact totals, moved receipts and split evidence.
"""
import argparse
import csv
import hashlib
import json
import sqlite3
from collections import Counter, defaultdict
from decimal import Decimal
from pathlib import Path

from common import ROOT
from suppliers import OVERLAP, identity_conflict


def ledger(path):
    with sqlite3.connect(f"file:{path}?mode=ro", uri=True) as con:
        con.row_factory = sqlite3.Row
        return {r["id"]: dict(r) for r in con.execute("SELECT * FROM items")}


def write_csv(path, fields, rows):
    with path.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)


def totals(records, keys):
    out = defaultdict(lambda: {"n": 0, "included": Decimal(0), "excluded": Decimal(0), "names": Counter()})
    for i, r in records.items():
        if not (k := keys[i]) or r["dataset"] == "sunshine":
            continue
        out[k]["n"] += 1
        out[k]["names"][r["supplier"]] += 1
        out[k]["excluded" if r["dataset"] in OVERLAP else "included"] += Decimal(str(r["amount"] or 0))
    return out


def movements(records, before, after, prefix):
    old, new = totals(records, before), totals(records, after)
    changed = sorted(k for k in old.keys() | new.keys()
                     if any(old[k][f] != new[k][f] for f in ("n", "included", "excluded")))
    rows = []
    for k in changed:
        a, b = old[k], new[k]
        rows.append({"supplier_key": k, "printed_name": (b["names"] or a["names"]).most_common(1)[0][0],
                     "before_records": a["n"], "after_records": b["n"], "record_change": b["n"] - a["n"],
                     **{f"{which}_{kind}": f"{v[kind]:.2f}" for which, v in [("before", a), ("after", b)] for kind in ("included", "excluded")},
                     **{f"{kind}_change": f"{b[kind] - a[kind]:.2f}" for kind in ("included", "excluded")}})
    for kind in ("included", "excluded"):
        assert sum(Decimal(r[f"{kind}_change"]) for r in rows) == 0, f"net {kind} change"
    fields = ["supplier_key", "printed_name", "before_records", "after_records", "record_change",
              "before_included", "after_included", "included_change", "before_excluded", "after_excluded", "excluded_change"]
    write_csv(ROOT / "docs" / f"{prefix}-totals.csv", fields, rows)
    moved = [{"record_id": i, "printed_supplier": r["supplier"], "before_supplier_key": before[i], "after_supplier_key": after[i],
              "dataset": r["dataset"], "amount": f"{Decimal(str(r['amount'])):.2f}" if r["amount"] is not None else "",
              "included_in_headline": r["dataset"] not in OVERLAP,
              **{f: r[f] for f in ("source_url", "source_file", "locator")}}
             for i, r in sorted(records.items()) if before[i] != after[i]]
    write_csv(ROOT / "docs" / f"{prefix}-records.csv", ["record_id", "printed_supplier", "before_supplier_key", "after_supplier_key",
              "dataset", "amount", "included_in_headline", "source_url", "source_file", "locator"], moved)
    return rows, moved


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--before", type=Path, required=True)
    parser.add_argument("--original-movements", type=Path, required=True)
    args = parser.parse_args()
    before, after = ledger(args.before), ledger(ROOT / "data/build/ledger.db")
    assert before.keys() == after.keys(), "record IDs changed"
    fields_changed = Counter(k for i in before for k in before[i] if before[i][k] != after[i][k])
    assert set(fields_changed) <= {"supplier_key"}, f"source fields changed: {fields_changed}"
    prior = {i: r["supplier_key"] for i, r in before.items()}
    original = dict(prior)
    for r in csv.DictReader(args.original_movements.open(newline="")):
        assert prior[r["record_id"]] == r["after_supplier_key"], "original movements do not match snapshot"
        original[r["record_id"]] = r["before_supplier_key"]
    final = {i: r["supplier_key"] for i, r in after.items()}
    for name in ("city of corner brook", "point lance community council", "town of forteau", "town of hants harbour",
                 "town of irishtown summerside", "town of north west river", "town of springdale", "burin peninsula health care foundation"):
        keys = {r["supplier_key"] for r in after.values() if r["supplier_name_key"] == name}
        assert len(keys) == 1, f"reviewed over-split remains: {name}"
    original_pieces, final_pieces = defaultdict(set), defaultdict(set)
    for i, key in original.items():
        if key and before[i]["dataset"] != "sunshine":
            original_pieces[key].add(prior[i])
            final_pieces[key].add(final[i])
    original_splits = {k for k, pieces in original_pieces.items() if len(pieces) > 1}
    assert len(original_splits) == 97, f"expected the original 97 split pages, found {len(original_splits)}"
    remaining = {k for k in original_splits if len(final_pieces[k]) > 1}
    with sqlite3.connect(ROOT / "data/build/ledger.db") as con:
        identities = json.loads(con.execute("SELECT value FROM facts WHERE key='supplier_matching'").fetchone()[0])["identities"]
    # Every grant number, including publisher placeholders, survives in its final page metadata.
    from build import iid
    for r in csv.DictReader((ROOT / "data/clean/fed_grants.csv").open(newline="")):
        record_id = iid("fed_grant", r["owner_org"], r["agreement_number"] or r["ref_number"], r["recipient"].lower())
        key = final[record_id]
        if r["business_number"]:
            assert r["business_number"] in identities[key]["business_numbers"], f"lost published number: {record_id}"
    results, piece_rows = [], []
    for key in sorted(original_splits):
        pieces = sorted(final_pieces[key])
        reasons, evidence = set(), []
        if key in remaining:
            for i, a in enumerate(pieces):
                for b in pieces[i + 1:]:
                    for x in identities.get(a, {}).get("evidence", []):
                        for y in identities.get(b, {}).get("evidence", []):
                            profile = lambda p: {"code": p["identity"], "postal": set(p["postal_codes"]),
                                                 "locality": set(p["localities"]), "anchors": set(p["anchors"])}
                            if why := identity_conflict(profile(x), profile(y)):
                                reasons.add(why)
                                evidence.append({"a": a, "b": b, "reason": why, "a_evidence": x, "b_evidence": y})
            assert reasons, f"remaining split has no supporting evidence: {key}"
        if key in remaining:
            for piece in pieces:
                profiles = identities.get(piece, {}).get("evidence", [])
                receipts = [r["source_url"] for i, r in after.items() if original[i] == key and final[i] == piece and r["source_url"]]
                piece_rows.append({"original_supplier_key": key, "supplier_key": piece,
                    "business_numbers": "; ".join(identities.get(piece, {}).get("business_numbers", [])),
                    "postal_codes": "; ".join(sorted({p for ev in profiles for p in ev["postal_codes"]})),
                    "localities": "; ".join(sorted({p for ev in profiles for p in ev["localities"]})),
                    "reason": "; ".join(sorted(reasons)) if profiles else "unnumbered records cannot be uniquely assigned to located pieces",
                    "source_urls": "; ".join(sorted(set(receipts)))})
        results.append({"original_supplier_key": key, "status": "split" if key in remaining else "rejoined",
                        "pieces": len(pieces), "supplier_keys": "; ".join(pieces),
                        "reason": "; ".join(sorted(reasons)) if reasons else "identifier conflict alone is insufficient",
                        "evidence": json.dumps(evidence, sort_keys=True) if evidence else ""})
    write_csv(ROOT / "docs/supplier-retained-splits.csv", list(results[0]), results)
    write_csv(ROOT / "docs/supplier-retained-pieces.csv", list(piece_rows[0]), piece_rows)
    fix_rows, fix_moved = movements(after, prior, final, "supplier-rule-fix")
    original_rows, original_moved = movements(after, original, final, "supplier-split")
    all_totals = totals(after, final)
    summary = {"records": len(after), "original_split_pages": len(original_splits), "remaining_split_pages": len(remaining),
               "rejoined_pages": len(original_splits) - len(remaining), "fix_moved_records": len(fix_moved),
               "fix_changed_suppliers": len(fix_rows), "pr_moved_records": len(original_moved), "pr_changed_suppliers": len(original_rows),
               "included": f"{sum(v['included'] for v in all_totals.values()):.2f}",
               "excluded": f"{sum(v['excluded'] for v in all_totals.values()):.2f}",
               "before_sha256": hashlib.sha256(args.before.read_bytes()).hexdigest(),
               "original_movements_sha256": hashlib.sha256(args.original_movements.read_bytes()).hexdigest()}
    (ROOT / "docs/supplier-split-audit.json").write_text(json.dumps(summary, indent=2) + "\n")
    print(json.dumps(summary, indent=2))
    for r in results:
        if r["status"] == "split":
            print(r["original_supplier_key"], r["pieces"], r["reason"])


if __name__ == "__main__":
    main()
