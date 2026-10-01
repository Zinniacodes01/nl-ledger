// Supplier summaries for /supplier/<hash>/ pages, split into 512 JSON shards so a
// Worker route reads one small file per request.
//
// A supplier is a group of printed names (pipeline/suppliers.py). Where a group combines
// several names, each name's own key also gets an entry { to: <group hash> }, so a link or
// an AI-server lookup by that name finds the supplier, only if that name identifies
// one group. Ambiguous names never select an identity or replace an unresolved page.
import { reportedBreakdown, OVERLAP } from "../lib/federal.mjs";
export const SHARDS = 512;

export function shardOf(hash) {
  return parseInt(hash.slice(0, 4), 16) % SHARDS;
}

export function buildSupplierShards(D) {
  const files = {};
  const rows = D.q(`SELECT id, dataset, level, buyer, buyer_key, supplier, supplier_key, supplier_name_key, description, amount, currency, amount_original,
      date, fiscal_year, method, city, province, extra, source_url, page, locator FROM items
      WHERE supplier_key IS NOT NULL AND supplier_key != '' AND dataset != 'sunshine' ORDER BY supplier_key`);
  const owners = new Map();
  const groupHashes = new Set(rows.map(it => D.keyHash(it.supplier_key)));
  for (const it of rows) {
    if (!owners.has(it.supplier_name_key)) owners.set(it.supplier_name_key, new Set());
    owners.get(it.supplier_name_key).add(it.supplier_key);
  }
  let count = 0;
  let i = 0;
  while (i < rows.length) {
    const key = rows[i].supplier_key;
    let j = i;
    while (j < rows.length && rows[j].supplier_key === key) j++;
    const its = rows.slice(i, j);
    i = j;
    count++;
    const h = D.keyHash(key);
    const names = {};
    const variants = {};
    const byDs = {};
    const byYear = {};
    const buyers = {};
    const flags = {};
    let total = 0;
    // Public Accounts payments and CanadaBuys notices can overlap contracts and grants.
    // Exclude these sources by policy; a record-level duplicate match is not implied.
    let overlap = 0;
    for (const it of its) {
      names[it.supplier] = (names[it.supplier] || 0) + 1;
      const a = (it.currency || "CAD") === "CAD" ? it.amount || 0 : 0;
      const v = (variants[it.supplier_name_key] ||= { printed: {}, n: 0, a: 0 });
      v.printed[it.supplier] = (v.printed[it.supplier] || 0) + 1;
      v.n++;
      if (!OVERLAP.has(it.dataset)) v.a += a;
      if (OVERLAP.has(it.dataset)) overlap += a;
      else total += a;
      (byDs[it.dataset] ||= [0, 0])[0]++;
      byDs[it.dataset][1] += a;
      const y = (it.date || "").slice(0, 4) || (it.fiscal_year || "").match(/\d{4}/)?.[0];
      if (y && !OVERLAP.has(it.dataset)) byYear[y] = (byYear[y] || 0) + a;
      const b = (buyers[it.buyer] ||= { name: it.buyer, level: it.level, n: 0, amount: 0, included: 0, excluded: 0 });
      b.n++;
      b.amount += a;
      b[OVERLAP.has(it.dataset) ? "excluded" : "included"] += a;
      for (const f of D.itemFlags.get(it.id) || []) flags[f] = (flags[f] || 0) + 1;
    }
    const name = Object.entries(names).sort((a, b) => b[1] - a[1])[0][0];
    const top = [...its].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 40).map((it) => ({
      i: it.id.split("-").pop(), ds: it.dataset, b: it.buyer, d: (it.description || "").slice(0, 200), a: it.amount,
      c: it.currency !== "CAD" ? it.currency : undefined, o: it.amount_original || undefined, t: it.date || it.fiscal_year,
      m: it.method || undefined, u: it.source_url, g: it.page || undefined, l: it.locator, f: D.itemFlags.get(it.id) || undefined,
      lv: it.level, x: JSON.parse(it.extra || "{}"),
    }));
    // Several printed names joined on evidence: each with its record count, value and the
    // hash that filters search to its own records.
    const combined = Object.keys(variants).length > 1
      ? Object.entries(variants).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => ({
        t: Object.entries(v.printed).sort((a, b) => b[1] - a[1])[0][0], h: D.keyHash(k), n: v.n, a: v.a,
      }))
      : undefined;
    for (const [k] of Object.entries(variants)) {
      const alias = D.keyHash(k);
      if (combined && alias !== h && owners.get(k).size === 1 && !groupHashes.has(alias)) {
        (files[shardOf(alias)] ||= {})[alias] = { to: h };
      }
    }
    const identity = D.matching?.identities?.[key] || {};
    const n = shardOf(h);
    (files[n] ||= {})[h] = {
      businessNumbers: identity.business_numbers, anchors: identity.anchors,
      name, key, combined, names: !combined && Object.keys(names).length > 1 ? Object.keys(names).slice(0, 8) : undefined,
      total, overlap, n: its.length, byDs, byYear, breakdown: reportedBreakdown(its),
      buyers: Object.values(buyers).sort((a, b) => b.amount - a.amount),
      flags, top, city: its.find((x) => x.city)?.city,
    };
  }
  // Shared printed names link every surviving piece. Read totals from final ledger pages,
  // never from pre-dedup matching statistics. Resolved anchors still disclose related pieces.
  const pages = new Map(Object.values(files).flatMap(f => Object.entries(f)).filter(([, s]) => !s.to));
  const relatedByKey = new Map();
  for (const keys of owners.values()) if (keys.size > 1) {
    for (const key of keys) {
      const related = relatedByKey.get(key) || new Set();
      for (const other of keys) if (other !== key) related.add(D.keyHash(other));
      relatedByKey.set(key, related);
    }
  }
  for (const [h, s] of pages) {
    const related = relatedByKey.get(s.key) || new Set();
    for (const key of D.matching?.identities?.[s.key]?.related || []) {
      const other = D.keyHash(key);
      if (other !== h && pages.has(other)) related.add(other);
    }
    if (related.size) {
      s.related = [...related].sort().map(h => {
        const other = pages.get(h);
        return { h, name: other.name, total: other.total, overlap: other.overlap, n: other.n };
      });
      s.identityUnresolved = !s.anchors?.length || [...related].some(h => !pages.get(h).anchors?.length);
    }
  }
  checkTotals(D, files, count);
  return { files, count };
}

