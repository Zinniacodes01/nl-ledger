// Server-owned card text only: URLs never accept an amount or arbitrary card title.
import publicOrganisations from "./card-organisations.json" with { type: "json" };
import { fitText } from "./card-fit.mjs";
import { SITE, money, moneyWords } from "./format.mjs";
export const FALLBACK = { image: "/og.png", alt: `${SITE.name}: ${SITE.tagline}` };
export const cardAmount = (v) => !Number.isFinite(v) ? null : Math.abs(v) < 1 && v !== 0 ? money(v, { cents: true }) : moneyWords(v);
export function card(title, figure = "", label = "") {
  return { title: String(title), figure: String(figure ?? ""), label: String(label) };
}
// Exact, reviewed organisation names. Legal suffixes alone cannot rule out a person's name.
const ORGANISATIONS = new Set([
  ...publicOrganisations,
  "government of newfoundland and labrador",
  "nunatsiavut government",
  "inmarsat solutions (canada) inc./",
  "mushuau innu first nation",
  "sc2.0 stepped care solutions inc",
  "st. john's dockyard",
  "miawpukek band",
  "sheshatshiu innu first nation",
  "mamu tshishkutamashutau innu education inc.",
  "prov. newfoundland & labrador - child & family ser",
  "qalipu mi'kmaq first nation band",
  "association for new canadians",
  "microsoft canada inc.",
  "corner brook pulp and paper limited",
  "labrador innu round table secretariat",
  "rjg construction ltd",
  "city of st. john's",
  "innu nation",
  "braya renewable fuels (newfoundland) lp",
  "nunatukavut community council inc.",
  "narl marketing limited partnership",
  "jcl investments inc.",
  "canadian health labs",
  "newfoundland and labrador department of justice and public safety",
  "kraken robotic systems inc.",
  "right coast wind corp.",
  "newfoundland and labrador association of technology and innovation inc.",
  "labrador aboriginal training partnership",
  "port of argentia inc.",
  "marine contractors inc",
  "pennecon heavy civil limited",
  "town of grand falls-windsor",
  "st. john's international airport authority",
  "choices for youth inc",
  "bulldog contracting ltd",
  "miawpukek first nation",
  "labrador marine inc.",
  "end homelessness st. john's inc",
  "ge healthcare canada",
  "petroleum research newfoundland and labrador",
  "nunacor development corporation",
  "labrador friendship centre",
  "first light st. john's friendship centre inc.",
  "town of torbay",
  "cactus ship repair inc",
  "c-core",
  "hydro quebec",
  "kongsberg digital simulation ltd.",
  "marco group limited",
  "enercon builders inc.",

  "memorial university of newfoundland", "memorial university of newfoundland and labrador",
  "memorial university", "fisheries and marine institute of memorial university",
  "conseil scolaire francophone provincial",
  "fédération des francophones de terre-neuve et du labrador", "college of the north atlantic", "marine atlantic inc.",
  "marine atlantic inc", "newfoundland and labrador hydro", "newfoundland power inc.",
  "newfoundland power inc", "newfoundland and labrador health services",
  "newfoundland and labrador housing corporation", "canadian red cross society",
  "the canadian red cross society", "newfoundland and labrador credit union",
]);
export function organisationCard(name, figure, label) {
  if (!ORGANISATIONS.has(String(name).normalize("NFC").toLowerCase())) return null;
  return card(name, figure, label);
}
export function supplierCard(s) {
  if (!s || !ORGANISATIONS.has(s.name.normalize("NFC").toLowerCase())) return null;
  const amount = cardAmount(s.total);
  if (amount === null) return null;
  return card(s.name, amount, "CAD record values · all years\nSources can overlap; addresses do not locate work or benefits.");
}
// A free-text query may itself be a person's name. Only reviewed spending vocabulary is pictured.
const SEARCH_WORDS = new Set("snow removal roads road ferry ferries hospital hospitals health education school schools contracts contract grants grant spending budget salaries salary overtime severance procurement sole source emergency awards award payments payment construction maintenance equipment services public provincial federal municipal water sewage transport transportation infrastructure dépenses publiques santé éducation contrats subventions déneigement routes travaux entretien".split(" "));
export function canonicalQuery(query) {
  const raw = String(query ?? "");
  if (raw.length > 300) return null;
  const q = raw.normalize("NFC").replace(/\s+/g, " ").trim();
  return q.length <= 300 ? q : null;
}
export function searchCard(query) {
  const q = canonicalQuery(query);
  if (q === null) return null;
  if (q && !q.toLowerCase().split(" ").every(w => SEARCH_WORDS.has(w))) return null;
  return card(q ? `Search: ${q}` : "Search public spending", "", "The words searched · no results pictured");
}
export const cardAlt = c => `${SITE.name}. ${[c.title, c.figure, c.label.replace(/\n/g, " ")].filter(Boolean).join(". ")}. nlledger.ca`;
export function dynamicShare(c, version, type, id = "") {
  if (!c) return FALLBACK;
  try {
    fitText(c.title,{maxSize:54,minSize:28,maxLines:3});
    fitText(c.figure,{maxSize:116,minSize:36,maxLines:1});
    fitText(c.label,{maxSize:26,minSize:22,maxLines:3});
  } catch { return FALLBACK; }
  return { image: `/share/dynamic/${version}/${type}${type === "supplier" ? `/${id}` : ""}.png${type === "search" && id ? `?q=${encodeURIComponent(id)}` : ""}`, alt: cardAlt(c) };
}
