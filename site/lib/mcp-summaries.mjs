import { computeReceipt, RECEIPT_ASSUMPTIONS } from "./receipt.mjs";
import { groupTotals, TOTALS_NOTE } from "./totals.mjs";
import { SITE } from "./format.mjs";
import { DATASETS } from "./search.mjs";
const error = (message, extra = {}) => ({ error: message, ...extra });
const abs = p => new URL(p, SITE.url).href;
function resolve(rows, field, name) {
  const want = String(name).trim().toLowerCase();
  const names = r => [r[field], ...(r.aliases || [])].map(n => String(n).toLowerCase());
  const exact = rows.filter(r => names(r).includes(want));
  const hits = exact.length ? exact : rows.filter(r => names(r).some(n => n.includes(want)));
  return hits.length === 1 ? hits[0] : error(hits.length ? 'Name matches more than one entry; choose an exact name.' : 'No entry by that name.', { choices: (hits.length ? hits : rows).slice(0,30).map(r => r[field]), total_choices: (hits.length ? hits : rows).length });
}
export async function summaryTool(name, args, io) {
  if (name === 'get_pay') {
    const P = await io.json('/data/pay.json');
    if (!P) return error('Pay figures are unavailable.');
    if (args.year && !/^\d{4}$/.test(args.year)) return error('year must be a four-digit calendar year.');
    if (args.year && !P.years.includes(args.year)) return error('No coverage for that year.', { years: P.years });
    if (!args.employer) return { employers: P.employers.map(e => ({ employer: e.employer, by_year: args.year ? e.by_year.filter(y => y.year === args.year) : e.by_year, page_url: abs(e.page_url) })), years: P.years, caveat: P.caveat };
    const e = resolve(P.employers, 'employer', args.employer);
    if (e.error) return e;
    const y = args.year || e.latest_year;
    const { titles_by_year, ...out } = e;
    return { ...out, by_year: args.year ? e.by_year.filter(r => r.year === args.year) : e.by_year,
      titles: titles_by_year[y] || [], title_year: y, page_url: abs(e.page_url), caveat: P.caveat,
      individuals: 'Use search_records with source sunshine for individual published records.' };
  }
  if (name === 'get_body') {
    const B = await io.json('/data/bodies.json');
    if (!B) return error('Public body figures are unavailable.');
    if (!args.name) return { bodies: B.map(b => ({ name: b.buyer, body_id: b.body_id, page_url: abs(b.page_url) })), caveat: TOTALS_NOTE };
    const b = resolve(B, 'buyer', args.name);
    if (b.error) return b;
    const rows = (await narrowRows(io,'bodies',b.body_id)).filter(r => b.ds.split(',').includes(r.source));
    return { name: b.buyer, body_id: b.body_id, page_url: abs(b.page_url),
      reported_record_values_cad: b.amount, records: b.n, by_source: b.byDs, by_year: b.byYear,
      largest_suppliers: b.suppliers.map(s => ({ ...s, page_url: abs(`/supplier/${s.supplier_id}/`) })), sources: b.sources,
      separated_by_year_and_source: absoluteGroups(groupTotals(rows, { group_by: 'year', limit: 100 })),
      caveat: 'The page’s combined CAD record values can overlap. They are not a deduplicated spending total or money paid. ' + TOTALS_NOTE };
  }
  if (name === 'tax_receipt') {
    if (typeof args.income !== 'number' || !Number.isFinite(args.income) || args.income < 0 || args.income > 10_000_000) return error('income must be annual employment income in dollars, from 0 to 10000000.');
    const R = await io.json('/data/receipt.json');
    if (!R) return error('Receipt figures are unavailable.');
    const c = computeReceipt(R,Math.floor(args.income));
    return { employment_income_cad: c.income, income_note: "Income is rounded down to whole dollars, as on the receipt page.", estimated_provincial_income_tax_cad: c.tax,
      spending_fiscal_year: R.year, tax_parameters: R.tax, spending_basis_cad: R.total,
      departments: c.lines.map(d => ({ name: d.name, spending_share: d.share, illustrated_tax_share_cad: d.yours, page_url: abs(`/department/${d.slug}/`) })),
      assumptions: RECEIPT_ASSUMPTIONS + ' Includes basic personal, base CPP and EI credits, enhanced CPP deductions and single-person low-income reduction. Federal income tax, sales tax and other levies are excluded. Spending shares illustrate a distribution, not where a person’s tax was paid.',
      source: R.source, page_url: abs(`/receipt/?income=${c.income}`), method_url: abs('/method/receipt/') };
  }
  if (name === 'get_totals') {
    const group_by = args.group_by || 'source';
    if (!['supplier','body','department','year','source'].includes(group_by)) return error('Choose supplier, body, department, year or source for group_by.');
    if (args.source && !DATASETS.includes(args.source)) return error('Unknown source.', { sources: DATASETS });
    if (args.year !== undefined && (typeof args.year !== 'string' || !/^(\d{4}|\d{4}-\d{2}|calendar \d{4})$/.test(args.year))) return error('year must be a calendar year or a published fiscal period.');
    if (args.limit !== undefined && (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 100)) return error('limit must be an integer from 1 to 100.');
    for (const k of ['supplier_id','body_id']) if (args[k] && !/^[a-f0-9]{10}$/.test(args[k])) return error(`${k} must be a 10-character id.`);
    const index = await io.json('/data/totals/index.json');
    if (!index) return error('Totals are unavailable.');
    const filters = { group_by, year: args.year, limit: args.limit || 20, supplier_id: args.supplier_id, body_id: args.body_id };
    for (const [arg,kind,field,id] of [['supplier','suppliers','supplier','supplier_id'],['body','bodies','body','body_id'],['department','bodies','body','body_id']]) {
      if (!args[arg]) continue;
      const entries = Object.entries(index[kind]).map(([key,value]) => ({ [field]: value, [id]: key, aliases: kind === "suppliers" ? index.supplier_aliases?.[key] : [] }));
      const match = resolve(entries,field,args[arg]);
      if (match.error) return match;
      if (filters[id] && filters[id] !== match[id]) return error('Name and id filters disagree.');
      filters[id] = match[id];
    }
    if ((filters.supplier_id && !index.suppliers[filters.supplier_id]) || (filters.body_id && !index.bodies[filters.body_id])) return { group_by, filters, partitions: [], no_matches: true, caveat: TOTALS_NOTE };
    let rows, partitions;
    if (filters.supplier_id || filters.body_id || filters.year) {
      rows = filters.supplier_id ? await narrowRows(io,'suppliers',filters.supplier_id)
        : filters.body_id ? await narrowRows(io,'bodies',filters.body_id)
        : await io.json(`/data/totals/years/${filters.year.replace("calendar ", "calendar-")}.json`) || [];
      if (args.source) rows = rows.filter(r => r.source === args.source);
      partitions = groupTotals(rows,filters);
    } else {
      partitions = await io.json(`/data/totals/rankings/${group_by}.json`);
      if (!partitions) return error('Totals are unavailable.');
      if (args.source) partitions = partitions.filter(p => p.source === args.source);
      partitions = partitions.map(p => ({ ...p, truncated: p.total_groups > filters.limit, groups: p.groups.slice(0,filters.limit) }));
    }
    return { group_by, filters, partitions: absoluteGroups(partitions), caveat: TOTALS_NOTE,
      department_note: 'Department filters and groups refer to named record buyers, not departmental program accounts. Use get_department or get_budget for program spending.',
      method_url: abs('/method/federal/'), no_matches: !partitions.length };
  }
}
function absoluteGroups(partitions) {
  return partitions.map(p => ({ ...p, groups: p.groups.map(g => ({ ...g, page_url: abs(g.page_url), records_url: abs(g.records_url) })) }));
}

async function narrowRows(io, kind, id) {
  const shard = await io.json(`/data/totals/${kind}/${parseInt(id.slice(0,3),16) % 512}.json`);
  if (!shard) throw new Error('Totals data file is unavailable.');
  return shard[id] || [];
}
