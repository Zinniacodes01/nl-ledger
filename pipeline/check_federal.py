"""Real audit counterexamples: python check_federal.py --ledger after a rebuild."""
import argparse
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    "352559efa91e": "NL", "3b111bcf74a5": "national_or_multiple_or_other", "da13771f1372": "NL",
    "c5500509042d": "national_or_multiple_or_other",
    "bca16564e795": "NL", "aa1e7d019f60": "NL", "fa607549cc54": "NL",
    "63c4432f8541": "national_or_multiple_or_other", "7d3902b49e61": "national_or_multiple_or_other",
    "b5c6a18c47f4": "national_or_multiple_or_other", "8323dbffdf45": "national_or_multiple_or_other",
    "3edc2e68d696": "unknown", "093509db8ca4": "unknown", "63300ec95fb3": "unknown",
    "10ace16b39c4": "national_or_multiple_or_other", "b035ea02a4e3": "national_or_multiple_or_other",
    "d677e0fe2faf": "unknown", "13f89fc3485e": "national_or_multiple_or_other",
    "36d6d738b8e8": "NL", "7ccd49403328": "NL", "11e457616b87": "NL",
    "c2641c85abe3": "unknown", "246e901188f4": "NL", "287d79501c86": "NL",
    "9be02dfdf480": "NL", "09a043d96d65": "NL", "a29d34744ddb": "unknown", "2596630e5aac": "NL",
}
REMOVED = {"909f02da7ae3", "af355141e3d1", "7698e532de4f", "35bb90c1f35e"}


def check_ledger():
    c = sqlite3.connect(f"file:{ROOT}/data/build/ledger.db?mode=ro", uri=True)
    c.row_factory = sqlite3.Row
    rows = {r["id"].rsplit("-", 1)[-1]: dict(r) for r in c.execute("SELECT * FROM items WHERE level='federal'")}
    from federal_evidence import UNREVIEWED_STATEMENT
    errors = []
    for id, status in EXPECTED.items():
        r = rows.get(id)
        x = json.loads(r["extra"] or "{}") if r else {}
        if x.get("scope_status") != status:
            errors.append(f"{id}: expected {status}, got {x.get('scope_status')}")
        for field in ("inclusion_rule", "reported_location", "scope_review_state", "source_fields", "amount_kind", "amount_period"):
            if not x.get(field):
                errors.append(f"{id}: missing {field}")
    for id in REMOVED & rows.keys():
        errors.append(f"{id}: should not contribute another record")
    for id, currency in {"a29d34744ddb": "USD", "2596630e5aac": "unstated"}.items():
        if rows[id]["currency"] != currency:
            errors.append(f"{id}: native currency lost")
    for id in ("b035ea02a4e3", "d677e0fe2faf"):
        if not json.loads(rows[id]["extra"]).get("location_conflict"):
            errors.append(f"{id}: conflicting location hidden")
    for r in rows.values():
        x = json.loads(r["extra"] or "{}")
        if x.get("scope_review_state") not in {"unreviewed", "reviewed"}:
            errors.append(f"{r['id']}: review state absent")
        if x.get("scope_review_state") == "unreviewed":
            if not x.get("scope_statement", "").startswith(UNREVIEWED_STATEMENT):
                errors.append(f"{r['id']}: unreviewed record claims source geography is absent")
            if any(e.get("field") == "location evidence" for e in x.get("scope_evidence", [])):
                errors.append(f"{r['id']}: placeholder absence presented as evidence")
        if not x.get("inclusion_rule") or not x.get("scope_status"):
            errors.append(f"{r['id']}: federal evidence contract absent")
            break
    assert not errors, "\n".join(errors)
    print(f"federal ledger: {len(EXPECTED)} counterexamples, {len(REMOVED)} removals; all {len(rows)} records carry evidence")


def write_fixtures():
    """Freeze real ledger rows and their complete exported search documents for portable surface checks."""
    c = sqlite3.connect(f"file:{ROOT}/data/build/ledger.db?mode=ro", uri=True)
    c.row_factory = sqlite3.Row
    ledger = [dict(r) for r in c.execute("SELECT * FROM items WHERE level='federal'") if r["id"].rsplit("-", 1)[-1] in EXPECTED]
    ids = {r["id"].rsplit("-", 1)[-1] for r in ledger}
    docs = []
    with (ROOT / "data/build/d1/docs.jsonl").open() as fh:
        for line in fh:
            doc = json.loads(line)
            if any(it["i"] in ids for it in json.loads(doc["items"])["it"]):
                docs.append(doc)
    (ROOT / "tests/fixtures/federal/published-counterexamples.json").write_text(json.dumps({"ledger": ledger, "docs": docs}, indent=2) + "\n")
    print(f"froze {len(ledger)} rows and {len(docs)} complete search documents")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--ledger", action="store_true")
    p.add_argument("--write-fixtures", action="store_true")
    args = p.parse_args()
    if args.ledger or args.write_fixtures:
        check_ledger()
        if args.write_fixtures:
            write_fixtures()
    else:
        from test_federal import main
        main()
