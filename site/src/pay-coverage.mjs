// The existing publisher_issues table stores URLs, not employer/year metadata. These
// exact file mappings come from the government's 2022 and 2023 disclosure listings,
// checked 2026-09-30. Do not infer a year from an undated filename or call a gap zero.
const LISTING = 'https://www.gov.nl.ca/exec/tbs/home/publications/compensation-disclosure/';
const FILES = {
  'Newfoundland-and-Labrador-Health-Services-Compensation-Disclosure.xlsx': ['NL Health Services', 2023],
  'NLHC-Compensation-Disclosure.xlsx': ['NL Housing Corporation', 2023],
  'Newfoundland-and-Labrador-Hydro-and-Affiliates-Compensation-Disclosure.xlsx': ['NL Hydro and affiliates', 2023],
  'NLC-Compensation-Disclosure.xlsx': ['NL Liquor Corporation', 2023],
  'Oil-and-Gas-Corporation-of-Newfoundland-and-Labrador-Compensation-Disclosure.xlsx': ['Oil and Gas Corporation of NL', 2023],
  'PACSW-Compensation-Disclosure.xlsx': ['Provincial Advisory Council on the Status of Women', 2023],
  'PILRB-Compensation-Disclosure.xlsx': ['Provincial Information and Library Resources Board', 2023],
  'PPA-Compensation-Disclosure.xlsx': ['Public Procurement Agency', 2023],
  'PSC-Compensation-Disclosure.xlsx': ['Public Service Commission', 2023],
  'RNC-Compensation-Disclosure.xlsx': ['Royal Newfoundland Constabulary', 2023],
  'The-Rooms-Compensation-Disclosure-2.xlsx': ['The Rooms Corporation', 2023],
  'WHSCRD-Compensation-Disclosure-1.xlsx': ['Workplace Health, Safety and Compensation Review Division', 2023],
  'Workplace-NL-Compensation-Disclosure.xlsx': ['WorkplaceNL', 2023],
  'CUDGC-Compensation-Disclosure-2022-1.xlsx': ['Credit Union Deposit Guarantee Corporation', 2022],
  'NLESD-2022-Compensation-Disclosure-2022.xlsx': ['NL English School District', 2022],
  'NL-Housing-Corporation-Compensation-Disclosure-2022.xlsx': ['NL Housing Corporation', 2022],
  'NLH-and-Affiliates-Compensation-Disclosure-2022.xlsx': ['NL Hydro and affiliates', 2022],
  'NL-Liquor-Corporation-Compensation-Disclosure-2022.xlsx': ['NL Liquor Corporation', 2022],
  'Oil-and-Gas-Corporation-NL-Compensation-Disclosure-2022.xlsx': ['Oil and Gas Corporation of NL', 2022],
};

export function payIssues(issues, employer) {
  return issues.flatMap(i => {
    if (i.source !== 'Compensation disclosure') return [];
    const url = new URL(i.url);
    if (url.origin !== 'https://www.gov.nl.ca' || !url.pathname.startsWith('/exec/tbs/files/')) return [];
    const file = FILES[url.pathname.split('/').pop()];
    if (!file || file[0] !== employer) return [];
    return [{ ...i, year: String(file[1]), listing: `${LISTING}compensation-disclosure-${file[1]}/` }];
  });
}
