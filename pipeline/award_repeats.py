"""Count repeated PPA printings once, without treating equal prices as identity.

Full contract/PO numbers, matched supplier, CAD price, date and description must
agree. Source-reviewed exceptions are pairs of exact report rows, never a fuzzy
supplier or amount rule. Every other printing stays on the counted record.
"""
import csv
import json
import re
from collections import defaultdict
from datetime import date
from decimal import Decimal
from pathlib import Path

from common import ROOT


def locator(row):
    return (row["source_file"], str(row["page"]), row["row"])


def contract_key(value):
    # Ignore only PO labelling and separator punctuation; keep every identifier.
    value = re.sub(r"\s+", "", value or "").upper()
    value = re.sub(r"(?<=PO)#(?=\d)", "", value)
    value = re.sub(r"^PO(?=\d)", "", value)
    value = re.sub(r"/(?=PO\d)", "", value)
    return "" if value in ("", "N/A", "NA", "-", "TBC", "TBD") else value


def text_key(value):
    return re.sub(r"\W+", " ", (value or "").casefold()).strip()


def compatible_detail(a, b):
    missing = {"", "n a", "na", "not stated"}
    a, b = text_key(a), text_key(b)
    return (a in missing and b in missing) or a == b


def reviewed_pairs():
    with (Path(__file__).with_name("award_repeat_reviews.csv")).open(newline="") as fh:
        return {frozenset(((r["file_a"], r["page_a"], r["row_a"]),
                          (r["file_b"], r["page_b"], r["row_b"]))): r for r in csv.DictReader(fh)}


def decision(a, b, reviews):
    ra, rb = a["_row"], b["_row"]
    reviewed = reviews.get(frozenset((locator(ra), locator(rb))))
    if reviewed:
        # Grouping already requires the same full identifiers, supplier and price.
        how = reviewed["decision"]
        corrected = (reviewed["file_b"], reviewed["page_b"], reviewed["row_b"])
        if how == "correction" and locator(rb) != corrected:
            how = "repeat"  # The corrected printing was encountered first.
        return how, reviewed["evidence"]
    if (ra["award_date"] and ra["award_date"] == rb["award_date"]
            and a.get("buyer_key") and a["buyer_key"] == b.get("buyer_key")
            and compatible_detail(ra["term"], rb["term"])
            and compatible_detail(ra["renewal"], rb["renewal"])
            and text_key(ra["description"]) and text_key(ra["description"]) == text_key(rb["description"])):
        return "repeat", "Same full contract/PO number, matched supplier, buyer, CAD price, printed award date and description."
    return "keep", "The printed dates or descriptions differ; no source-reviewed repeat is recorded."


def count_once(items):
    reviews = reviewed_pairs()
    groups = defaultdict(list)
    kept, repeats = [], []
    for it in items:
        r = it.get("_row")
        if r is None or it.get("amount") is None or it.get("currency") != "CAD" or not it.get("supplier_key"):
            kept.append(it)
            continue
        cno = contract_key(r["contract_no"])
        if not cno:
            kept.append(it)
            continue
        key = (cno, it["supplier_key"], Decimal(str(it["amount"])))
        for first in groups[key]:
            how, why = decision(first, it, reviews)
            if how == "keep":
                continue
            counted, other = (it, first) if how == "correction" else (first, it)
            x = json.loads(counted.get("extra") or "{}")
            old = json.loads(other.get("extra") or "{}")
            x.setdefault("repeat_printings", []).extend(old.get("repeat_printings", []))
            printed = other["_row"]
            x["repeat_printings"].append({
                "source_url": printed["source_url"], "source_file": printed["source_file"],
                "page": int(printed["page"]), "locator": other["locator"],
                "supplier": printed["supplier"], "buyer": printed["public_body"],
                "description": printed["description"], "contract_no": printed["contract_no"],
                "award_date": printed["award_date"], "amount": other["amount"], "term": printed["term"],
                "renewal": printed["renewal"],
                "note": "Shown here for comparison; not added again. " + why,
            })
            counted["extra"] = json.dumps(x)
            repeats.append((printed, counted["_row"], why))
            if how == "correction":
                kept[kept.index(first)] = it
                groups[key][groups[key].index(first)] = it
            break
        else:
            groups[key].append(it)
            kept.append(it)
    return kept, repeats


def write_pair_audit(items, repeats, path=None):
    """All raw pairs within 31 days, before counting once, with both receipts."""
    groups = defaultdict(list)
    for it in items:
        r = it.get("_row")
        amount = it.get("amount")
        if amount is None and it.get("currency") == "USD":
            amount = it.get("amount_original")
        if r and r["award_date"] and amount is not None and it.get("supplier_key"):
            groups[(it["supplier_key"], Decimal(str(amount)), it["currency"])].append(it)
    counted = {locator(r): locator(first) for r, first, _ in repeats}
    def counted_locator(r):
        key = locator(r)
        while key in counted:
            key = counted[key]
        return key

    reviews = reviewed_pairs()
    out = []
    for (supplier, amount, currency), group in sorted(groups.items()):
        for i, a in enumerate(group):
            for b in group[i + 1:]:
                ra, rb = a["_row"], b["_row"]
                days = abs((date.fromisoformat(ra["award_date"]) - date.fromisoformat(rb["award_date"])).days)
                if days > 31:
                    continue
                same_counted = counted_locator(ra) == counted_locator(rb)
                review = reviews.get(frozenset((locator(ra), locator(rb))))
                why = (review["evidence"] if review else
                       "Matching full identifiers and award details; both source printings remain on the counted record." if same_counted else
                       "Different full contract/PO numbers; equal amounts and nearby dates do not establish a repeat." if contract_key(ra["contract_no"]) != contract_key(rb["contract_no"]) else
                       "Different printed award details; kept separately.")
                rec = {"supplier_key": supplier, "amount": str(amount), "currency": currency,
                       "days_apart": days, "decision": "count once" if same_counted else "keep both", "evidence": why}
                for label, r in (("a", ra), ("b", rb)):
                    for field in ("supplier", "public_body", "award_date", "contract_no", "description", "term", "source_file", "source_url", "page", "row", "award_on_page"):
                        rec[f"{field}_{label}"] = r[field]
                out.append(rec)
    path = Path(path) if path is not None else ROOT / "docs/award-pairs.csv"
    fields = ["supplier_key", "amount", "currency", "days_apart", "decision", "evidence"]
    fields += [f"{field}_{label}" for label in ("a", "b") for field in
               ("supplier", "public_body", "award_date", "contract_no", "description", "term", "source_file", "source_url", "page", "row", "award_on_page")]
    with path.open("w", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=fields, lineterminator="\n")
        w.writeheader()
        w.writerows(out)
    return out
