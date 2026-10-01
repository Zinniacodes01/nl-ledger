# Supplier identity audit: the two Catholic dioceses

Checked 2026-09-30 against the downloaded records, with two records read back from the publisher's live datastore the same day. This corrects how records are grouped; it makes no conclusion about a body's conduct or legal continuity.

## The dioceses

The old `roman catholic episcopal` page combined 13 grant agreements worth $53,172.00. Removing “The”, “Corp.” and “Corporation” collapsed nine records into one name key before business-number checks ran. Four explicitly named St. John's records then joined that mixed key. The source distinguishes two business-number roots:

| Published evidence | Business number | Postal code | Place | Agreement value |
|---|---|---|---|---:|
| [Generic Grand Falls record, 141-2019-2020-Q1-13406](https://search.open.canada.ca/grants/record/esdc-edsc,141-2019-2020-Q1-13406,current) | 107876468RP0020 | A0G3M0 | Norris Arm | $3,119.00 |
| [Generic St. John's record, 141-2020-2021-Q4-03889](https://search.open.canada.ca/grants/record/esdc-edsc,141-2020-2021-Q4-03889,current) | 107910176RR0035 | A1N2C4 | Mount Pearl | $3,168.00 |
| [Named Grand Falls record, 141-2020-2021-Q4-03187](https://search.open.canada.ca/grants/record/esdc-edsc,141-2020-2021-Q4-03187,current) | 107876468RP0025 | A0G4H0 | Tilting | $11,088.00 |
| [Named St. John's record, 141-2019-2020-Q1-13681](https://search.open.canada.ca/grants/record/esdc-edsc,141-2019-2020-Q1-13681,current) | 107910176RP0010 | A0B2Y0 | Placentia | $3,055.00 |

The first two rows were returned successfully by `datastore_search`, filtered on their exact `ref_number`, with one record each. Their names, business numbers, postal codes and amounts matched the cache. The named rows anchor the generic records to their dioceses. The reviewed Grand Falls alias uses that published number; the conflict guard prevents it from joining St. John's records under the same normalized name.

| Supplier page | Before | After | Movement |
|---|---:|---:|---:|
| Mixed generic page | 13 records, $53,172.00 | Removed | −$53,172.00 |
| St. John's (107910176) | Included in mixed page | 8 records, $36,723.00 | +$36,723.00 |
| Grand Falls (107876468) | 10 records, $86,635.00 | 15 records, $103,084.00 | +5 records, +$16,449.00 |

All 23 records sum to $139,807.00 before and after. These are grant agreement values, not cash paid. Separately named parishes, St. George's and the Harbour Grace record keep their existing pages unless the published evidence supports a join.

## Revised reporting policy and whole-ledger audit

A supplier page represents the organisation the publisher named, not a verified tax registrant. Different business numbers alone are insufficient to split it. Different identifiers split a name when their published postal-code or locality sets are disjoint, or documented named anchors identify different organisations. Overlapping sets, missing locations, payroll/GST suffixes and charity suffixes alone do not establish different recipients. All numbers, including publisher placeholders and inconsistent charity suffixes, remain as published in the supplier metadata and are listed when a page carries more than one.

Location evidence includes evidenced spelling/department aliases under the same identifier before partitioning. Province suffixes such as “Summerford, NL” and “Summerford Newfoundland and Labrador” are normalized. Every later join checks consolidated whole-group identifier profiles so neither an unnumbered record nor an alias can bridge a supported conflict. Unnumbered records join only a uniquely matching piece; an ambiguous assignment remains unresolved.

**Re-ran the original 97-page audit: 80 pages rejoin and 17 remain split.** There are 15 directly partitioned normalized names; the other two retained separations arise from later whole-group checks. The count is of original pages with records on more than one final supplier page, not the number of final pieces. No source total changes and no new pre-PR supplier page splits.

The eight reviewed over-splits all rejoin under the general rule, with no organisation-specific merge exceptions:

| Published organisation | Final records | Included value | Excluded value |
|---|---:|---:|---:|
| City of Corner Brook | 36 | $4,471,607.02 | $1,649,203.00 |
| Point Lance Community Council | 9 | $72,667.00 | $0.00 |
| Town of Forteau | 21 | $356,279.72 | $0.00 |
| Town of Hant's Harbour | 8 | $156,484.00 | $0.00 |
| Town of Irishtown-Summerside | 9 | $20,294.00 | $0.00 |
| Town of North West River | 3 | $170,478.00 | $0.00 |
| Town of Springdale | 21 | $681,013.00 | $0.00 |
| Burin Peninsula Health Care Foundation | 7 | $29,016.00 | $0.00 |

The foundation's `106818610RR0001` and `106818610RR1068` both survive. Municipal joins do not assert that CRA issued every printed root to one municipality. Unresolved companies sharing a published name and location also rejoin under this reporting policy; this does not establish legal registration or ownership continuity.

### Why each of the 17 pages remains split

“Location” supports retaining evidence partitions; it is not proof of different legal organisations. The independent review left the Coley's Point community of faith, Hangout, Rowing and Grand Falls-Windsor identities unresolved, and the pages say so. Other location-only separations are also labelled unresolved. Unnumbered pieces are kept when no unique assignment exists and link all located pieces. [Every original page's outcome and conflicting profiles](supplier-retained-splits.csv), [each retained piece's identifiers, locations and publisher receipts](supplier-retained-pieces.csv), and [directly partitioned names and grant references](supplier-identity-splits.csv) carry the full evidence.

| Original page | Final pieces | Supporting evidence |
|---|---:|---|
| coleys point grace united community of faith | 2 | 106777014 at A0A3C0 versus 802373589 at A0A1X0; same Coley’s Point locality. Identity unresolved. |
| deejay charters | 2 | 890090541 at A1A2Z9 versus 744218512 at A1B4G8; both St. John’s. Identity unresolved. |
| governing council of salvation army | 8 | Different full RR accounts carry disjoint postal sets (for example RR0038 at A1C0A4 versus RR0089 at A0E1W0). Profiles include every branch/account; root-only assignments remain unresolved. |
| governing council of salvation army in canada | 11 | Different full RR accounts at St. John’s, Arnold’s Cove, Clarenville, Corner Brook, Grand Falls-Windsor, Grand Bank, Burin Bay Arm, Stephenville and Mount Pearl. Disjoint postal evidence; root-only/unnumbered assignments remain unresolved. |
| grand falls windsor community garden | 2 | 764198602 at A2A2V9 versus 745282673 at A2A2B3. Identity unresolved. |
| hangout vr games cafe | 2 | 719591000 at Paradise/A1L0R9 versus 787927078 at CBS/A1W3A1. Identity unresolved. |
| johnson geo centre | 2 | 107690273RR0001 names Memorial; 892350612RR0001 names the former GEO Centre Foundation. Same postcode, but Memorial’s dated transfer announcement and the reviewed charity listings identify different recipients. |
| local service district development committee | 2 | 865502488 in Castor River North versus 893006064 in Castor River South, both A0K1W0. Locality disagreement; identity unresolved. |
| memorial united church | 2 | 107690240 at Bonavista/A0C1B0 versus 888270592 at Grand Falls-Windsor/A2A2T9. Identity unresolved. |
| parish of hearts content | 2 | 119229896RR0021 names Heart’s Content; RR0045 names Upper Island Cove in the reviewed charity listings. Different locations corroborate the named anchors. |
| roman catholic episcopal | 2 | 107876468 and 107910176 are anchored by explicitly named Grand Falls and St. John’s publisher records. They remain distinct even where broader alias location sets overlap. |
| rowing newfoundland | 2 | 850574039 at St. John’s/A1B4R1 versus 893497479 at Conception Bay South/A1W4C5. Identity unresolved. |
| royal canadian legion | 3 | 107930836 at Bay Roberts/A0A1G0 versus 107933061 at CBS/A1X6Y7; unnumbered records have no unique matching piece. Identity unresolved. |
| salvation army | 5 | Distinct RR accounts carry disjoint locations: RR0089 Grand Bank/A0E1W0, RR0434 Hare Bay/A0G2P0 and RR0441 Deer Lake/A8A1E1. Root-only and unnumbered assignments remain unresolved. |
| salvation army heritage park temple corps | 2 | 107951618RR0043 names Arnold’s Cove Corps; RR0441 names Deer Lake Corps in the reviewed charity listings; grant locations corroborate the named anchors. |
| town of grand falls windsor | 3 | 108126749 at A2A1C3/A2A2B7/A2A2J8 versus 122184484 at A2A2J3. The latter’s “NL” locality is unavailable evidence, not a different town. Unnumbered pieces cannot be assigned uniquely. Identity unresolved. |
| united church of canada | 3 | 106777014 at Clarke’s Beach/A0A1X0 versus 872937693 at Twillingate/A0G4M0; unnumbered records cannot be assigned uniquely. Identity unresolved. |

[Named anchors](../pipeline/supplier_identity_anchors.csv) are evidence for separation, not merge exceptions. They cover the four independently confirmed distinctions: dioceses, GEO Centre recipients, parishes and Salvation Army corps. GEO Centre particularly needs a named anchor because both recipients share a name and postcode. CRA evidence for the accounts is from the supplied independent review, not a fresh CRA lookup in this fix; Memorial’s September 2019 transfer announcement was read live again on 2026-09-30.

The two diocesan named anchors were read back from the publisher’s live datastore on 2026-09-30, filtered by exact reference with one current ESDC row returned for each: [Grand Falls, 141-2020-2021-Q4-03187](https://search.open.canada.ca/grants/record/esdc-edsc,141-2020-2021-Q4-03187,current), `107876468RP0025`, Tilting/A0G4H0, $11,088.00; [St. John’s, 141-2019-2020-Q1-13681](https://search.open.canada.ca/grants/record/esdc-edsc,141-2019-2020-Q1-13681,current), `107910176RP0010`, Placentia/A0B2Y0, $3,055.00. Names, identifiers, locations and values match the downloaded records.

## Exact movements and source preservation

Compared all 143,047 records against current main and the pre-fix supplier rule, each rebuilt on identical source inputs: identical IDs and every field unchanged except **568 supplier assignments**. Every published grant business-number string survives in its final supplier metadata. Included source values remain **$12,421,913,477.31** and excluded source values **$13,435,646,030.83**. The eight actual rebuilt organisations each occupy one page, and the dioceses remain on two pages totalling $139,807.00.

- [supplier-rule-fix-totals.csv](supplier-rule-fix-totals.csv): every pre-fix PR → revised supplier count and included/excluded total, with exact deltas for 256 changed supplier keys. Net included and excluded changes are both $0.00.
- [supplier-rule-fix-records.csv](supplier-rule-fix-records.csv): all 568 records moved by this fix, with receipts.
- [supplier-split-totals.csv](supplier-split-totals.csv): original pre-PR → final totals and deltas for 74 changed supplier keys. Net included and excluded changes are both $0.00.
- [supplier-split-records.csv](supplier-split-records.csv): all 179 records still moved by the complete PR relative to the original grouping, with receipts.
- [supplier-split-audit.json](supplier-split-audit.json): counts, exact source totals and SHA-256 of the inputs.

The baseline uses the same source records after rebase onto `e9202e8` (the award-counting baseline on main). Main’s merged award fixes changed the earlier baseline by one record and $13,742,490.57; that is not a supplier-rule change. Reprocessed only the changed PPA parser, then built main’s matching and the original PR’s matching (`0ed04d9`) through main’s updated award-counting code, using their own reviewed-rule files. Main, the pre-fix supplier rule and the final rule have identical record IDs and every source field; only supplier keys differ. The original grouping was recovered from those same-input snapshots, leaving the original cohort of 97 split pages unchanged. All eight rejoined supplier totals and every supplier-movement CSV remain unchanged by this rebase. Snapshot and movement hashes are in the JSON audit.

The downloaded cache is shared, while clean files, ledger and exports are worktree-local. No sources were fetched or altered during processing. Grant cache SHA-256 remains `100b63de89e3ed05d4a6d2d2028aa3c33783ca42351009b6ec3f437f51743c70`; its fetch date remains unconfirmed because it has no manifest entry.

Reproduce with a same-input pre-fix matching snapshot and its original-to-pre-fix movement CSV:

```sh
cd pipeline
uv run python audit_supplier_splits.py --before /path/to/pre-fix-ledger.db --original-movements /path/to/pre-fix-supplier-split-records.csv
```

## Validation and browser observations

Rebased again onto `0eb277a` after main also gained PR #37 (share cards). The supplier and award-counting checks, whole-ledger identity audit, site build, page guardrails, financial-claims checks and 339 share-card checks all pass after this rebase. The 97-page outcomes, movement CSVs and source totals are unchanged. an ordinary desktop Chrome was checked again on the rebuilt preview: Springdale, Corner Brook, both dioceses and Rowing retain their disclosures and totals; Rowing’s peer link reads back the reciprocal $56,667.00 total. Browser error log empty.

- `cd pipeline && ./run.sh process`: passed once from downloaded sources. After review changes, only build, flags, reconciliation and export were regenerated. On the later rebase, only PPA was reparsed to consume main’s merged source-position and award-counting fixes; supplier and `check_awards.py` checks both pass. Existing source discrepancies in `docs/reconciliation.md` are unchanged; that file has no diff.
- `cd pipeline && uv run python check_matching.py`: name-key parity and 46 cases pass, including all eight reviewed over-splits, both dioceses, charity accounts across name variants, whole-group conflicts, alias locations and province suffixes. New joins failed under the prior rule before implementation.
- `node site/build.mjs`, `site/check.sh`, `node site/check-claims.mjs`: pass. All 11,990 supplier pages reconcile to 72,637 supplier records and the exact included/excluded totals above.
- Full-ledger page verification: every retained split group links every surviving piece; 226 reciprocal links read exact final totals, and 2,768 published-number disclosure entries appear in rendered pages.
- an ordinary desktop Chrome, local preview on port 8795: Springdale `/supplier/736f927027/`, 21 records/$681,013.00, and Corner Brook `/supplier/9e2f73e330/`, 36 records/$4,471,607.02 included plus $1,649,203.00 excluded, list the conflicting published numbers. St. John’s `/supplier/67b6283781/`, 8 records/$36,723.00, and Grand Falls `/supplier/79d3cdb8ae/`, 15 records/$103,084.00, remain separate and link each other. Rowing `/supplier/025b0ec8eb/` has 4 records/$56,667.00 and links its unresolved 1-record/$8,958.00 peer `/supplier/7678fb0419/`; following that link reads the reciprocal total. Both say “Identity unresolved”. Browser error log empty.
- Native cold review found and corrected alias-scoped location over-splitting and province suffixes; regression checks and the full data audit passed again.

No D1 sync, merge or deployment was performed. Figures and sources, never a verdict.
