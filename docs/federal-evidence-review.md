# Federal evidence correction — 30 September 2026

An address selects a federal record; it does not establish where work, benefits or spending occurred. This correction addresses all findings H1–H8 and M1–M6 in the federal audit supplied with the brief.

## Counting and location decisions

- Each of the 41,115 federal records retains selection field/value, publisher URL and locator, reported address and conflicts, separately supported work/delivery and beneficiary/jurisdiction evidence, native currency, value type, counting rule, period and missing/zero coverage.
- Structured delivery regions can establish delivery geography. A grant's explicit national coverage is broader evidence. Named project decisions are recorded in `pipeline/federal_location_reviews.json`, with exact decisive fields and citations; a changed field stops processing for a fresh review. An unreviewed description or a programme title never establishes geography automatically. Unknown means no separately supported conclusion in this review; it does not prove work was outside NL or that the publisher omits geography. `scope_review_state` separately records `unreviewed` or `reviewed`. Incomplete reviews use the NL Ledger statement below and never an invented absence-evidence entry.
- Full bilingual narratives, comments, results and delivery fields survive ledger, export, search, supplier shards and MCP. CanadaBuys contact details and office-contact addresses are deliberately excluded; the supplier and delivery fields remain. Source records are still linked for comparison.
- Name changes join a contract only through a documented official amendment-chain review, matching department, procurement, original start, original value and one of the reviewed supplier names. Procurement number alone never joins different suppliers. The extensible reviews are in `pipeline/federal_contract_chains.json`; unrelated identity-field variants have regressions.
- The Health Canada H105002096 chain has 12 published rows, including the original row with no postal address. One latest CAD 255,261,335.35 value contributes to summaries. Earlier supplier names, source rows and values remain provenance, with an official amendment-history link, rather than a second record contributing CAD 67,099,400.
- PSS selection reads the trailing province, including the publisher's `Newfoundland & Labr.` abbreviation; commas in a supplier name do not become location evidence. The Ontario Law Society/William Stephenson rows leave the collection; a valid NL Never Forget Films row enters. Grants whose publisher says NL but whose city says Winnipeg or Regina remain visible with conflicts, never as unqualified local work.
- CanadaBuys selection requires a Canadian country and a reported NL province or valid Canadian NL postal code. Ireland, UK and Austrian addresses leave. Native USD and unstated currency stay separate from supported CAD values. A published total of zero wins over a nonzero fallback amount; missing remains distinct from zero.
- Federal values have no automatic provincial per-person, household or wage-time figures. The standalone division tool states its hypothetical denominator assumption. Supplier headlines contain included CAD record values across all years, not total receipts or unique spending. Public Accounts payments and CanadaBuys notices are excluded by source-overlap policy, not an assertion that every excluded record is a duplicate. Detailed native/source/basis/period/location groups remain visible.
- Provincial actual-spending, budget and personal-receipt bases are unchanged. Major transfers remain province-specific receipts in rounded millions and separate context, not added to recipient detail, provincial accounts or commitment totals.

## Published changes

Before figures below are the previous site's numeric figures and CAD labels, including the incorrect labels on foreign/unstated notices. After figures include only source-supported CAD; the difference is not an exchange-rate conversion.

| Published series | Before | After | Change |
|---|---:|---:|---:|
| Federal contracts | CAD 2,614,227,060.51 | CAD 2,547,127,660.51 | −67,099,400.00 |
| PSS annual payments | CAD 690,028,445.00 | CAD 683,854,665.00 | −6,173,780.00 |
| CanadaBuys reported notice values | 855,968,652.83, previously labelled CAD | CAD 830,019,361.38 | −25,949,291.45 numeric |
| Contract-growth pattern values | CAD 1,169,132,892.32 | CAD 1,102,033,492.32 | −67,099,400.00 |
| Former combined home federal-record figure (now removed) | CAD 11,045,002,652.20 | CAD 10,977,903,252.20 | −67,099,400.00 |

