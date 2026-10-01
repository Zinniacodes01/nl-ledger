// Public body figures: one query implementation for pages and AI tools.
export const BUYER_SETS = ["ppa", "fed_contract", "fed_grant", "canadabuys", "paradise", "stjohns"];
export function bodyList(D) {
  const list = D.q(`SELECT (SELECT buyer FROM buyers WHERE buyers.buyer_key = items.buyer_key) buyer, buyer_key, level, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount, group_concat(DISTINCT dataset) ds
      FROM items WHERE dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) AND buyer IS NOT NULL GROUP BY buyer_key ORDER BY amount DESC`);
  return list;
}
export function bodyData(D, b) {
    const byDs = D.q(`SELECT dataset, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount, min(date) d0, max(date) d1 FROM items WHERE buyer_key=? AND dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) GROUP BY dataset`, b.buyer_key);
    const top = D.q(`SELECT * FROM items WHERE buyer_key=? AND dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) ORDER BY amount DESC LIMIT 40`, b.buyer_key);
    const recent = D.q(`SELECT * FROM items WHERE buyer_key=? AND dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) ORDER BY date DESC LIMIT 25`, b.buyer_key);
    const methods = D.q(`SELECT coalesce(method,'Not stated') m, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE buyer_key=? AND dataset IN ('ppa','fed_contract','canadabuys') GROUP BY m ORDER BY amount DESC`, b.buyer_key);
    const suppliers = D.q(`SELECT supplier, supplier_key, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE buyer_key=? AND supplier_key IS NOT NULL AND dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) GROUP BY supplier_key ORDER BY amount DESC LIMIT 15`, b.buyer_key);
    const byYear = D.q(`SELECT substr(date,1,4) y, count(*) n, sum(CASE WHEN currency='CAD' THEN amount END) amount FROM items WHERE buyer_key=? AND dataset IN (${BUYER_SETS.map((s) => `'${s}'`).join(",")}) AND date != '' GROUP BY y ORDER BY y`, b.buyer_key);
  return { byDs, top, recent, methods, suppliers, byYear };
}
export function bodiesJSON(D) {
  return bodyList(D).map(b => {
    const { byDs, byYear, suppliers } = bodyData(D,b);
    const sources = D.q(`SELECT dataset, source_url FROM items WHERE buyer_key=? AND dataset IN (${BUYER_SETS.map(() => '?').join(',')}) GROUP BY dataset,source_url`, b.buyer_key, ...BUYER_SETS);
    return { ...b, body_id: D.keyHash(b.buyer_key), page_url: `/body/${D.slug(b.buyer)}/`, byDs, byYear,
      suppliers: suppliers.map(s => ({ name: s.supplier, supplier_id: D.keyHash(s.supplier_key), records: s.n, reported_value_cad: s.amount })), sources };
  });
}
