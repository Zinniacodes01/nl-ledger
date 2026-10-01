# Provincial award printings: source review

Checked 30 September 2026 against the cached government reports. The cache manifest keeps each source URL and SHA-256. This review changes counting of PPA awards only; supplier matching is a separate task.

## Microsoft: keep the two separately numbered published awards

Both entries print **$53,689,740**, an award date of **19 May 2023**, a five-year term and a sole-source clause. Read directly from the printed PDF pages:

| Report and printed line | Buyer | Supplier and location | Description | Complete contract / PO identifiers |
|---|---|---|---|---|
| [16–30 June 2023, page 2, award 6](https://www.gov.nl.ca/ppa/files/Contract-and-Exception-Awards-June-16-30-2023-1.pdf#page=2) | NL Health Services - Digital Health | Microsoft Canada Inc., Mississauga, ON | Microsoft Volume Licensing Agreement | 2023-3532 / po 018905 |
| [16–30 April 2024, page 2, award 14](https://www.gov.nl.ca/ppa/files/Contract-Award-Report-2024-04-16-To-2024-04-30-KD-Edits.pdf#page=2) | NL Health Services - Digital | Microsoft, Toronto, ON | Licensing of Eastern Health's Microsoft Office Suite of software | 2023-3805 / PO 018835 |

The complete contract identifiers and PO identifiers differ. Neither report labels the other printing as a correction or repeat. The source therefore supports keeping **two separately numbered published awards**, totalling **$107,379,480**. No Microsoft amount changes and no publisher issue is attached to this pair.

These award tables are not the underlying agreements. They do not establish whether the two entries cover distinct agreements or one agreement reported under different identifiers. That question remains unresolved from the published reports; removing $53,689,740 would require a source that links the identifiers. Distinct identifiers alone do not prove two distinct agreements. The site makes no new assertion about that question.

## Rule and complete class audit

The audit examines the **raw retained-report rows before de-duplication**, including printings already counted once. It groups by the existing supplier-matching result, exact decimal amount and currency, then lists every unordered pair with printed award dates at most **31 days apart**. There is no amount floor and no buyer filter. The date comparison uses the award date, not the publication date: Microsoft's reports were published months apart. USD-only prices are checked in their original currency (no qualifying USD pair was found); no currency conversion or USD removal is introduced. Missing award dates and unpriced prose/ranges are not comparable; they remain in the data. Thirty-one days includes a full month and two fortnightly publication cycles; it is a candidate window, never an automatic counting rule.

Every pair, its action and both source URLs, page numbers, award positions, table rows, buyers, descriptions, identifiers and terms are in [award-pairs.csv](award-pairs.csv). The large school-transport batches are individual pairs: their COV contract identifiers differ even when prices, dates and descriptions agree. Repeated equipment purchases also retain different full identifiers. Named wind farms, campuses, zones, vessels, project/requisition numbers and maintenance periods provide additional distinctions. None is removed on price/date similarity.

The automatic rule requires a **complete contract/PO identifier**, a matched supplier, the same buyer, CAD price, printed award date and normalized description, and compatible printed terms and renewal options. It ignores whitespace, a PO label before an identifier, `#` before PO digits and a `/` separator before a PO label; it keeps all identifier digits, including leading zeroes. It does not strip a second PO identifier or match on only the contract's first component. An exact pair of report rows can override date/description/buyer differences only through a source-backed entry in [award_repeat_reviews.csv](../pipeline/award_repeat_reviews.csv). The full identifiers, supplier and price must still agree. No fuzzy supplier matching is introduced here.

Every counted-once award keeps the other printing's supplier, buyer, description, full identifiers, date, term, exact price, source page and explanation on its record. The Sources publisher report card lists each counted-once printing. A printing explicitly described as a correction supplies the displayed details; the earlier printing remains visible. Equal amounts/dates with different full identifiers remain separate, including Microsoft, Deloitte Health Connect, Stantec Goulds flow monitoring and Island Office Furniture Office Remodel. The reports do not link those identifiers, so this review does not invent a link.

## Changes found beyond Microsoft

- **Olympus, Acrow, KPMG and IBM:** the full identifiers match after only punctuation/PO-label differences. Source reviews count these four pairs once and preserve both receipts.
- **Brenntag and Clarion:** the previous rule discarded the second line solely because its number, supplier and price matched. The source prints different products (chlorine and soda ash) and zones (Western and Central); both lines are now counted.
- **Hatch:** the later description explicitly says it corrects the August 16 posting. Its corrected Hydrology Study description replaces the earlier Churchill Falls description, at the same $115,000 value. Both receipts remain visible.
- **Canadian Health Labs, Brandt and Domtar:** auditing all 36 previous removals, including three pairs outside the 31-day window, found different dates/terms. These are restored because the sources do not establish a repeat. Canadian Health Labs has a seven-month term dated 4 July 2022 and a one-year term dated 27 February 2023, under contract 2022-2638; the previous rule discarded the seven-month entry. Brandt's inspection dates differ by 151 days; Domtar's paper dates differ by 51 days. Their full details are in the supplementary table below. The same contract number and price do not justify discarding a dated renewal or purchase.

[check_awards.py](../pipeline/check_awards.py) parses the two actual Microsoft PDFs in CI and pins keeping both. It also checks every reviewed pair, the five restored pairs, school-transport batches, full PO identities, leading zeroes, changed dates, products, buyers, terms, renewal options and currency, and preservation of multiple receipts.

## Source-transcription follow-up

After the independent review, fetched 69 relevant government PDFs with ordinary Chrome request headers. Every response was HTTP 200 and its SHA-256 matched both the cache and manifest. Checked all 221 unique source rows labelled in the original PR’s pair audit, award-row fixtures and prose, on 102 pages: independent Poppler text located suppliers and complete identifiers in physical table rows, and their award positions agreed. Visually read the five missing-buyer pages and Canadian Health Labs page 2. No additional award-position error was found after correcting Canadian Health Labs: award 13 is 4 July 2022; award 12 is 27 February 2023.

All five blank buyers in the retained PPA inputs were extraction omissions, not blank printed cells. Narrow overrides require the exact file, page, table row, complete identifier and supplier; they only replace an empty parsed buyer. Real PDF fixtures pin each buyer, price and award position and prove the overrides do not apply to another report.

| Supplier | Source | Printed buyer | Extraction problem |
|---|---|---|---|
| VitalSine | [1–15 April 2026, page 1, award 19](https://www.gov.nl.ca/ppa/files/2026-Apr-1-15-Contract-Awards-Report.pdf#page=1) | City of St. John's | Broken left border |
| Boland Marine & Industrial LLC | [16–30 June 2021 exceptions, page 1, award 13](https://www.gov.nl.ca/ppa/files/June-16th-30th-2021Exceptions.pdf#page=1) | Newfoundland and Labrador Hydro | Buyer cell spans both Boland price rows |
| Infor (Canada) Ltd | [16–30 September 2021, page 4, award 8](https://www.gov.nl.ca/ppa/files/Contract-and-Exceptions-Awards_-September-16th-30th-2021.pdf#page=4) | Newfoundland and Labrador Centre for Health Information | Missing bottom border |
| NL Kubota Limited | [1–15 July 2026, page 2, award 10](https://www.gov.nl.ca/ppa/files/2026-July-1-15-Contract-Awards-Report.pdf#page=2) | City of St. John's | Broken left border |
| Dynavox Canada | [16–31 August 2026, page 1, award 1](https://www.gov.nl.ca/ppa/files/2026-August-16-31-Contract-Awards-Report.pdf#page=1) | Department of Education and Early Childhood Development | Missing top-left border |

VitalSine's counted record already had the correct buyer: its other-printing receipt and review evidence now agree with the source, without changing its $34,071.81 value. The four additional fixes restore buyer attribution on counted records. No award value, record count, counting decision, dataset, supplier, year or procurement-method monetary total changes from these transcription fixes. Buyer subtotals necessarily move the four values from the unassigned buyer to their printed buyers; they are listed separately below. The counting-comparison tables retain the before/after inputs used for the original counting review.

### Buyer attribution movements from the transcription fixes

| PPA public body | Before transcription fixes | After transcription fixes | Change |
|---|---:|---:|---:|
| City of St. John's | $39,064,419.97 | $39,078,313.97 | $13,894.00 |
| Department of Education and Early Childhood Development | $27,336,733.44 | $27,349,297.92 | $12,564.48 |
| NL Centre for Health Information | $36,992,861.24 | $37,109,994.61 | $117,133.37 |
| Newfoundland and Labrador Hydro | $345,622,343.97 | $345,846,731.74 | $224,387.77 |
| Public body not named | $367,979.62 | $0.00 | -$367,979.62 |

These attribution movements sum to $0.00. All 143,047 line-item IDs, amounts, currencies, suppliers, award dates, fiscal years and procurement methods match the pre-fix ledger exactly. Only the four buyer attributions and VitalSine receipt/evidence changed. The process rebuild, award tests, 411-page site build, guardrails and financial claims checks passed. The exported VitalSine record rendered with the printed City of St. John's buyer and correct April page-1 receipt; its built Sources entry uses the corrected evidence.

## Verification and exact movements

The original and revised build rules were run against identical clean source inputs and supplier-matching code. Tables below are generated from their line items using decimal arithmetic. They list every changed dataset, supplier, buyer, award year, fiscal year and procurement-method total; these are award values, not payments. Program spending, budget, payroll, federal figures and tax calculations are unaffected by the counting change. The complete pair audit can be regenerated by `build.py`; the process rebuild, site build, guardrails, financial claims check and award checks are recorded in the PR.

## Audit counts

318 pairs (287 same-date; 31 near-date): 35 count once, 283 keep both. Excluding Microsoft: 317 other pairs, 35 count once and 282 keep both. The three supplementary outside-window pairs were all restored. In total, 35 repeated printings are counted once (6363 raw rows become 6328 counted records); each other printing remains visible.


### Dataset totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| ppa | $1,358,312,018.08 | $1,372,054,508.65 | $13,742,490.57 |

### PPA supplier subtotals

| Total | Before | After | Change |
|---|---:|---:|---:|
| acrow | $56,962.00 | $28,481.00 | -$28,481.00 |
| brandt tractor | $979,444.80 | $997,844.80 | $18,400.00 |
| brenntag canada | $1,653,580.28 | $1,673,308.28 | $19,728.00 |
| canadian health labs | $57,750,000.00 | $71,250,000.00 | $13,500,000.00 |
| clarion medical technologies | $440,000.00 | $880,000.00 | $440,000.00 |
| domtar | $87,701.94 | $109,226.94 | $21,525.00 |
| ibm canada | $1,571,624.64 | $1,501,933.21 | -$69,691.43 |
| kpmg llp | $241,000.00 | $157,875.00 | -$83,125.00 |
| olympus | $175,437.74 | $99,572.74 | -$75,865.00 |

### Supplier page included totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| acrow | $56,962.00 | $28,481.00 | -$28,481.00 |
| brandt tractor | $979,444.80 | $997,844.80 | $18,400.00 |
| brenntag canada | $1,653,580.28 | $1,673,308.28 | $19,728.00 |
| canadian health labs | $57,750,000.00 | $71,250,000.00 | $13,500,000.00 |
| clarion medical technologies | $440,000.00 | $880,000.00 | $440,000.00 |
| domtar | $89,224.89 | $110,749.89 | $21,525.00 |
| ibm canada | $1,571,624.64 | $1,501,933.21 | -$69,691.43 |
| kpmg llp | $241,000.00 | $157,875.00 | -$83,125.00 |
| olympus | $175,437.74 | $99,572.74 | -$75,865.00 |

### PPA public-body totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| Department of Digital Government and Service NL | $742,194.33 | $760,594.33 | $18,400.00 |
| Department of Government Services | $176,285.40 | $197,810.40 | $21,525.00 |
| NL Health Services | $384,955,449.01 | $385,325,757.58 | $370,308.57 |
| Public Procurement Agency | $10,611,888.23 | $10,500,282.23 | -$111,606.00 |
| Town of Gander | $5,360,993.07 | $5,380,721.07 | $19,728.00 |
| Western Health (regional health authority) | $47,964,008.93 | $61,388,143.93 | $13,424,135.00 |

### PPA award-year totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| 2021 | $120,255,812.53 | $120,068,341.53 | -$187,471.00 |
| 2022 | $203,570,435.81 | $217,070,435.81 | $13,500,000.00 |
| 2023 | $272,399,612.07 | $272,419,340.07 | $19,728.00 |
| 2024 | $238,774,674.11 | $238,793,074.11 | $18,400.00 |
| 2025 | $260,619,781.66 | $260,550,090.23 | -$69,691.43 |
| 2026 | $243,457,208.18 | $243,918,733.18 | $461,525.00 |

### PPA fiscal-year totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| 2020-21 | $65,561,301.40 | $65,485,436.40 | -$75,865.00 |
| 2021-22 | $120,314,817.75 | $120,203,211.75 | -$111,606.00 |
| 2022-23 | $219,588,163.01 | $233,088,163.01 | $13,500,000.00 |
| 2023-24 | $262,368,863.94 | $262,406,991.94 | $38,128.00 |
| 2025-26 | $287,423,437.41 | $287,353,745.98 | -$69,691.43 |
| 2026-27 | $168,190,990.21 | $168,652,515.21 | $461,525.00 |

### PPA procurement-method totals

| Total | Before | After | Change |
|---|---:|---:|---:|
| Emergency | $200,101,505.44 | $213,601,505.44 | $13,500,000.00 |
| Limited call | $147,871,615.07 | $147,765,983.64 | -$105,631.43 |
| Not stated | $5,544,703.74 | $5,548,097.74 | $3,394.00 |
| Sole source | $978,152,590.81 | $978,497,318.81 | $344,728.00 |

### Pattern totals

| Pattern | Items before → after | Before | After | Change |
|---|---:|---:|---:|---:|
| emergency | 352 → 353 | $200,101,505.44 | $213,601,505.44 | $13,500,000.00 |
| late-publication | 379 → 380 | $160,963,123.58 | $174,463,123.58 | $13,500,000.00 |
| no-competition | 5656 → 5658 | $1,407,423,486.16 | $1,421,268,214.16 | $13,844,728.00 |
| repeat-sole-source | 1426 → 1426 | $642,715,728.12 | $642,620,456.12 | -$95,272.00 |
| vague-description | 592 → 593 | $48,301,514.73 | $48,321,242.73 | $19,728.00 |

### Supplementary previous removals beyond 31 days

| Supplier | Source A | Source B | Printed distinction / action |
|---|---|---|---|
| Canadian Health Labs | [Contract-and-Exception-Awards-March-1st-15th-2023.pdf, p. 2, award 13](https://www.gov.nl.ca/ppa/files/Contract-and-Exception-Awards-March-1st-15th-2023.pdf#page=2) | [Contract-and-Exception-Awards-March-1st-15th-2023.pdf, p. 2, award 12](https://www.gov.nl.ca/ppa/files/Contract-and-Exception-Awards-March-1st-15th-2023.pdf#page=2) | 4 July 2022, seven months, one-year renewal option / 27 February 2023, one year, no option. Keep both. |
| Brandt | [Contract-and-Exception-Awards-November-1-15-2023.pdf, p. 1, award 4](https://www.gov.nl.ca/ppa/files/Contract-and-Exception-Awards-November-1-15-2023.pdf#page=1) | [Contract-Award-Report-2024-03-16-To-2024-03-31-KD-Edits.pdf, p. 1, award 12](https://www.gov.nl.ca/ppa/files/Contract-Award-Report-2024-03-16-To-2024-03-31-KD-Edits.pdf#page=1) | 26 October 2023 / 25 March 2024, 151 days apart. Keep both; no correction is printed. |
| Domtar | [2026-Apr-1-15-Contract-Awards-Report.pdf, p. 1, award 3](https://www.gov.nl.ca/ppa/files/2026-Apr-1-15-Contract-Awards-Report.pdf#page=1) | [2026-June-01-15-Contract-Awards-Report.pdf, p. 1, award 5](https://www.gov.nl.ca/ppa/files/2026-June-01-15-Contract-Awards-Report.pdf#page=1) | 14 April 2026 / 4 June 2026, 51 days apart; Paper / special-making paper. Keep both; no correction is printed. |