PSS removes CAD 6,286,216 and adds the valid NL payment CAD 112,436. CanadaBuys removes the erroneous EUR 52,924.80/CAD label, separates USD 473,000 and 394,250 with unstated currency, and corrects six zero-total notices previously filled from CAD 25,029,116.65 of fallback amounts. The six former notice values are CAD 420,338.65, 600,000, 2,775,000, 16,900,000, 1,000,000 and 3,333,778; their current published total is zero. UK/Austrian removed notices carry zero and change counts only.

CanadaBuys now has 521 CAD records (73 published zeros), one USD record, and 13 records with unstated currency (11 published zeros, one missing amount, one published 394,250 value). No CAD conversion is inferred. Federal grants remain CAD 8,430,775,591.69 and transfer payments CAD 11,889,648,933; neither is a spending total to add to the other series.

Counts: federal contracts 8,533 → 8,532; PSS 358 → 357; CanadaBuys 538 → 535; federal collection 41,120 → 41,115; all loaded records 143,047 → 143,042. Grants remain 29,207 and transfer payments 2,484. PPA's 6,328 awards and CAD 1,372,054,508.65 are unchanged. The dated Corrections entry publishes the source-total changes and points here for the complete comparison.

## Audit coverage

| Finding | Correction and checks |
|---|---|
| H1 | Federal item and mixed supplier ratios removed in HTML and MCP/fetch; actual phone/desktop pages and portable checks. |
| H2 | Full decisive source fields, independent classification and citations retained through parser, ledger, export, FTS, shards and MCP. |
| H3 | Initialize instructions forbid address-to-spending inference; tools/fetch preserve evidence; standalone scaling is explicitly hypothetical. |
| H4 | Supplier tools, prompts, pages and shares state value types, overlap exclusions, all-years basis and native/location groups. |
| H5 | Reviewed official name-change chain counted once; complete provenance retained; unrelated identity variants stay separate. |
| H6 | Trailing-province PSS filter, Canadian postal/country validation, visible Winnipeg/Regina and invalid-postal conflicts. |
| H7 | Federal title, page, share description and Dataset language identify selected records and limits; no blanket provincial geography. |
| H8 | Home ranks are separate per source and value type; federal and provincial values are not added as government spending. |
| M1 | Body values name the selected CAD slice, all-years basis and overlap; separate native/location breakdowns and qualified record rows. |
| M2 | Growth asks about amendments/options/authorization and states that value growth proves neither spending nor a procurement violation. |
| M3 | NOTES, sources, methods, matching and reconciliation docs distinguish selection, geography, counting and overlap. |
| M4 | Shared fallbacks, llms, AI discovery, item/supplier shares and Dataset geography use the same evidence rule. |
| M5 | The billion-dollar illustration compares each example independently; it has no combined subtotal or remainder and warns against addition. |
| M6 | USD and unstated values retain their published units; CAD-only summaries cannot silently convert them; zero/missing coverage tested. |

## Verification recorded

The new ledger checker failed against the untouched main ledger: all 25 retained examples lacked their required classification/evidence; all four erroneous/duplicate records remained; USD and unstated currencies and both address conflicts failed. The same checker passes against the rebuilt branch: all 41,115 federal rows carry evidence. Real publisher rows are frozen in `tests/fixtures/federal`; parser checks test all retained examples, removals, the complete chain, unrelated identity variations, country/province/postal variants, changed evidence and zero fallback.

