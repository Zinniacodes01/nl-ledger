# Four MCP tools: real-client proof

Recorded 30 September 2026 against `http://localhost:8793/mcp`, using `./dev.sh 8793` and the complete local ledger (143,042 records). This is the actual site Worker and built assets, not an MCP handler stub. Production was not deployed or changed.

## Implementation and counting

- `get_pay` and `/pay/` share `src/paydata.mjs`; published employer totals, title counts, overtime and severance retain missing years and source files. The tool returns no individuals.
- `get_body` and `/body/` share `src/bodydata.mjs`; the page's combined CAD record values are explicitly labelled as potentially overlapping, never money paid. Additional source/year/currency partitions retain coverage and location review.
- `tax_receipt` calls the page's `computeReceipt`, including CPP/EI, enhanced CPP deductions, basic personal credit and low-income reduction. It uses the same whole-dollar income normalization and department spending shares. It is an employment-income illustration, not a personal assessment.
- `get_totals` shares `lib/totals.mjs` with the homepage rankings. Build-time rollups cover all matching counted-once ledger records, not a search window. Source, native currency, missing/zero amounts, overlap exclusions and location/counting evidence stay explicit. Contract/grant deduplication remains the pipeline's existing reviewed rule; no new matching or inferred exchange rate is introduced. Named-buyer department queries are distinct from program accounts.
- Published supplier aliases resolve to retained IDs, without joining different suppliers. The initial client run found the body's `Pennecon Industrial Ltd` spelling versus the canonical `Pennecon Industrial Limited`; the final client run and HTTP check prove the shared ID.

## Checks

Passing: `node site/check-mcp.mjs`, `node site/check-mcp-live.mjs http://localhost:8793`, `node site/check-claims.mjs`, `node site/check-federal.mjs --built`, `node site/check-search.mjs`, `./site/check.sh` (409 built pages), touched JavaScript syntax and `git diff --check`. The new portable MCP check is in CI. No full pipeline run, source refresh, D1 upload, deployment or merge was performed.

The live check independently reads ledger SQL and actual page HTML for the pay employers, public bodies, five receipt incomes, filtered rankings, source totals and published supplier alias. Portable checks cover all sample employers and bodies, all source/currency totals, home ranking parity, ambiguous identities, invalid arguments, absent data, published zero and foreign currency.

Cold review fixes: source links now retain the selected ranking filters; unknown names have bounded choices; missing ranking assets cannot masquerade as no records; employer listing honours its year filter; published-name aliases remain distinct by ID; the MCP asset cache has a byte limit as well as a file limit.

## Real MCP client

Claude Code was invoked with a temporary config containing only this HTTP server:

```json
{"mcpServers":{"nl-ledger":{"type":"http","url":"http://localhost:8793/mcp"}}}
```

```sh
claude -p --mcp-config /private/tmp/nl-ledger-mcp-client.json --strict-mcp-config \
  --allowedTools mcp__nl-ledger__get_pay mcp__nl-ledger__get_body \
    mcp__nl-ledger__tax_receipt mcp__nl-ledger__get_totals \
  --tools '' --permission-mode dontAsk --no-session-persistence \
  --output-format stream-json --verbose < /private/tmp/nl-ledger-questions.txt
```

The trace confirms exactly three calls per new tool, twelve total, with no tool errors and a successful client result. Only these read-only MCP tools were allowed. No other assistants, shell tools, search-result arithmetic or configured MCP servers supplied the answers. The local trace is `/private/tmp/nl-ledger-client-final.jsonl` (not committed).

Trace SHA-256: `10bc5a4312f9ecd968568a133d2e0bb2f94b716bdc571726695d325aa6d965cc`.

## Twelve ordinary questions

