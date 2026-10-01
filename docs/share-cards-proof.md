# Share-card proof — 30 September 2026

The preview and proof Workers used for this proof were deleted after the cards went live; `NOTES.md` says how to deploy a preview again.

## Real Worker proof

The account e0fc5e0c5b1df650b8734b56578d3005 reports Workers Paid. Before implementation, the separate `nlledger-cards-proof` Worker returned a real 1200×630 PNG with the derived Archivo font and French accents. Satori 0.33.5 failed during HarfBuzz initialization; pinned Satori 0.26.0 plus resvg WASM 2.6.2 worked. Compiled Yoga and resvg WASM initialize once, lazily inside the request. Proof evidence: `proof.png`, `proof.headers` in the review folder.

The complete preview uploads about 1,201 KiB compressed, with a reported 12 ms startup. Both proof and preview enforce a 1,000 ms CPU limit. Actual supplier and search image requests succeeded under that limit. First responses recorded `x-share-card: miss`; every tested dynamic card's second request returned `hit` and a 1200×630 PNG. Cards send `public, max-age=31536000, immutable`; stale versions, unknown suppliers and overflowing text return the real generic PNG with `public, max-age=60`. HEAD returns the image headers without its body. Renderer exceptions are injected in the focused checks, rather than deliberately crashing the live preview; the generic PNG saved as `generation-failure-fallback.png` represents that same fallback asset.

## Privacy and limits

Exact reviewed organisation names govern departments, public bodies, employers and suppliers. A legal suffix is insufficient: a corporation can carry a person's name. Unknown names automatically retain `/og.png`, including two person names originally filed as source buyers. Search images accept reviewed spending vocabulary only; arbitrary names and unsupported characters fall back. Every individual record, minister and MHA retains the generic image. Current data has 84 reviewed supplier groups out of 11,957; the rest deliberately keep the generic card. Extending coverage requires review of names, not a looser heuristic.

Static cards use page-model figures, not scraped HTML. There are 292 cards across 411 built pages; public bodies show record counts to avoid adding overlapping source values. Supplier cards label included record values, not payments; employer cards label published compensation over the disclosure threshold, not whole payroll. Missing amounts fall back; zero is preserved; a cent remains $0.01. Whole words wrap and shrink using the actual font advances; text that cannot fit falls back. The version includes data, template, logo, font, renderer dependencies and privacy policy. Existing generic fallback art stays unchanged.

## Real social inspectors in an ordinary desktop Chrome

- Facebook Sharing Debugger: preview home fetched HTTP 200 and displayed the blue $10.6 billion card. Its remaining `fb:app_id` warning concerns an optional Facebook app identity, not image delivery. Saved `facebook-debugger.jpg`.
- LinkedIn Post Inspector: preview home and the Fédération des francophones supplier fetched HTTP 200 and displayed branded images and the full supplier title. The real inspection also exposed the old sentence-shortening bug that reduced $8.3 million to 3 million; supplier descriptions now begin with the intact amount and avoid that shortening. Saved `linkedin-inspector.jpg`. LinkedIn initially could not connect to workers.dev; the separate preview custom domain succeeded.
- OpenGraph.xyz, X tab: the `snow removal` search displayed its words with no results pictured. Zero errors, 12 good checks, image/png, 1200×630, `summary_large_image`. Its one marketing suggestion asks for a call to action; the ledger keeps its neutral wording. Saved `x-preview.jpg`.

## Checks and saved review images

Build and `site/check.sh` passed. `node site/check-cards.mjs` passed 339 focused checks, including actual PNG rendering, metadata, privacy, decimal descriptions, cents, zero, missing amounts, French text, long names, edge caching and renderer failure. Financial claims, search, security headers and feedback checks passed. GitHub PR checks are the final handoff gate; the full local CI command is reserved for merge.

Evidence was kept in a local folder outside the repository. `manifest.json` records live URLs, image alt text, bytes and second-request cache hits. Page cases also have saved HTML and image response headers. The four fixtures below are labeled rendering boundaries, not invented page data.

| Saved image | Page or case | Result |
| --- | --- | --- |
| `home.png` | `/` | Page card |
| `priorities.png` | `/priorities/` | Page card |
| `budget.png` | `/budget/2019-20/` | Page card |
| `department.png` | `/department/health-and-community-services/` | Page card |
| `public-body.png` | `/body/indigenous-services-canada/` | Page card |
| `pay-employer.png` | `/pay/nl-health-services/` | Page card |
| `patterns.png` | `/flags/` | Page card |
| `method.png` | `/method/budget/` | Page card |
| `longest-card-name.png` | `/body/executive-council-intergovernmental-affairs-secretariat-igas/` | Page card |
| `largest-page-figure.png` | `/department/estimates-2026-27/` | Page card |
| `smallest-page-figure.png` | `/pay/provincial-advisory-council-on-the-status-of-women/` | Page card |
| `supplier.png` | `/supplier/410eac77b3/` | Page card |
| `largest-supplier-figure.png` | `/supplier/46e0e8ae2a/` | Page card |
| `smallest-supplier-figure.png` | `/supplier/a284a7ddcb/` | Page card |
| `french-organisation.png` | `/supplier/4bf92b2a7c/` | Page card |
| `longest-supplier-fallback.png` | `/supplier/cee0c6c17c/` | Generic fallback |
| `unverified-payee-fallback.png` | `/supplier/6600cc7d40/` | Generic fallback |
| `search.png` | `/search/?q=snow+removal` | Page card |
| `french-search.png` | `/search/?q=D%C3%A9penses+publiques` | Page card |
| `mislabelled-person-body-fallback.png` | `/body/tracy-dow/` | Generic fallback |
| `unreviewed-employer-fallback.png` | `/pay/c-a-pippy-park-commission/` | Generic fallback |
| `person-search-fallback.png` | `/search/?q=Jane+Doe` | Generic fallback |
| `unsupported-search-fallback.png` | `/search/?q=%F0%9F%98%80` | Generic fallback |
| `minister-fallback.png` | `/ministers/andrea-barbour/` | Generic fallback |
| `mha-fallback.png` | `/mha/abbott-john/` | Generic fallback |
| `pay-record-fallback.png` | `/item/575ab3f35eab/` | Generic fallback |
| `obsolete-version-fallback.png` | `/share/dynamic/000/search.png?q=snow` | Generic fallback |
| `unknown-supplier-fallback.png` | `/share/dynamic/10158e5b03236918cd65258b/supplier/0000000000.png` | Generic fallback |
| `text-overflow-fallback.png` | `/share/dynamic/10158e5b03236918cd65258b/search.png?q=health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20health%20` | Generic fallback |
| `zero-fixture.png` | Local rendering boundary fixture | Page card |
| `smallest-cents-fixture.png` | Local rendering boundary fixture | Page card |
| `largest-figure-fixture.png` | Local rendering boundary fixture | Page card |
| `french-fixture.png` | Local rendering boundary fixture | Page card |
| `generation-failure-fallback.png` | Injected renderer failure in focused check | Generic fallback |
