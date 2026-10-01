// Pre-aggregate the full ledger, not a paginated search result. No personal pay records are exported.
import { groupTotals } from "../lib/totals.mjs";
import { DATASETS } from "../lib/search.mjs";
const cache = new WeakMap();
export function totalsData(D) {
  if (cache.has(D)) return cache.get(D);
  const bodies = Object.fromEntries(D.q("SELECT buyer_key, buyer FROM buyers").map(r => [r.buyer_key,r.buyer]));
  const suppliers = Object.fromEntries(D.q(`SELECT supplier_key,supplier FROM (SELECT supplier_key,supplier,row_number() OVER (PARTITION BY supplier_key ORDER BY count(*) DESC,supplier) rank FROM items WHERE supplier_key IS NOT NULL GROUP BY supplier_key,supplier) WHERE rank=1`).map(r => [r.supplier_key,r.supplier]));
  const files = {};
  for (const source of DATASETS) {
    const rows = D.q(`SELECT buyer_key, supplier_key, level, fiscal_year, coalesce(nullif(substr(date,1,4),''),fiscal_year,'not stated') year,
      currency, json_extract(extra,'$.scope_status') scope_status, json_extract(extra,'$.scope_review_state') scope_review_state,
      CASE WHEN json_extract(extra,'$.how_counted') LIKE 'sum of%' THEN 'summed amendment changes' ELSE 'published counted-once records' END counting_basis,
      count(*) records, sum(amount) value, sum(amount IS NULL) missing_amounts, sum(amount=0) zero_amounts,
      min(source_url) source_url
      FROM items WHERE dataset=? GROUP BY buyer_key,supplier_key,level,fiscal_year,year,currency,scope_status,scope_review_state,counting_basis`,source);
    files[source] = rows.map(r => ({ source, body: bodies[r.buyer_key] || 'Not stated', body_id: r.buyer_key ? D.keyHash(r.buyer_key) : null,
      supplier: suppliers[r.supplier_key] || 'Not stated', supplier_id: r.supplier_key ? D.keyHash(r.supplier_key) : null,
      level: r.level, year: r.year, fiscal_period: r.fiscal_year, currency: r.currency || 'CAD', scope_status: r.scope_status || (source.startsWith('fed_') || ['canadabuys','pa_pss','pa_tp'].includes(source) ? 'unknown' : 'provincial_records'),
      scope_review_state: r.scope_review_state, counting_basis: r.counting_basis, records: r.records, value: r.value,
      missing_amounts: r.missing_amounts, zero_amounts: r.zero_amounts || 0,
      representative_source: { url: r.source_url, note: 'One source file in this group; follow the search page for every record and locator.' },
      page_url: `/search/?ds=${source}${/^\d{4}$/.test(r.year) ? `&y=${r.year}` : ''}${r.buyer_key ? `&b=${D.keyHash(r.buyer_key)}` : ''}${r.supplier_key ? `&s=${D.keyHash(r.supplier_key)}` : ''}` }));
  }
  cache.set(D, files);
  return files;
}

export function totalsFiles(D) {
  const rows = Object.values(totalsData(D)).flat();
  const index = { suppliers: {}, supplier_aliases: {}, bodies: {}, years: [] }, files = {};
  for (const r of D.q("SELECT DISTINCT supplier_key,supplier FROM items WHERE supplier_key IS NOT NULL AND supplier_key != ''")) {
    const id = D.keyHash(r.supplier_key);
    (index.supplier_aliases[id] ||= []).push(r.supplier);
  }
  const append = (path,id,r) => { const shard = files[path] ||= {}; (shard[id] ||= []).push(r); };
  const periods = new Set();
  for (const r of rows) {
    for (const [kind,id,name] of [['suppliers',r.supplier_id,r.supplier],['bodies',r.body_id,r.body]]) if (id) {
      index[kind][id] = name;
      append(`data/totals/${kind}/${parseInt(id.slice(0,3),16) % 512}.json`, id, r);
    }
    for (const year of new Set([r.year,r.fiscal_period].filter(Boolean))) {
      if (!/^(\d{4}|\d{4}-\d{2}|calendar \d{4})$/.test(year)) continue;
      periods.add(year);
      (files[`data/totals/years/${year.replace("calendar ", "calendar-")}.json`] ||= []).push(r);
    }
  }
  index.years = [...periods].sort();
  files['data/totals/index.json'] = index;
  for (const group_by of ['supplier','body','department','year','source']) files[`data/totals/rankings/${group_by}.json`] = groupTotals(rows,{group_by,limit:100});
  return files;
}