Official sources were read through actual network requests on 30 September: the [Health Canada amendment history](https://search.open.canada.ca/contracts/record/hc-sc,H105002096?amendments) contains both supplier names in the same chain; the [City's Riverhead announcement](https://www.stjohns.ca/news/posts/wastewater-infrastructure-expansion-announced/) identifies the facility and matching CAD 69,639,116 federal commitment; [NRCan's refinery list](https://natural-resources.canada.ca/energy-sources/fossil-fuels/refining-sector-canada) locates North Atlantic at Come By Chance. Ordinary browser user-agent requests succeeded where headless retrieval refused access.

The full cached-source pipeline was rebuilt with `cd pipeline && ./run.sh process`. The final site build writes 409 pages and 512 supplier shards. Real full-data Worker HTTP readback at `http://localhost:8791` checks 25 item pages and share metadata, 21 supplier pages/tools, four removed-record 404s, MCP initialize/get_record/fetch/get_supplier/search/search_records/get_flag/human_scale and an actually rendered 1200×630 share PNG. `site/check-federal-live.mjs` reproduces that run; the local preview now routes dynamic share requests through the actual Worker handler.

an ordinary desktop Chrome showed the national, local, conflicting-address, USD and unstated-currency records, supplier, federal, home and scale pages. Phone checks at 375×812 show no document overflow; wide layout preserves the evidence beside the amount. Source and currency labels are visible, not just in distant methods. Impeccable audit/polish retained the existing design; the mechanical scan returned no findings. The cold code review caught and corrected abbreviated-province loss, zero fallback, overlong/duplicate descriptions and the preview's missing dynamic-share route.

Passing checks: `uv run python check_federal.py` and `--ledger`; `check_fixtures.py`, `check_matching.py`, `check_awards.py`; Node `check-federal.mjs --built`, `check-federal-live.mjs`, `check-cards.mjs`, `check-search.mjs`, `check-headers.mjs`, `check-claims.mjs`, `check-feedback.mjs`; Python/JavaScript syntax; `site/check.sh` including links, descriptions, JSON-LD and sitemap; diff whitespace with the repository's existing CSV CRLF line endings allowed. Portable federal checks are now CI gates. No source refresh, exchange-rate estimate, merge, Cloudflare deployment or D1 upload was performed. Production remains unchanged; the recorded response run is the actual local Worker over rebuilt real records, not a deployed-Cloudflare result.

To refresh the portable exported examples after a reviewed pipeline change: `cd pipeline && uv run python check_federal.py --write-fixtures && uv run python make_sample.py`. To reproduce the exact monetary comparison: `uv run python federal_total_changes.py --before <baseline-ledger.db> --after ../data/build/ledger.db --output ../docs/federal-total-changes.csv`.

## Every changed monetary total

The [machine-readable comparison](federal-total-changes.csv) lists all 87 changed source, source-year, body, body-source, body-year, body-supplier, procurement-method, supplier, supplier-source, supplier-year, supplier-body, pattern and former home totals. Keys identify the same published group before and after. These rows overlap and must not be summed.

| Summary | Published identity/source | Before numeric total | After supported CAD | Change |
|---|---|---:|---:|---:|
| body | fisheries and oceans canada | 899973253.07 | 899579003.07 | -394250.00 |
| body | foreign affairs trade and development canada | 52924.80 | 0.00 | -52924.80 |
| body | health canada | 842298049.77 | 775198649.77 | -67099400.00 |
| body | marine atlantic | 25029116.65 | 0.00 | -25029116.65 |
| body | public works and government services canada | 37377961.72 | 36904961.72 | -473000.00 |
| body/method | fisheries and oceans canada / Competitive - Open bidding | 14178695.20 | 13784445.20 | -394250.00 |
| body/method | foreign affairs trade and development canada / Competitive - Open bidding | 52924.80 | 0.00 | -52924.80 |
| body/method | health canada / Competitive (open bidding) | 322360735.35 | 255261335.35 | -67099400.00 |
| body/method | marine atlantic / Competitive - Open bidding | 25029116.65 | 0.00 | -25029116.65 |
| body/method | public works and government services canada / Non-competitive | 19657607.16 | 19184607.16 | -473000.00 |
| body/source | fisheries and oceans canada / canadabuys | 14536455.20 | 14142205.20 | -394250.00 |
| body/source | foreign affairs trade and development canada / canadabuys | 52924.80 | 0.00 | -52924.80 |
| body/source | health canada / fed_contract | 322729159.77 | 255629759.77 | -67099400.00 |
| body/source | marine atlantic / canadabuys | 25029116.65 | 0.00 | -25029116.65 |
| body/source | public works and government services canada / canadabuys | 37377961.72 | 36904961.72 | -473000.00 |
| body/supplier | fisheries and oceans canada / farrells excavating | 1885205.45 | 1490955.45 | -394250.00 |
| body/supplier | foreign affairs trade and development canada / adam egan landscapes | 52924.80 | 0.00 | -52924.80 |
| body/supplier | health canada / 11983890 canada centre | 67099400.00 | 0.00 | -67099400.00 |
| body/supplier | marine atlantic / atlantic grocery distributors | 16900000.00 | 0.00 | -16900000.00 |
| body/supplier | marine atlantic / baine johnston properties | 2775000.00 | 0.00 | -2775000.00 |
| body/supplier | marine atlantic / idea factory | 600000.00 | 0.00 | -600000.00 |
| body/supplier | marine atlantic / port aux basques snow clearing | 3333778.00 | 0.00 | -3333778.00 |
| body/supplier | marine atlantic / sansom equipment | 420338.65 | 0.00 | -420338.65 |
| body/supplier | marine atlantic / triware technologies | 1000000.00 | 0.00 | -1000000.00 |
| body/supplier | public works and government services canada / kongsberg maritime canada | 473000.00 | 0.00 | -473000.00 |
| body/year | fisheries and oceans canada / 2022 | 172827326.43 | 172433076.43 | -394250.00 |
| body/year | foreign affairs trade and development canada / 2024 | 52924.80 | 0.00 | -52924.80 |
| body/year | health canada / 2020 | 323625214.35 | 256525814.35 | -67099400.00 |
| body/year | marine atlantic / 2023 | 19675000.00 | 0.00 | -19675000.00 |
| body/year | marine atlantic / 2024 | 1600000.00 | 0.00 | -1600000.00 |
| body/year | marine atlantic / 2025 | 3754116.65 | 0.00 | -3754116.65 |
| body/year | public works and government services canada / 2022 | 28623386.70 | 28150386.70 | -473000.00 |
| home/former-combined-federal-record-values |  | 11045002652.20 | 10977903252.20 | -67099400.00 |
| pattern | contract-growth | 1169132892.32 | 1102033492.32 | -67099400.00 |
| source | canadabuys | 855968652.83 | 830019361.38 | -25949291.45 |
| source | fed_contract | 2614227060.51 | 2547127660.51 | -67099400.00 |
| source | pa_pss | 690028445.00 | 683854665.00 | -6173780.00 |
| source/year | canadabuys / 2022 | 96631893.66 | 95764643.66 | -867250.00 |
| source/year | canadabuys / 2023 | 296889868.27 | 277214868.27 | -19675000.00 |
| source/year | canadabuys / 2024 | 198066070.13 | 196413145.33 | -1652924.80 |
| source/year | canadabuys / 2025 | 105604424.04 | 101850307.39 | -3754116.65 |
| source/year | fed_contract / 2020 | 341012716.47 | 273913316.47 | -67099400.00 |
| source/year | pa_pss / 2023-24 | 178022733.00 | 176005865.00 | -2016868.00 |
| source/year | pa_pss / 2024-25 | 126827149.00 | 122670237.00 | -4156912.00 |
| supplier | 11983890 canada centre / included | 67099400.00 | 0.00 | -67099400.00 |
| supplier | 73719 newfoundland and labrador / excluded | 6286216.00 | 0.00 | -6286216.00 |
| supplier | adam egan landscapes / excluded | 52924.80 | 0.00 | -52924.80 |
| supplier | atlantic grocery distributors / excluded | 50107610.00 | 33207610.00 | -16900000.00 |
| supplier | baine johnston properties / excluded | 2775000.00 | 0.00 | -2775000.00 |
| supplier | farrells excavating / excluded | 1629483.40 | 1235233.40 | -394250.00 |
| supplier | fish food and allied workers / excluded | 6164271.04 | 8250885.04 | 2086614.00 |
| supplier | fish / excluded | 2086614.00 | 0.00 | -2086614.00 |
| supplier | idea factory / excluded | 600000.00 | 0.00 | -600000.00 |
| supplier | kongsberg maritime canada / excluded | 2573571.96 | 2100571.96 | -473000.00 |
| supplier | never forget films / excluded | 0.00 | 112436.00 | 112436.00 |
| supplier | port aux basques snow clearing / excluded | 3359498.00 | 25720.00 | -3333778.00 |
| supplier | sansom equipment / excluded | 420338.65 | 0.00 | -420338.65 |
| supplier | triware technologies / excluded | 1000000.00 | 0.00 | -1000000.00 |
| supplier/body | 11983890 canada centre / health canada / included | 67099400.00 | 0.00 | -67099400.00 |
| supplier/body | 73719 newfoundland and labrador / veterans affairs / excluded | 6286216.00 | 0.00 | -6286216.00 |
| supplier/body | adam egan landscapes / foreign affairs trade and development canada / excluded | 52924.80 | 0.00 | -52924.80 |
| supplier/body | atlantic grocery distributors / marine atlantic / excluded | 16900000.00 | 0.00 | -16900000.00 |
| supplier/body | baine johnston properties / marine atlantic / excluded | 2775000.00 | 0.00 | -2775000.00 |
| supplier/body | farrells excavating / fisheries and oceans canada / excluded | 394250.00 | 0.00 | -394250.00 |
| supplier/body | fish food and allied workers / fisheries and oceans / excluded | 3072504.00 | 5159118.00 | 2086614.00 |
| supplier/body | fish / fisheries and oceans / excluded | 2086614.00 | 0.00 | -2086614.00 |
| supplier/body | idea factory / marine atlantic / excluded | 600000.00 | 0.00 | -600000.00 |
| supplier/body | kongsberg maritime canada / public works and government services canada / excluded | 473000.00 | 0.00 | -473000.00 |
| supplier/body | never forget films / national film board / excluded | 0.00 | 112436.00 | 112436.00 |
| supplier/body | port aux basques snow clearing / marine atlantic / excluded | 3333778.00 | 0.00 | -3333778.00 |
| supplier/body | sansom equipment / marine atlantic / excluded | 420338.65 | 0.00 | -420338.65 |
| supplier/body | triware technologies / marine atlantic / excluded | 1000000.00 | 0.00 | -1000000.00 |
| supplier/source | 11983890 canada centre / fed_contract | 67099400.00 | 0.00 | -67099400.00 |
| supplier/source | 73719 newfoundland and labrador / pa_pss | 6286216.00 | 0.00 | -6286216.00 |
| supplier/source | adam egan landscapes / canadabuys | 52924.80 | 0.00 | -52924.80 |
| supplier/source | atlantic grocery distributors / canadabuys | 49400000.00 | 32500000.00 | -16900000.00 |
| supplier/source | baine johnston properties / canadabuys | 2775000.00 | 0.00 | -2775000.00 |
| supplier/source | farrells excavating / canadabuys | 1629483.40 | 1235233.40 | -394250.00 |
| supplier/source | fish food and allied workers / pa_pss | 0.00 | 2086614.00 | 2086614.00 |
| supplier/source | fish / pa_pss | 2086614.00 | 0.00 | -2086614.00 |
| supplier/source | idea factory / canadabuys | 600000.00 | 0.00 | -600000.00 |
| supplier/source | kongsberg maritime canada / canadabuys | 2573571.96 | 2100571.96 | -473000.00 |
| supplier/source | never forget films / pa_pss | 0.00 | 112436.00 | 112436.00 |
| supplier/source | port aux basques snow clearing / canadabuys | 3359498.00 | 25720.00 | -3333778.00 |
| supplier/source | sansom equipment / canadabuys | 420338.65 | 0.00 | -420338.65 |
| supplier/source | triware technologies / canadabuys | 1000000.00 | 0.00 | -1000000.00 |
| supplier/year | 11983890 canada centre / 2020 | 67099400.00 | 0.00 | -67099400.00 |

## Retained counterexamples

| Record | Published native value | Source location conclusion |
|---|---:|---|
| `c5500509042d` | CAD 255,261,335.35 | The source describes national service; no NL share is reported. |
| `63c4432f8541` | CAD 33,689,621.80 | The source identifies Canadian Forces Base Halifax; no NL share is reported. |
| `bca16564e795` | CAD 22,692,174.00 | The source identifies road and runway work at Goose Bay, Labrador. |
| `13f89fc3485e` | CAD 1,400,000.00 | The source identifies beneficiaries in four Nunavut communities; no NL share is reported. |
| `7ccd49403328` | CAD 819,778,699.20 | The source identifies core funding to the Nunatsiavut government, not subsequent spending. |
| `36d6d738b8e8` | CAD 555,842,845.00 | The source identifies an infrastructure agreement with Newfoundland and Labrador. |
| `fa607549cc54` | CAD 69,639,116.00 | The source identifies work at Riverhead in St. John’s, NL. |
| `b035ea02a4e3` | CAD 23,377,363.00 | The source names the Manitoba government as recipient; no NL share is reported; the reported address fields conflict (reported city is Winnipeg). |
| `d677e0fe2faf` | CAD 22,300,000.00 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below; the reported address fields conflict (reported city is Regina). |
| `3edc2e68d696` | CAD 198,050,524.06 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below. |
| `287d79501c86` | CAD 29,727,329.00 | The source identifies expected benefits for the Newfoundland and Labrador offshore oil industry. |
| `246e901188f4` | CAD 37,363,420.00 | The source identifies conversion of the North Atlantic refinery at Come By Chance, NL. |
| `093509db8ca4` | CAD 91,551,679.00 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below. |
| `10ace16b39c4` | CAD 539,504.00 | The source reports national or international coverage; no NL share is reported. |
| `a29d34744ddb` | USD 473,000.00 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below. |
| `09a043d96d65` | CAD 56,090.00 | The award text says only NL sites were awarded, with no successful bidder for Nova Scotia. |
| `2596630e5aac` | unstated 394,250.00 | The source identifies cleanup work at Parson’s Pond in NL. |
| `9be02dfdf480` | CAD 10,579,869.30 | The source identifies bridge work in Gros Morne National Park, NL. |
| `b5c6a18c47f4` | CAD 48,209,224.00 | The source identifies national, multiple-region or other delivery; no NL share is reported. |
| `7d3902b49e61` | CAD 33,689,621.80 | The source identifies national, multiple-region or other delivery; no NL share is reported. |
| `aa1e7d019f60` | CAD 20,408,673.25 | The source identifies delivery in NL. |
| `8323dbffdf45` | CAD 48,627,235.81 | The source identifies national, multiple-region or other delivery; no NL share is reported. |
| `63300ec95fb3` | CAD 47,098,904.00 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below. |
| `c2641c85abe3` | CAD 37,363,420.00 | NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below. |
| `11e457616b87` | CAD 985,000,118.00 | The source identifies a payment to the Newfoundland Exchequer Account, not subsequent spending. |

## Former mixed home ranking, replaced by separate source ranks

These are the ten former combined recipient headlines and their corrected source slices. The homepage now ranks five recipients independently within each source. This is a change of basis, not a claim that a recipient lost money or that the separate values are unique spending. The source rows can overlap; do not add them. The [CSV](federal-home-rankings.csv) preserves the complete comparison.

| Former home recipient | Former combined reported numeric value | After provincial awards CAD | After federal contracts CAD | After federal grants CAD | After Paradise payments CAD |
|---|---|---|---|---|---|
| Government of Newfoundland and Labrador | 1598545460.34 | 0.00 | 0.00 | 1598545460.34 | 0.00 |
| Nunatsiavut Government | 1228539521.18 | 0.00 | 442177.23 | 1228097343.95 | 0.00 |
| Memorial University of Newfoundland | 372390010.56 | 435602.08 | 12911871.09 | 359042537.39 | 0.00 |
| INMARSAT SOLUTIONS (CANADA) INC./ | 311284431.36 | 0.00 | 311284431.36 | 0.00 | 0.00 |
| Mushuau Innu First Nation | 294478295.37 | 0.00 | 0.00 | 294478295.37 | 0.00 |
| ROGERS CABLE COMMUNICATIONS INC. | 267801364.28 | 0.00 | 267801364.28 | 0.00 | 0.00 |
| SC2.0 Stepped Care Solutions Inc | 255800839.35 | 0.00 | 255261335.35 | 539504.00 | 0.00 |
| St. John's Dockyard | 252102485.04 | 31632453.00 | 212584892.04 | 7885140.00 | 0.00 |
| Miawpukek Band | 247833388.10 | 0.00 | 0.00 | 247833388.10 | 0.00 |
| Sheshatshiu Innu First Nation | 227680101.60 | 0.00 | 0.00 | 227680101.60 | 0.00 |

## N1 correction — 30 September 2026

Incomplete location review now says: “NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below.” There is no placeholder absence conclusion in publisher evidence. Review state survives the ledger, search export, sample, supplier shards, summaries, record HTML and MCP get/fetch/search. Summaries separate incomplete reviews from completed unknown conclusions. The item page labels the review state; titles and share descriptions retain the same qualification.

The Golder `352559efa91e` decision pins the exact contaminated-site assessment comment naming Goose Bay, Labrador. C-Core `3b111bcf74a5` pins the exact DRDC Shirley’s Bay, Ottawa comment. Both official pages were read in an ordinary desktop Chrome and match the cached source fields. These remain whole contract values, not payments or NL allocations.

The transfer decision in `pipeline/federal_transfer_review.json` reviews six exact published provincial-government recipient identities, including the Exchequer Account, with the source’s matching NL province. It establishes jurisdictional receipt only, keeps work/delivery geography empty and explicitly denies subsequent-expenditure proof. Withheld-recipient groups and other supplier/government names do not match. Every classified payment cites its actual recipient, province and programme fields. The live publisher’s 2025 CSV confirms `da13771f1372`: Province of Newfoundland and Labrador, Canada Health Transfer, 2024/2025, CAD 688,307,000.00.

Compared with the pre-N1 branch ledger, every one of the 143,042 records has identical identity, amount, currency and other non-evidence columns. All 101,927 non-federal item rows are identical. No source, supplier, body or pattern financial total changes. Only location groups move:

| Source / move from unknown | Records | Whole reported CAD values |
|---|---:|---:|
| Contracts → NL work | 1 | 5,024,790.46 |
| Contracts → other work (Ottawa) | 1 | 2,874,933.07 |
| Transfer payments → NL jurisdictional receipt | 196 | 8,094,098,161.00 |

Review coverage after the correction: 5 reviewed / 8,527 unreviewed contracts; 31 / 29,176 grants; 371 / 164 notices; 0 / 357 PSS payments; 197 / 2,287 transfer payments. Coverage describes the supported assessment in this implementation, not absence of geography in unreviewed publisher fields.

The new unreviewed-prose regression rejects the previous implementation and passes after this correction. Five portable source tests pass, including exact recipient/withheld-name/conflicting-province variants; the ledger check covers all 41,115 federal records. The cached-source pipeline, site build (409 pages and 512 shards), guardrails, claims and portable/built federal checks pass. Actual HTTP readback at `http://localhost:8799` passes 28 item pages with Open Graph/Twitter qualifications, 23 suppliers, both MCP search tools, filtered HTML search for the N1 examples, get/fetch/flag responses, removed-item 404s and an actual 1200×630 share PNG. An ordinary desktop Chrome also confirmed the rebuilt Golder work-site, unreviewed PSS and Canada Health Transfer receipt pages and their visible limits. This is a local full-data Worker run, not a production deployment. No source cache refresh, D1 sync, deployment or merge.
