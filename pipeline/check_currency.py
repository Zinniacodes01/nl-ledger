"""Parse hostile and ordinary source currency fields without writing pipeline data."""
import csv
import io
import json
import tempfile
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch

import parse_federal as parser

fixture = json.loads((Path(__file__).resolve().parent.parent / "tests/fixtures/federal/published-counterexamples.json").read_text())
source = next(json.loads(row["extra"])["source_fields"] for row in fixture["ledger"] if row["dataset"] == "canadabuys")
field = "contractCurrency-contratMonnaie"
marker = '<em data-audit="currency">USD</em>'
cases = [("", "unstated"), ("CAD", "CAD"), ("USD", "USD"), (" CAD ", "CAD"), (marker, "unstated"), ("USDD", "unstated"), ("usd", "unstated")]
rows = []
for index, (original, expected) in enumerate(cases):
    row = {**source, field: original, "referenceNumber-numeroReference": f"currency-check-{index}"}
    rows.append(row)
with tempfile.TemporaryDirectory(prefix="nl-currency-") as folder:
    directory = Path(folder)
    with (directory / "awardNoticeComplete.csv").open("w", newline="") as output:
        writer = csv.DictWriter(output, fieldnames=list(source))
        writer.writeheader()
        writer.writerows(rows)
    with patch.object(parser, "FED", directory), patch.object(parser, "write") as write, redirect_stdout(io.StringIO()):
        parser.canadabuys()
    filename, parsed = write.call_args.args
    assert filename == "canadabuys_nl.csv"
    assert len(parsed) == len(cases)
    for row, (original, expected) in zip(parsed, cases):
        assert row["currency"] == expected, f"invalid currency was trusted: {original!r}"
        assert json.loads(row["source_fields"])[field] == original, "original currency evidence lost"
print(f"currency parsing: {len(cases)} raw CSV cases; validated display codes and unmodified source evidence")
