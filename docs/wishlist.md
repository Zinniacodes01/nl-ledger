# Wishlist

Public records that are known to exist and are not yet in NL Ledger. Each has a GitHub issue labelled [wishlist](https://github.com/nlledger/nl-ledger/labels/wishlist), where the work is discussed; comment there to pick one up. Sources already loaded are in the README.

## Provincial contracts

| Source | Why it matters | Where it lives | Status |
|---|---|---|---|
| MERX award results ([#2](https://github.com/nlledger/nl-ledger/issues/2)) | Open-call awards by departments appear on MERX, not in the Public Procurement Agency reports, so the largest competed contracts are missing from the site. | <https://www.merx.com/govnl/solicitations/awarded-bids?selectedContent=BUYER> (4,381 awarded solicitations listed) | The listing loads. Whether award values and winners are shown, and the terms of use for scraping, are untested. |
| Pre-2021 federal contracts file ([#3](https://github.com/nlledger/nl-ledger/issues/3)) | Federal contract disclosure before the years loaded would extend the federal record back in time. | <https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b> and the earlier contract files on open.canada.ca | Older files use other layouts and need their own reader. |


## Public bodies

| Source | Why it matters | Where it lives | Status |
|---|---|---|---|
| NL Health Services ([#4](https://github.com/nlledger/nl-ledger/issues/4)) | The largest public employer and purchaser in the province. Its pay lists are in the compensation disclosure; its spending detail is not loaded. | <https://www.gov.nl.ca/exec/tbs/home/publications/compensation-disclosure/> for pay; procurement and financial reports on the NL Health Services site | Scope of what is published line by line is unchecked. |
| Memorial University ([#5](https://github.com/nlledger/nl-ledger/issues/5)) | A large public body with its own pay list and purchasing. | Compensation disclosure hub above; university financial reports | Scope unchecked. |

## Influence and money in politics

| Source | Why it matters | Where it lives | Status |
|---|---|---|---|
| Lobbyist registry ([#6](https://github.com/nlledger/nl-ledger/issues/6)) | Shows who lobbied about which contracts and grants, and can be set beside the awards. | <https://cado.eservices.gov.nl.ca/Lobbyist/LobbyistSearch.aspx> | Search form only; no bulk download found. |
| Elections NL contributions ([#7](https://github.com/nlledger/nl-ledger/issues/7)) | Donor, party and amount, to set beside supplier names. | <https://www.elections.gov.nl.ca/resources/areports/> | PDFs 2017 to 2025; Excel files for 2016 to 2022 without dates. |
