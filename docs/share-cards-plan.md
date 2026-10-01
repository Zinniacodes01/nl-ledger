# Page share cards

Spec: `~/src/hugo/knowledge/research/nl-public-spending/brief-share-images.md`.

- [x] Prove Satori and resvg WASM with derived Archivo on a separate Worker in the real account.
- [x] Build one 1200×630 blue template with outlined wordmark, measured word wrapping, full text alt and safe fallback.
- [x] Pass explicit page figures from static builders; render content-addressed PNGs at build time. Render supplier and search cards from server-owned data on first request, caching by build/template/font version.
- [x] Check privacy, cents, zero, missing figures, French, longest text, failures, GET/HEAD, versioning and real preview/share debuggers. Save review images outside repositories.
- [ ] Open the PR, watch and repair checks. Never merge or deploy production.

Unknown supplier names and unreviewed query vocabulary fall back rather than guessing whether a name belongs to a person. Person and item pages retain the generic card. Search retains its query in the shared URL; supplier share titles retain the full name.
