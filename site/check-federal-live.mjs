// Read back the full-data local Worker, not the fixture database or stubbed tool results.
// Start `node site/dev.mjs 8791`, then `node site/check-federal-live.mjs http://localhost:8791`.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { esc } from "./lib/html.mjs";
import { nativeAmount, federalStatement } from "./lib/federal.mjs";

const origin = new URL(process.argv[2] || "http://localhost:8791").origin;
const fixture = JSON.parse(readFileSync(new URL("../tests/fixtures/federal/published-counterexamples.json", import.meta.url)));
async function html(path) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  return response.text();
}
async function rpc(method, params = {}) {
  const response = await fetch(origin + "/mcp", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.error, undefined, JSON.stringify(result.error));
  return result.result;
}
async function tool(name, args) {
  const result = await rpc("tools/call", { name, arguments: args });
  assert.equal(result.isError, false, JSON.stringify(result));
  return result.structuredContent;
}
assert.match((await rpc("initialize")).instructions, /Never infer where money was spent/);
const suppliers = new Set();
for (const row of fixture.ledger) {
  const id = row.id.split("-").at(-1), x = JSON.parse(row.extra), text = await html(`/item/${id}/`);
  const statement = federalStatement({ dataset: row.dataset, extra: row.extra });
  assert.ok(text.includes(esc(statement)), id);
  assert.ok(text.includes(nativeAmount(row.amount, row.currency)), id);
  assert.doesNotMatch(text, /per person in the province|of work at the median/);
  for (const key of ["og:description", "twitter:description"]) {
    const meta = text.match(new RegExp(`(?:property|name)="${key}" content="([^"]*)"`))?.[1];
    assert.ok(meta?.includes(esc(statement)), `${id}: ${key}`);
  }
  const record = await tool("get_record", { id });
  assert.equal(record.scope_status, x.scope_status);
  assert.equal(record.scope_review_state, x.scope_review_state);
  assert.equal(record.native_currency, row.currency);
  assert.equal(record.human_scale, undefined);
  assert.deepEqual(record.details.source_fields, x.source_fields);
  assert.deepEqual(record.scope_evidence || [], x.scope_evidence);
  const fetched = JSON.parse((await tool("fetch", { id })).text);
  assert.equal(fetched.qualification, statement);
  assert.equal(fetched.scope_review_state, x.scope_review_state);
  assert.equal(fetched.human_scale, undefined);
  const hash = createHash("sha1").update(row.supplier_key).digest("hex").slice(0, 10);
  if (!suppliers.has(hash)) {
    suppliers.add(hash);
    const page = await html(`/supplier/${hash}/`);
    assert.match(page, /Addresses do not locate|address selects a federal record/);
    assert.doesNotMatch(page, /per person in the province|of work at the median/);
    const supplier = await tool("get_supplier", { supplier_id: hash });
    assert.match(supplier.overlap_and_exclusion_policy, /not total receipts/);
    assert.equal(supplier.human_scale, undefined);
    assert.ok(supplier.by_source_basis_period_currency_location.length);
  }
}
// Source narratives and incomplete review wording must also survive search.
for (const [id, query, source, state] of [
  ["352559efa91e", "Golder contaminated Goose Bay", "fed_contract", "reviewed"],
  ["3b111bcf74a5", "Shirley", "fed_contract", "reviewed"],
  ["da13771f1372", "Canada Health Transfer", "pa_tp", "reviewed"],
  ["63300ec95fb3", "Stepped", "pa_pss", "unreviewed"],
]) {
  const results = await tool("search_records", { query, source });
  const record = results.records.find(r => r.id === id);
  assert.ok(record, `${id}: absent from evidence search`);
  assert.equal(record.scope_review_state, state);
  if (state === "unreviewed") assert.match(record.qualification, /NL Ledger has not established/);
  const short = await tool("search", { query });
  assert.ok(short.results.find(r => r.id === id)?.title.includes(record.qualification));
  const page = await html(`/search/?i=${id}`);
  assert.ok(page.includes(esc(record.qualification)), `${id}: HTML search qualification`);
  assert.doesNotMatch(page, /The source does not establish|No separately established work or benefit/);
}
for (const id of ["909f02da7ae3", "af355141e3d1", "7698e532de4f", "35bb90c1f35e"]) {
  assert.equal((await fetch(`${origin}/item/${id}/`)).status, 404, id);
}
const records = await tool("search_records", { query: "nationally", source: "fed_contract" });
assert.ok(records.records.some(r => r.id === "c5500509042d"));
const search = await tool("search", { query: "Kongsberg windlass" });
assert.ok(search.results.some(r => r.title.includes("USD 473,000.00")));
const flag = await tool("get_flag", { id: "contract-growth" });
assert.match(flag.why, /reported value grew/i);
assert.equal(flag.results.top_items.find(r => r.id === "c5500509042d").scope_status, "national_or_multiple_or_other");
assert.match((await tool("human_scale", { amount: 255261335.35 })).assumption, /Hypothetical/);
for (const path of ["/", "/federal/", "/data/", "/body/health-canada/", "/flags/contract-growth/", "/method/federal/", "/scale/", "/corrections/"]) {
  assert.doesNotMatch(await html(path), /Federal money in the province|that land in Newfoundland|money that was never competed|gold above adds up/);
}
for (const path of ["/federal/", "/data/"]) assert.doesNotMatch(await html(path), /"spatialCoverage"/);
const supplierPage = await html("/supplier/1f95f99cee/");
const image = supplierPage.match(/property="og:image" content="([^"]+)"/)[1];
const imageURL = new URL(image);
const png = await fetch(origin + imageURL.pathname + imageURL.search);
assert.equal(png.status, 200);
assert.equal(png.headers.get("content-type"), "image/png");
assert.equal(png.headers.get("x-share-card"), "miss", "reviewed supplier card must render, not silently fall back");
const bytes = Buffer.from(await png.arrayBuffer());
assert.equal(bytes.readUInt32BE(16), 1200); assert.equal(bytes.readUInt32BE(20), 630);
assert.match((await (await fetch(origin + "/mcp/server-card")).json()).description, /Addresses do not locate/);
assert.match(await html("/llms.txt"), /An address does not establish/);
console.log(`HTTP readback: ${fixture.ledger.length} real records, ${suppliers.size} supplier pages/tools, 4 removed-record 404s, search, fetch, flag, hypothetical scale and actual 1200×630 share PNG pass at ${origin}`);
