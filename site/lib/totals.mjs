// Build-time record rollups and runtime rankings use the site's shared evidence policy.
import { OVERLAP, OVERLAP_RULE, FEDERAL_RULE, AMOUNT_KIND } from "./federal.mjs";
export const RECORD_KINDS = { ppa: "Published provincial award value", sunshine: "Published compensation above $100,000", minister: "Published expense claim", mha: "Published allowance expense" };
export const TOTALS_NOTE = `${OVERLAP_RULE} ${FEDERAL_RULE} Results stay separate by source, native currency and location evidence. Years are original record dates (or published fiscal/calendar periods), not annual spending. Award values are not payments; provincial accounts and major transfers are outside these record totals.`;
const round = n => Math.round(n * 100) / 100;
export function groupTotals(rows, { group_by = "source", year, supplier_id, body_id, limit = 20 } = {}) {
  const groups = new Map();
  for (const r of rows) {
    if (year && r.year !== year && r.fiscal_period !== year) continue;
    if (supplier_id && r.supplier_id !== supplier_id) continue;
    if (body_id && r.body_id !== body_id) continue;
    const label = group_by === 'supplier' ? r.supplier : ['body','department'].includes(group_by) ? r.body : group_by === 'year' ? r.year : r.source;
    const id = group_by === 'supplier' ? r.supplier_id : ['body','department'].includes(group_by) ? r.body_id : label;
    if (!id) continue;
    const key = JSON.stringify([id,r.source,r.currency]);
    const g = groups.get(key) || { name: label, id, source: r.source, level: r.level, currency: r.currency,
      amount_kind: AMOUNT_KIND[r.source] || RECORD_KINDS[r.source] || "Reported record value",
      scope_status: r.scope_status, scope_review_state: r.scope_review_state, counting_basis: r.counting_basis,
      included_in_summary: !OVERLAP.has(r.source) && r.currency === 'CAD',
      exclusion_reason: OVERLAP.has(r.source) ? 'Source can overlap contracts and grants; no individual duplicate is asserted' : r.currency !== 'CAD' ? 'No supported CAD value' : null,
      records: 0, missing_amounts: 0, zero_amounts: 0, value: 0, years: new Set(), evidence: new Map(),
      representative_source: r.representative_source, page_url: r.page_url };
    g.records += r.records; g.missing_amounts += r.missing_amounts; g.zero_amounts += r.zero_amounts;
    g.value += r.value || 0; g.years.add(r.year);
    const ek = JSON.stringify([r.scope_status,r.scope_review_state,r.counting_basis]);
    const ev = g.evidence.get(ek) || { scope_status: r.scope_status, scope_review_state: r.scope_review_state, counting_basis: r.counting_basis, records: 0, missing_amounts: 0, zero_amounts: 0, value: 0 };
    ev.records += r.records; ev.missing_amounts += r.missing_amounts; ev.zero_amounts += r.zero_amounts; ev.value += r.value || 0;
    g.evidence.set(ek,ev); groups.set(key,g);
  }
  // Rank within each source/currency; location and counting evidence remains explicit per group.
  const partitions = new Map();
  for (const g of groups.values()) {
    const key = JSON.stringify([g.source,g.currency]);
    const p = partitions.get(key) || { source: g.source, currency: g.currency, amount_kind: g.amount_kind,
      included_in_summary: g.included_in_summary, exclusion_reason: g.exclusion_reason, groups: [] };
    p.groups.push({ ...g, scope_status: undefined, scope_review_state: undefined, counting_basis: undefined, evidence: [...g.evidence.values()].map(e => ({ ...e, value: e.records === e.missing_amounts ? null : round(e.value) })), value: g.records === g.missing_amounts ? null : round(g.value), years: [...g.years].sort(),
      records_url: `/search/?ds=${g.source}${year && /^\d{4}$/.test(year) ? `&y=${year}` : group_by === 'year' && /^\d{4}$/.test(g.id) ? `&y=${g.id}` : ''}${supplier_id || group_by === 'supplier' ? `&s=${supplier_id || g.id}` : ''}${body_id || ['body','department'].includes(group_by) ? `&b=${body_id || g.id}` : ''}`,
      page_url: group_by === 'supplier' ? `/supplier/${g.id}/` : ['body','department'].includes(group_by) ? `/search/?b=${g.id}` : `/search/?ds=${g.source}${group_by === 'year' && /^\d{4}$/.test(g.id) ? `&y=${g.id}` : ''}` });
    partitions.set(key,p);
  }
  return [...partitions.values()].map(p => {
    p.groups.sort((a,b) => (b.value ?? -Infinity) - (a.value ?? -Infinity) || a.name.localeCompare(b.name));
    return { ...p, total_groups: p.groups.length, truncated: p.groups.length > limit, groups: p.groups.slice(0,limit) };
  });
}