- Q1 (get_pay): How many Memorial University employees were on the over-$100,000 list in 2025, how much was disclosed in total, and what was the most common title?
- Q2 (get_pay): What did the Core public service's 2024 over-$100,000 list total, including how much overtime and severance?
- Q3 (get_pay): How much pay did NL Health Services disclose for 2023? Is a missing year zero?
- Q4 (get_body): What values are on record for NL Health Services by year and source, and who are its three largest suppliers?
- Q5 (get_body): What is on record for Newfoundland and Labrador Hydro, and who are its largest suppliers?
- Q6 (get_body): What is on record for Health Canada? Can its contract values and notices be called money spent in Newfoundland and Labrador?
- Q7 (tax_receipt): If I earn $55,000 from one job, what is my estimated provincial income tax, and its illustrated share for the three biggest departments?
- Q8 (tax_receipt): What does the receipt estimate for $25,000 of employment income, including the low-income assumptions?
- Q9 (tax_receipt): What does the receipt estimate for $100,000 of employment income and the largest department's share?
- Q10 (get_totals): Who are the top three suppliers in NL Health Services' provincial award records dated 2025, and their award values?
- Q11 (get_totals): Show Pennecon Industrial Ltd's provincial award values by year, using that published name from the Hydro page. State the resolved supplier identity.
- Q12 (get_totals): What totals do the site's record sources show? Can I add provincial awards, federal contracts, grants, CanadaBuys notices and Public Accounts payments into one provincial spending figure? Show each source separately, preserving native currencies and explaining the exclusions.

## Client answers

The following answers are the client's output. Its shorthand “phase-out above $23,928” uses net employment income after enhanced CPP deductions in the calculator, not gross income. Location evidence about a jurisdiction's receipt never establishes its later expenditure. Figures were checked by the independent SQL/page readback described above. Production links below cite existing source pages; these new tools are available only on the local branch until deployment.

Every figure below came from public records that automated scripts gathered and combined. Nobody has checked them by hand, so open the source before relying on any number.

**Q1.** Memorial University's 2025 over-$100,000 list has **1,281 people** and **$186,227,000** disclosed, including $520,600 of overtime and $0 of severance. The most common title is **Associate Professor**, with 374 people totalling $54,318,200 (about $145,236 on average). The list covers only pay above $100,000, not the whole payroll, and the publisher rounds amounts to $100. Source: https://www.gov.nl.ca/exec/tbs/files/Memorial-University-Compensation-Disclosure-2025.xlsx · page: https://nlledger.ca/pay/memorial-university/

**Q2.** The Core public service's 2024 list has **4,252 people** and **$488,663,800** in total, including **$10,562,000 of overtime** and **$304,200 of severance**. The most common title is Classroom Teacher, with 2,062 people. This is published pay above $100,000 only, not total payroll. Source: https://www.gov.nl.ca/exec/tbs/files/Core-Public-Service-Compensation-Disclosure-2024.xlsx · page: https://nlledger.ca/pay/core-public-service/

**Q3.** NL Health Services' 2023 pay is **missing**: the people count, total, overtime and severance are all blank because the file is not available. The disclosure link (https://www.gov.nl.ca/exec/tbs/files/Newfoundland-and-Labrador-Health-Services-Compensation-Disclosure.xlsx) returned a 404 from the 2023 listing (https://www.gov.nl.ca/exec/tbs/home/publications/compensation-disclosure/compensation-disclosure-2023/). **A missing year is not zero people or zero pay.** It means no published list was found. The latest year on record is 2025. Page: https://nlledger.ca/pay/nl-health-services/

**Q4.** NL Health Services has 767 provincial award records (source "ppa"), totalling **$385,325,757.58** in reported award values, dated 2004-09-01 to 2026-08-24. By year:

| Year | Records | Award value |
|---|---|---|
| 2004 | 1 | $75,694.00 |
| 2022 | 2 | $2,588,959.12 |
| 2023 | 119 | $139,033,315.46 |
| 2024 | 294 | $97,361,896.16 |
| 2025 | 226 | $68,514,475.83 |
| 2026 | 125 | $77,751,417.01 |

The 2023 count includes 7 records with no supported dollar value: 6 with text amounts and 1 in USD. They are left out of the total, not counted as zero. The three largest suppliers are:
- **Microsoft Canada Inc.:** $110,018,917.68
- **GE Healthcare Canada:** $28,306,495.71
- **TxtSquad:** $15,445,000.00

These are award values, not payments, and the years are award dates, not spending years. Page: https://nlledger.ca/body/nl-health-services/ · example source: https://www.gov.nl.ca/ppa/files/Contract-and-Exception-Awards-Aug-16-31-2023.pdf

**Q5.** Newfoundland and Labrador Hydro has 1,052 provincial award records, all source "ppa", totalling **$345,846,731.74**, dated 2020-12-01 to 2026-08-14. By year:

| Year | Award value |
|---|---|
| 2020 | $275,877.30 |
| 2021 | $33,857,161.90 |
| 2022 | $26,502,047.37 |
| 2023 | $30,168,577.14 |
| 2024 | $79,285,751.65 |
| 2025 | $105,138,632.56 |
| 2026 | $70,618,683.82 |

The largest suppliers are:
- **Corner Brook Pulp and Paper Limited:** $136,525,000.00
- **Right Coast Wind Corp.:** $45,950,000.00
- **Hydro Quebec:** $25,957,876.00
- **Right Coast Wind Limited Partnership:** $16,200,000.00
- **Andritz Hydro Canada Inc.:** $12,940,477.71

These are award values, not payments. Page: https://nlledger.ca/body/newfoundland-and-labrador-hydro/ · example source: https://www.gov.nl.ca/ppa/files/Contract-Award-Report-2025-08-01-To-2025-08-15-REVISED.pdf

**Q6.** Health Canada has 56 federal records worth **$775,198,649.77** in reported values. The page shows no CanadaBuys award notices.
- **Federal contracts:** 8 records, $255,629,759.77.
- **Federal grants:** 48 records, $519,568,890.00.

The largest recipients are:
- **NL Department of Health and Community Services:** $490,553,053.00 (13 records)
- **SC2.0 Stepped Care Solutions Inc.:** one contract of $255,261,335.35
- **Choices for Youth:** $10,000,000.00

**No, these cannot be called money spent in Newfoundland and Labrador.** These are contract and agreement values, not payments. A payee's address only selects a record. It does not show where the work or benefit happened, and no NL share is worked out. The $255.26 million contract was reviewed and found to be national, multi-place or elsewhere. The other contracts and all the grants are unreviewed for location. Page: https://nlledger.ca/body/health-canada/ · example: https://search.open.canada.ca/contracts/record/hc-sc,C-2023-2024-Q3-00581

**Q7.** On $55,000 from one job, the estimated provincial income tax is **$4,074.10**. Its illustrated share for the three biggest departments is:
- **Health and Community Services:** $1,765.00 (43.3%)
- **Transportation and Infrastructure:** $514.72 (12.6%)
- **Consolidated Fund Services:** $504.99 (12.4%)

The estimate uses 2025 tax rates and 2024-25 spending shares. It assumes a single person and leaves out federal tax, sales tax and other credits. The shares show how spending divides up, not where your own tax went. Page: https://nlledger.ca/receipt/?income=55000 · tax rates: https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/last-year.html · spending: https://www.gov.nl.ca/exec/tbs/files/Cash-Statements-2025-with-signed-letter-Final.pdf

**Q8.** On $25,000 of employment income, the estimated provincial income tax is **$205.33**. Health and Community Services' illustrated share is $88.95. The receipt applies the single-person low-income tax reduction from form NL428 (2025):
- **Base reduction:** $997
- **Phase-out:** 16% of income above $23,928

It also uses the $11,067 basic personal amount, base CPP and EI credits, and the enhanced CPP deduction. It assumes one job and no age, pension or other credits. Page: https://nlledger.ca/receipt/?income=25000 · method: https://nlledger.ca/method/receipt/

**Q9.** On $100,000 of employment income, the estimated provincial income tax is **$10,569.66**. The largest department, **Health and Community Services** (43.3% of 2024-25 spending), has an illustrated share of **$4,579.03**. The same single-person, one-job assumptions apply, and this is an illustration, not a trace of where your tax went. Page: https://nlledger.ca/receipt/?income=100000 · spending: https://www.gov.nl.ca/exec/tbs/files/Cash-Statements-2025-with-signed-letter-Final.pdf

**Q10.** The top three suppliers in NL Health Services' provincial award records dated 2025 are:
- **Roche Diagnostics:** $5,483,316.92 (2 records)
- **Varian Medical Systems:** $5,401,177.00 (1 record)
- **GE Healthcare Canada:** $4,538,741.35 (6 records)

There are 179 suppliers in all. These are award values, not payments. Records: https://nlledger.ca/search/?ds=ppa&y=2025&s=6c2d50627b&b=5b6370d161 · example source: https://www.gov.nl.ca/ppa/files/Contract-Award-Report-2025-06-16-To-2025-06-30.pdf

