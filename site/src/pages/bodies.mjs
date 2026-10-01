// A page per buyer: provincial public bodies from the award reports, federal departments,
// and the two towns. Plus the federal overview and the small-purchases page.
import { card, cardAmount, organisationCard } from "../../lib/share-card.mjs";
import { esc, html, icon, Notes, leaders, bar, receipt, schedule } from "../../lib/html.mjs";
import { money, moneyWords, num, pct, date as fmtDate } from "../../lib/format.mjs";
import { desc, clip, datasetLd, orgPageLd, LICENSE } from "../seo.mjs";
import { pagehead, itemRow, ITEM_COLS, caveat, datasetLabel, federalSummary } from "../common.mjs";
import { FEDERAL_RULE } from "../../lib/federal.mjs";

import { BUYER_SETS, bodyList, bodyData } from "../bodydata.mjs";

export function bodies(D, R) {
  const out = [];
  const list = bodyList(D);

  for (const b of list) {
    const notes = new Notes();
    const slug = D.slug(b.buyer);
    const sets = b.ds.split(",");
    const { byDs, top, recent, methods, suppliers, byYear } = bodyData(D, b);
    const mmax = Math.max(...methods.map((m) => m.amount || 0), 1);
    const smax = suppliers[0]?.amount || 1;
    const subjectFlags = D.flagRows.filter((f) => f.subject_type === "buyer" && f.subject_key === b.buyer_key);
    const ymax = Math.max(...byYear.map((y) => y.amount || 0), 1);
    const dept = D.years.flatMap((y) => D.deptYear[y]).find((d) => D.slug(d.name) === D.slug(b.buyer.replace(/^Department of /, "")));

    const flagNotes = subjectFlags.map((f) => {
      const x = JSON.parse(f.detail || "{}");
      const cat = D.flagById[f.flag];
      if (f.flag === "no-competition") return `${pct(f.value)} of the reported values in ${x.source === "ppa" ? "its reported provincial awards" : "its selected federal contracts with suppliers listing an NL postal code"} were coded as awarded without open competition (${num(x.exception_awards)} of ${num(x.awards)} records).`;
      if (f.flag === "year-end") return `${pct(x.last_month_amount / x.amount)} of its dated ${x.source === "paradise" ? "payments" : "awards"} by value fell in the last month of the fiscal year, ${(f.value).toFixed(1)} times an even share.`;
      if (f.flag === "dominant-supplier") return `${esc(x.supplier)} appears on ${pct(f.value)} of its reported award values.`;
      return esc(cat?.title || f.flag);
    });

    const body = html`
${pagehead({ flagged: true, crumbs: [["/", "Home"], ["/bodies/", "Public bodies"], [null, b.buyer]], title: esc(b.buyer), lede: `${num(b.n)} records, ${moneyWords(b.amount)} in CAD published record values across all years, from ${sets.map(datasetLabel).map((s) => esc(s.toLowerCase())).join(", ")}.${sets.length > 1 ? " Sources can overlap; this sum is not a deduplicated spending total." : ""} Values are not total money paid.${dept ? ` <a href="/department/${D.slug(dept.name)}/">Program spending for ${esc(dept.name)}</a>.` : ""}` })}
<section class="section"><div class="wrap grid-2">
  <div>
    <h2 style="margin-block-end:1rem">What is on record</h2>
    ${b.level === "federal" ? caveat(`${FEDERAL_RULE} CAD totals cover only supported CAD amounts. These are selected records, not all the department’s activity. Notices and disclosures can overlap; combined record values are not spending totals.`) : ""}
    ${sets.includes("ppa") ? caveat("These are published contract award reports, not a complete ledger of this body's purchases or payments. This page shows the body as buyer; money it receives as a supplier or grant recipient belongs in a separate search.") : ""}
    ${leaders(byDs.map((d) => ({ label: `${esc(datasetLabel(d.dataset))} <span class="muted small">${num(d.n)}, ${esc(fmtDate(d.d0))} to ${esc(fmtDate(d.d1))}</span>`, value: moneyWords(d.amount) })))}
    ${flagNotes.length ? html`<h3 style="margin-block:2rem .6rem">Patterns</h3><ul class="prose">${flagNotes.map((t, i) => `<li>${t} <a href="/flags/${esc(subjectFlags[i].flag)}/">How this is worked out</a></li>`)}</ul>${caveat("A flag is a question, not a finding. It is not evidence that anything wrong happened.")}` : ""}
  </div>
  <div>
    ${methods.length > 1 ? html`<h3 style="margin-block-end:.8rem">Reported procurement methods</h3><p class="small">CAD record values, all years; sources can overlap. Federal addresses do not locate work or benefits.</p>${schedule({ compact: true, cols: [{ label: "Method" }, { label: "", w: "40%" }, { label: "Awards", num: true }, { label: "Value", num: true }], rows: methods.map((m) => ({ cells: [esc(m.m), bar(m.amount || 0, mmax), num(m.n), moneyWords(m.amount || 0)] })) })}` : ""}
    ${byYear.length > 1 ? html`<h3 style="margin-block:1.5rem .8rem">By original record date</h3><p class="small">CAD reported values, not annual payments. Sources can overlap; federal addresses do not locate work or benefits.</p>${schedule({ compact: true, cols: [{ label: "Year" }, { label: "", w: "50%" }, { label: "Value", num: true }], rows: byYear.map((y) => ({ cells: [esc(y.y), bar(y.amount || 0, ymax), moneyWords(y.amount || 0)] })) })}` : ""}
  </div>
</div></section>
${b.level === "federal" ? `<section class="section"><div class="wrap">${federalSummary(D, "buyer_key=? AND dataset IN ('fed_contract','fed_grant','canadabuys')", b.buyer_key)}</div></section>` : ""}
<section class="section"><div class="wrap">
  <h2 style="margin-block-end:1rem">Largest reported values by supplier</h2><p class="small">CAD record values, all years; sources can overlap. Federal addresses do not locate work or benefits.</p>
  ${schedule({ cols: [{ label: "Supplier" }, { label: "", w: "34%" }, { label: "Records", num: true }, { label: "Value", num: true }], rows: suppliers.map((s) => ({ cells: [`<a href="/supplier/${D.keyHash(s.supplier_key)}/">${esc(s.supplier)}</a>`, bar(s.amount || 0, smax), num(s.n), moneyWords(s.amount || 0)] })) })}
</div></section>
<section class="section"><div class="wrap">
  <h2 style="margin-block-end:1rem">Largest records</h2>
  ${schedule({ cols: ITEM_COLS, rows: top.map((a) => itemRow(D, a, { showBuyer: false })) })}
  <h2 style="margin-block:2.5rem 1rem">Most recent</h2>
  ${schedule({ cols: ITEM_COLS, rows: recent.map((a) => itemRow(D, a, { showBuyer: false })) })}
  <p style="margin-block-start:1.5rem"><a href="/search/?b=${D.keyHash(b.buyer_key)}">Search all ${num(b.n)} records for ${esc(b.buyer)} ${icon("arrow")}</a></p>
</div></section>`;
    const what = b.level === "federal" ? "federal contracts and grants" : b.level === "municipal" ? "published record values" : "contract awards";
    out.push([`/body/${slug}/`, { card: organisationCard(b.buyer, num(b.n), b.level === "federal" ? "NL-address-selected records\nAddresses do not locate work or benefits." : "Published records · all years\nSources can overlap; records are not payments."), title: `${b.buyer}: contracts, grants and payments`,
      description: b.level === "federal" ? `${b.buyer}: NL-address-selected records. Addresses do not locate work or benefits.` : desc(`${b.buyer}: ${num(b.n)} records, ${moneyWords(b.amount || 0)} in ${what}. Biggest suppliers, and the source of each record.`),
      body, notes, jsonld: [orgPageLd({ name: b.buyer, path: `/body/${slug}/`, description: `Public body in the records: ${num(b.n)} contracts, grants and payments.` })] }]);
  }

  // index
  const groups = [
    ["Provincial public bodies", list.filter((b) => b.ds.includes("ppa"))],
    ["Federal departments and agencies", list.filter((b) => !b.ds.includes("ppa") && b.level === "federal")],
    ["Towns and cities", list.filter((b) => b.level === "municipal")],
  ].filter(([, rows]) => rows.length);
  const body = html`${pagehead({ crumbs: [["/", "Home"], [null, "Public bodies"]], title: "Public bodies", lede: "Departments and agencies named in the records. Federal results are selected by reported addresses, not spending location; sources can overlap." })}
${groups.map(([title, rows]) => html`<section class="section"><div class="wrap"><h2 style="margin-block-end:1rem">${title}</h2><p class="small">CAD reported record values, all years. Sources can overlap; federal address selection does not locate work or benefit.</p>
${schedule({ compact: true, cols: [{ label: "Body" }, { label: "Records", num: true }, { label: "Value", num: true }], rows: rows.map((b) => ({ cells: [`<a href="/body/${D.slug(b.buyer)}/">${esc(b.buyer)}</a>`, num(b.n), moneyWords(b.amount || 0)] })) })}</div></section>`)}`;
  out.push(["/bodies/", { card: card("Public bodies", num(list.length), "Departments and agencies in the records"), title: "Government departments and agencies in the records", description: desc(`Every department, agency, health authority and federal department in the records: ${num(list.length)} public bodies, each with its contracts and grants.`), body }]);

  out.push(federal(D, R));
  if (D.one("SELECT count(*) n FROM items WHERE dataset='paradise'").n) out.push(smallPurchases(D, R));
  return out;
}