// Supplier pages must add up to the records: every record on exactly one page, and each
// page's total and overlap together equal to the money on its records. A difference stops
// the build (and so the deploy).
function checkTotals(D, files, count) {
  const want = D.q(`SELECT count(*) n, count(DISTINCT supplier_key) g,
      sum(CASE WHEN coalesce(currency,'CAD')='CAD' AND dataset NOT IN ('pa_pss', 'pa_tp', 'canadabuys') THEN coalesce(amount, 0) ELSE 0 END) total,
      sum(CASE WHEN coalesce(currency,'CAD')='CAD' AND dataset IN ('pa_pss', 'pa_tp', 'canadabuys') THEN coalesce(amount, 0) ELSE 0 END) overlap
      FROM items WHERE supplier_key IS NOT NULL AND supplier_key != '' AND dataset != 'sunshine'`)[0];
  const got = { n: 0, g: 0, total: 0, overlap: 0 };
  const pages = new Set();
  const aliases = [];
  for (const file of Object.values(files)) {
    for (const [h, s] of Object.entries(file)) {
      if (s.to) { aliases.push([h, s.to]); continue; }
      pages.add(h);
      got.n += s.n; got.g++; got.total += s.total; got.overlap += s.overlap;
    }
  }
  const off = (a, b) => Math.abs(a - b) > 1;
  const bad = [];
  if (got.n !== want.n || got.g !== want.g || got.g !== count) bad.push(`records ${got.n} of ${want.n}, suppliers ${got.g} of ${want.g}`);
  if (off(got.total, want.total)) bad.push(`totals ${got.total.toFixed(2)} against ${want.total.toFixed(2)}`);
  if (off(got.overlap, want.overlap)) bad.push(`overlap ${got.overlap.toFixed(2)} against ${want.overlap.toFixed(2)}`);
  for (const [h, to] of aliases) if (!pages.has(to)) bad.push(`name ${h} points to missing supplier ${to}`);
  if (bad.length) throw new Error(`supplier pages do not add up to the records: ${bad.join("; ")}`);
  console.log(`supplier totals: ${got.g} suppliers, ${got.n} records, $${got.total.toFixed(2)} plus $${got.overlap.toFixed(2)} overlap, as the records; ${aliases.length} other names point to them`);
}