**Q11.** The name "Pennecon Industrial Ltd" resolved to **supplier id 3d73252965**, the same id the Hydro page links to. It has provincial award values in **2025 only: 2 records, $3,180,091.63**. No other year has provincial award records for this supplier id. That says nothing about other spellings of Pennecon, which may sit under other ids. Records: https://nlledger.ca/search/?ds=ppa&y=2025&s=3d73252965 · supplier page: https://nlledger.ca/supplier/3d73252965/ · source: https://www.gov.nl.ca/ppa/files/Contract-Award-Report-2025-06-16-To-2025-06-30.pdf

**Q12.** **No, these cannot be added into one provincial spending figure.** The sources measure different things:
- awards are commitments, not payments
- federal values follow the payee's address, not where the money was used
- CanadaBuys notices and Public Accounts payments can overlap contracts and grants, so they are kept out of the summary (no single record is claimed to be a duplicate)
- provincial accounts and major transfers sit outside these record totals

Each source, kept in its own currency:

| Source | Records | Value | In summary? |
|---|---|---|---|
| Provincial awards (ppa), CAD | 6,237 | $1,372,054,508.65 | Yes |
| Provincial awards, USD | 60 | missing (no supported CAD value) | No |
| Provincial awards, text amounts | 31 | missing | No |
| Federal contracts, CAD | 8,532 | $2,547,127,660.51 | Yes |
| Federal grants, CAD | 29,207 | $8,430,775,591.69 | Yes |
| CanadaBuys notices, CAD | 521 | $830,019,361.38 | No (overlap) |
| CanadaBuys notices, unstated currency | 13 | 394,250 (currency unstated) | No (overlap) |
| CanadaBuys notices, USD | 1 | US$473,000 | No (overlap) |
| Public Accounts professional services payments (pa_pss), CAD | 357 | $683,854,665.00 | No (overlap) |
| Public Accounts transfer payments (pa_tp), CAD | 2,484 | $11,889,648,933.00 | No (overlap) |
| Pay over $100,000 (sunshine), CAD | 34,493 | $4,406,623,501.22 | Yes |
| Minister expense claims, CAD | 2,585 | $3,424,682.22 | Yes |
| MHA allowance expenses, CAD | 58,521 | $7,057,632.94 | Yes |

Location review is thin for the federal sources:
- **Contracts:** reviewed as NL for 2 records worth $27,716,964.46. The other $2.23 billion is unreviewed.
- **Grants:** about $2.13 billion is summed amendment changes, not separate agreements.
- **Transfer payments:** $9,079,098,279 is reviewed as NL. The rest is unreviewed.

Some record dates look odd, such as 1899, 2035 and 2040. Even the "included" summary is not a deduplicated spending total; for the province's actual spending, the Public Accounts are the source. Search pages: https://nlledger.ca/search/?ds=ppa (each source uses its own `ds=` value) · method: https://nlledger.ca/method/federal/


## Finding 1: bound MCP request work

Security follow-up in `site/lib/mcp.mjs`: all JSON arrays are rejected before dispatch (HTTP 400, JSON-RPC `-32600`), enforcing one RPC per HTTP request. POST bodies are limited to 65,536 actual streamed bytes, counted before decoding and JSON parsing. Crossing the limit cancels the reader and returns HTTP 413 (`-32600`), without trusting `Content-Length` or waiting for the rest of the body.

`node site/check-mcp.mjs` first failed against the old handler on its accepted one-element batch, then passed with the fix. Focused regressions cover empty/one/two/100-element batches, oversized bodies with no or falsely small Content-Length, cancellation at the first chunk crossing the cap, UTF-8 byte counting, a body exactly at the cap, malformed/empty JSON and normal notifications. Rejected requests make zero tool-data reads. Existing federal MCP checks also pass.

Real local HTTP proof with `./dev.sh 8793` and `node site/check-mcp-live.mjs http://localhost:8793`: one two-call `tools/list` batch returned HTTP 400, one chunked 65,537-byte body without Content-Length returned HTTP 413, and a normal `ping` returned HTTP 200 with an empty result. The same run passed the full-data MCP/page/SQL readback checks. No heavy batch or flood was attempted.

**Deployment verification pending:** production was not deployed or probed for this fix. After an authorized deployment, verify one small rejected batch on `https://nlledger.ca/mcp`; the local proof is not a claim about the currently deployed Worker. No merge or deployment was performed.