function federal(D, R) {
  const notes = new Notes();
  const F = D.federal;
  const c = F.contracts;
  const g = F.grants;
  const citeC = notes.cite({ url: "https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b", label: "Proactive disclosure of contracts over $10,000 (open.canada.ca), vendors reporting a Canadian NL postal code, one row per contract after amendments" });
  const citeG = notes.cite({ url: "https://open.canada.ca/data/en/dataset/432527ab-7aac-45b5-81d6-7597107a7013", label: "Proactive disclosure of grants and contributions (open.canada.ca), recipient province NL, one row per agreement after amendments" });
  const deps = D.q(`SELECT (SELECT buyer FROM buyers WHERE buyers.buyer_key = items.buyer_key) buyer, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount, sum(CASE WHEN currency='CAD' AND method='Non-competitive' THEN amount ELSE 0 END) nc FROM items WHERE dataset='fed_contract' GROUP BY buyer_key ORDER BY amount DESC LIMIT 15`);
  const gdeps = D.q(`SELECT (SELECT buyer FROM buyers WHERE buyers.buyer_key = items.buyer_key) buyer, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE dataset='fed_grant' GROUP BY buyer_key ORDER BY amount DESC LIMIT 15`);
  const mtp = Object.entries(F.public_accounts.mtp_2024_25).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const body = html`${pagehead({ crumbs: [["/", "Home"], [null, "Federal records"]], title: "Federal records linked to NL suppliers and recipients", lede: FEDERAL_RULE })}
<section class="section"><div class="wrap">
  <div class="figs">
    <div><span class="big">${moneyWords(c.dedup_value)}</span><span class="what">in ${num(c.procurements)} federal contracts with suppliers that have an NL postal code${citeC}</span></div>
    <div><span class="big">${moneyWords(c.non_competitive_value)}</span><span class="what">of selected contract values coded non-competitive</span></div>
    <div><span class="big">${moneyWords(g.dedup_value)}</span><span class="what">in ${num(g.agreements)} agreements whose publisher reports recipient province NL, including labelled address conflicts; whole commitments across all years${citeG}</span></div>
  </div>
  ${caveat("These are whole reported contract and agreement values, not payments or spending in NL. A national contract is included when its supplier lists an NL postal code; no provincial share is reported. The table below separates what the sources establish about location.")}
  ${caveat(`The federal files repeat a whole contract every time it is amended: the raw selected amendment rows add up to ${moneyWords(c.raw_value)}. Counted once each, they come to ${moneyWords(c.dedup_value)}. Grants likewise: ${moneyWords(g.raw_value)} as published, ${moneyWords(g.dedup_value)} counted once. <a href="/method/federal/">How amendments are handled</a>.`)}
</div></section>
<section class="section"><div class="wrap">${federalSummary(D, "1=1")}</div></section>
<section class="section"><div class="wrap grid-2">
  <div><h2 style="margin-block-end:1rem">Contracts by department</h2>
  ${schedule({ compact: true, cols: [{ label: "Department" }, { label: "Contracts", num: true }, { label: "Value", num: true }, { label: "Non-competitive", num: true }], rows: deps.map((d) => ({ cells: [`<a href="/body/${D.slug(d.buyer)}/">${esc(d.buyer)}</a>`, num(d.n), moneyWords(d.amount), pct(d.nc / d.amount)] })) })}</div>
  <div><h2 style="margin-block-end:1rem">Grants by department</h2>
  ${schedule({ compact: true, cols: [{ label: "Department" }, { label: "Agreements", num: true }, { label: "Value", num: true }], rows: gdeps.map((d) => ({ cells: [`<a href="/body/${D.slug(d.buyer)}/">${esc(d.buyer)}</a>`, num(d.n), moneyWords(d.amount)] })) })}</div>
</div></section>
<section class="section"><div class="wrap"><h2 style="margin-block-end:1rem">Major transfers received by NL governments and people, 2024-25</h2>
${leaders(mtp.map(([k, v]) => ({ label: esc(k), value: moneyWords(v) })))}
<p class="small muted" style="margin-block-start:1rem">Public Accounts of Canada, Volume III. Figures are published in rounded millions of CAD. These province-specific transfers are receipts, not provincial spending, and may overlap recipient records and provincial revenues. They are separate context, never added to record-value totals.</p></div></section>`;
  return ["/federal/", { title: "Federal records linked to NL suppliers and recipients",
    description: "Federal records selected by reported NL addresses, including labelled conflicts. Whole reported values; addresses do not locate work, benefits or spending.",
    body, notes,
    jsonld: [datasetLd({ name: "Federal records linked to NL suppliers and recipients", description: FEDERAL_RULE, path: "/federal/", license: LICENSE.federal, publishers: [{ name: "Proactive disclosure of contracts over $10,000", url: "https://open.canada.ca/data/en/dataset/d8f85d91-7dec-4fd1-8055-483b77225d8b" }, { name: "Proactive disclosure of grants and contributions", url: "https://open.canada.ca/data/en/dataset/432527ab-7aac-45b5-81d6-7597107a7013" }] })] }];
}

