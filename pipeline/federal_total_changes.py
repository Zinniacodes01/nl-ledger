"""List every changed source/body/supplier/year/method/flag amount from two ledgers.

No source changes or exchange rates: before values are exactly the site's previous
numeric totals, including its erroneous CAD labels on foreign/unstated notices.
"""
import argparse
import csv
import json
import sqlite3
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

BUYER_SETS = {"ppa", "fed_contract", "fed_grant", "canadabuys", "paradise", "stjohns"}
OVERLAP = {"pa_pss", "pa_tp", "canadabuys"}


def snapshot(path):
    c = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    c.row_factory = sqlite3.Row
    totals = defaultdict(Decimal)
    items = {}
    for r in c.execute("SELECT * FROM items"):
        items[r["id"]] = r
        a = Decimal(str(r["amount"])) if r["amount"] is not None and r["currency"] == "CAD" else Decimal(0)
        year = (r["date"] or "")[:4] or r["fiscal_year"]
        totals[("source", r["dataset"])] += a
        totals[("source/year", r["dataset"], year)] += a
        if r["dataset"] in BUYER_SETS:
            body = r["buyer_key"]
            for key in (("body", body), ("body/source", body, r["dataset"]), ("body/year", body, (r["date"] or "")[:4]),
                        ("body/supplier", body, r["supplier_key"])):
                totals[key] += a
            if r["dataset"] in {"ppa", "fed_contract", "canadabuys"}:
                totals[("body/method", body, r["method"])] += a
        if r["supplier_key"] and r["dataset"] != "sunshine":
            supplier = r["supplier_key"]
            totals[("supplier/source", supplier, r["dataset"])] += a
            label = "excluded" if r["dataset"] in OVERLAP else "included"
            totals[("supplier", supplier, label)] += a
            totals[("supplier/body", supplier, r["buyer_key"], label)] += a
            if label == "included":
                totals[("supplier/year", supplier, year)] += a
        if r["dataset"] in {"fed_contract", "fed_grant"}:
            totals[("home/former-combined-federal-record-values",)] += a
    for f in c.execute("SELECT flag, item_id FROM flags WHERE item_id IS NOT NULL"):
        r = items[f["item_id"]]
        a = Decimal(str(r["amount"])) if r["amount"] is not None and r["currency"] == "CAD" else Decimal(0)
        totals[("pattern", f["flag"])] += a
    for r in c.execute("SELECT department, fiscal_year, gross FROM dept_summary WHERE kind='actual'"):
        totals[("provincial-actuals", r["fiscal_year"])] += Decimal(str(r["gross"]))
    return totals


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--before", required=True, type=Path)
    p.add_argument("--after", required=True, type=Path)
    p.add_argument("--output", required=True, type=Path)
    args = p.parse_args()
    before, after = snapshot(args.before), snapshot(args.after)
    changed = []
    for key in sorted(before.keys() | after.keys(), key=lambda k: json.dumps(k)):
        a, b = before[key].quantize(Decimal(".01")), after[key].quantize(Decimal(".01"))
        if a != b:
            changed.append([key[0], " / ".join(str(x or "not stated") for x in key[1:]), str(a), str(b), str(b - a)])
    with args.output.open("w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["summary", "published identity or source", "before numeric total (previous CAD label)", "after supported CAD total", "change"])
        w.writerows(changed)
    print(f"{len(changed)} changed totals written to {args.output}")
    for row in changed:
        if row[0] in {"source", "pattern", "provincial-actuals", "home/former-combined-federal-record-values"}:
            print(*row, sep=" | ")
    assert not any(row[0] == "provincial-actuals" for row in changed), "Provincial actuals moved"


if __name__ == "__main__":
    main()
