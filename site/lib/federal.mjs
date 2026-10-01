// One evidence/amount contract for HTML, shares, search, shards and MCP.
export const FEDERAL_DATASETS = new Set(["fed_contract", "fed_grant", "canadabuys", "pa_pss", "pa_tp"]);
export const OVERLAP = new Set(["canadabuys", "pa_pss", "pa_tp"]);
export const FEDERAL_RULE = "An address selects a federal record; it does not establish where the work, benefit or spending occurred. Whole reported values are shown; no NL share is inferred. Conflicting address fields are labelled.";
export const OVERLAP_RULE = "Included reported record values, all years, are not total receipts or a deduplicated spending total. Public Accounts payments and CanadaBuys notices are excluded from the included summary because they can overlap contracts and grants. This does not establish that any individual excluded record is a duplicate.";
export const UNREVIEWED_STATEMENT = "NL Ledger has not established the work, benefit or jurisdiction from this record; source fields are available below.";
export const REVIEW_LABEL = { unreviewed: "Location review incomplete", reviewed: "Location evidence reviewed" };
export const SCOPE_LABEL = {
  NL: "Source identifies NL work, benefit or jurisdiction",
  national_or_multiple_or_other: "Source identifies national, multiple-region or other work or benefit; no NL share reported",
  unknown: "NL Ledger has not established work, benefit or jurisdiction",
};
export const AMOUNT_KIND = {
  fed_contract: "Latest reported federal contract value", fed_grant: "Reported federal agreement value",
  canadabuys: "Reported federal award notice value", pa_pss: "Reported federal payment", pa_tp: "Reported federal payment",
};
export const isFederal = it => FEDERAL_DATASETS.has(it.ds || it.dataset);
export const currencyOf = it => it.c || it.currency || "CAD";

export function nativeAmount(value, currency = "CAD") {
  if (value == null) return `Amount not stated (${currency === "unstated" ? "currency not stated" : currency})`;
  const number = new Intl.NumberFormat("en-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return currency === "unstated" ? `${number} (currency not stated)` : `${currency} ${number}`;
}

export function federalDetails(it) {
  return it.x || (it.extra ? JSON.parse(it.extra) : {});
}

export function federalStatement(it) {
  if (!isFederal(it)) return "";
  const x = federalDetails(it);
  const reason = x.inclusion_rule?.statement || "Selected by the reported supplier or recipient address";
  return `${reason}; ${(x.scope_statement || UNREVIEWED_STATEMENT).replace(/^The /, "the ")}`;
}

export function amountBasis(it) {
  const ds = it.ds || it.dataset;
  return federalDetails(it).amount_kind || AMOUNT_KIND[ds] || "Reported record value";
}

export function moneyLimit(it) {
  return (it.ds || it.dataset).startsWith("pa_")
    ? "This is a reported payment to the payee, not proof of subsequent spending in NL."
    : "This is the whole reported commitment or notice value, not the amount paid or an NL allocation.";
}

export function periodText(periods) {
  if (!periods?.length) return "not stated";
  if (periods.length <= 3) return periods.join("; ");
  return `${periods.length} reported periods; see individual records for dates. These are record dates and agreement terms, not spending years`;
}

// Native currencies and missing coverage remain separate; dates never become expenditure years.
export function reportedBreakdown(items) {
  const groups = new Map();
  for (const it of items) {
    const ds = it.ds || it.dataset, x = federalDetails(it), currency = currencyOf(it);
    const scope = isFederal(it) ? x.scope_status || "unknown" : "provincial_records";
    const basis = isFederal(it) ? amountBasis(it) : "Provincial reported award or payment value";
    const counting = x.how_counted?.startsWith("sum of") ? "summed amendment changes" : isFederal(it) && ds === "fed_grant" ? "latest running agreement value" : basis;
    const review = isFederal(it) ? x.scope_review_state || "unreviewed" : null;
    const key = JSON.stringify([ds, currency, scope, review, counting]);
    const group = groups.get(key) || { source: ds, currency, scope_status: scope, scope_review_state: review, amount_kind: basis,
      counting_basis: counting, included_in_summary: !OVERLAP.has(ds) && currency === "CAD",
      exclusion_reason: OVERLAP.has(ds) ? "Source can overlap contracts and grants" : currency !== "CAD" ? "No supported CAD value" : null,
      records: 0, missing_amounts: 0, zero_amounts: 0, value: 0, periods: new Set() };
    const a = it.a ?? it.amount;
    group.records++;
    if (a == null) group.missing_amounts++;
    else { group.value += a; if (a === 0) group.zero_amounts++; }
    const period = x.amount_period;
    group.periods.add(typeof period === "string" ? period : period ? [period.start || "start not stated", period.end || "end not stated"].join(" to ") : it.t || it.date || it.fy || it.fiscal_year || "period not stated");
    groups.set(key, group);
  }
  return [...groups.values()].map(g => ({ ...g, value: g.records === g.missing_amounts ? null : Math.round(g.value * 100) / 100, periods: [...g.periods].sort() }));
}