function smallPurchases(D, R) {
  const notes = new Notes();
  const p = D.one("SELECT count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount, min(date) d0, max(date) d1 FROM items WHERE dataset='paradise'");
  const under1k = D.one("SELECT count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE dataset='paradise' AND amount < 1000").n;
  const amounts = D.q("SELECT amount FROM items WHERE dataset='paradise' AND amount > 0 ORDER BY amount").map((r) => r.amount);
  const median = amounts[Math.floor(amounts.length / 2)];
  const vendors = D.q("SELECT supplier, supplier_key, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE dataset='paradise' GROUP BY supplier_key ORDER BY amount DESC LIMIT 15");
  const vmax = vendors[0].amount;
  const months = D.q("SELECT substr(date,1,7) m, sum(CASE WHEN currency='CAD' THEN amount END) amount, count(*) n FROM items WHERE dataset='paradise' AND date >= '2023-01' GROUP BY m ORDER BY m");
  const mmax = Math.max(...months.map((m) => m.amount));
  const words = D.q(`SELECT lower(description) d, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE dataset='paradise' AND description != '' GROUP BY d ORDER BY n DESC LIMIT 12`);
  const sj = D.one("SELECT count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount, sum(json_extract(extra,'$.payee_withheld')) w FROM items WHERE dataset='stjohns'");
  const sjTop = D.q("SELECT * FROM items WHERE dataset='stjohns' ORDER BY amount DESC LIMIT 15");
  const citeP = notes.cite({ url: "https://www.paradise.ca/government-engage/cheque-register/", label: "Town of Paradise, cheque and payment registers, monthly PDFs" });
  const body = html`${pagehead({ crumbs: [["/", "Home"], [null, "Small purchases"]], title: "The small purchases", lede: "Most public money goes out in amounts too small to make a contract report. Two municipalities publish every payment; the province does not." })}
<section class="section"><div class="wrap">
  <div class="figs">
    <div><span class="big">${num(p.n)}</span><span class="what">payments by the Town of Paradise, ${esc(fmtDate(p.d0))} to ${esc(fmtDate(p.d1))}${citeP}</span></div>
    <div><span class="big">${money(median)}</span><span class="what">the middle payment</span></div>
    <div><span class="big">${pct(under1k / p.n)}</span><span class="what">of payments were under $1,000</span></div>
  </div>
  ${caveat("The provincial government publishes no line-by-line payments: the Public Accounts list departments and programs, not who was paid. Federal departments publish totals only for purchases under $10,000. An access-to-information request is the only route to the province's small purchases.")}
</div></section>
<section class="section"><div class="wrap grid-2">
  <div><h2 style="margin-block-end:1rem">Paradise, month by month</h2>
  ${schedule({ compact: true, cols: [{ label: "Month" }, { label: "", w: "55%" }, { label: "Paid", num: true }], rows: months.map((m) => ({ cells: [esc(fmtDate(m.m)), bar(m.amount, mmax), moneyWords(m.amount)] })) })}</div>
  <div><h2 style="margin-block-end:1rem">Paradise's biggest vendors</h2>
  ${schedule({ compact: true, cols: [{ label: "Vendor" }, { label: "Payments", num: true }, { label: "Paid", num: true }], rows: vendors.map((v) => ({ cells: [`<a href="/supplier/${D.keyHash(v.supplier_key)}/">${esc(v.supplier)}</a>`, num(v.n), moneyWords(v.amount)] })) })}
  <h3 style="margin-block:2rem .8rem">What gets bought most often</h3>
  ${schedule({ compact: true, cols: [{ label: "Description as printed" }, { label: "Times", num: true }, { label: "Paid", num: true }], rows: words.map((w) => ({ cells: [`<a href="/search/?ds=paradise&q=${encodeURIComponent(w.d.slice(0, 60))}">${esc(w.d)}</a>`, num(w.n), moneyWords(w.amount)] })) })}</div>
</div></section>
<section class="section"><div class="wrap">
  <div class="section-head"><h2>St. John's, a sample</h2>
  <p>The City of St. John's publishes every weekly payment voucher, but as scanned images. ${num(sj.n)} lines from the first 12 pages of the 2026 file were read by machine as a sample. ${num(sj.w)} of them are payments to private individuals whose names the City blacks out; those show the description only.</p></div>
  ${schedule({ cols: ITEM_COLS, rows: sjTop.map((a) => itemRow(D, a, { showBuyer: false })) })}
  <p><a href="/search/?ds=stjohns">All sampled St. John's lines</a></p>
</div></section>`;
  return ["/small-purchases/", { title: "Small purchases: every Town of Paradise payment",
    description: desc(`The Town of Paradise publishes every payment: ${num(p.n)} payments from ${fmtDate(p.d0)} to ${fmtDate(p.d1)}, ${pct(under1k / p.n)} of them under $1,000. The province publishes none.`), body, notes }];
}
