// Opt-in proof on a disposable REAL D1 database. Never pass the live database ID.
// D1_SECURITY_TEST_ID=<new disposable DB UUID> cf auth profile via CF_PROFILE=<profile>
// node site/check-feedback-d1.mjs; the caller deletes the disposable database afterwards.
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { FEEDBACK_INSERT_QUERY } from "./routes/feedback.js";
const run = promisify(execFile);
const id = process.env.D1_SECURITY_TEST_ID;
assert.match(id || "", /^[a-f0-9-]{36}$/, "Set D1_SECURITY_TEST_ID to a disposable database UUID");
if (process.env.NL_LEDGER_D1_ID) assert.notEqual(id, process.env.NL_LEDGER_D1_ID, "Never use live D1");
const profile = process.env.CF_PROFILE;
async function cf(args) {
  const {stdout} = await run("cf", [...args, ...(profile ? ["--profile", profile] : [])], {maxBuffer: 1_000_000});
  return JSON.parse(stdout);
}
const db = await cf(["d1", "get", id]);
assert.match(db.name, /^nl-ledger-security-quota-check-/, "Only a newly created security quota fixture database is allowed");
assert.equal(db.num_tables, 0, "The disposable database must be empty before the check");
const query = async(sql, params=[]) => cf(["d1", "query", id, "--body", JSON.stringify({sql,params})]);
await query(readFileSync(new URL("./feedback.sql", import.meta.url), "utf8"));
for (const mode of ["total", "confirm"]) {
  const cap = mode === "total" ? 300 : 60;
  const checked = mode === "total" ? "turnstile" : "confirm";
  const now = new Date().toISOString(), since = new Date(Date.now()-86_400_000).toISOString();
  await query("DELETE FROM feedback");
  await query(`WITH RECURSIVE fill(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM fill WHERE n < ?)
    INSERT INTO feedback(created,note,checked,nonce) SELECT ?, 'dummy quota fixture', ?, 'fill-' || n FROM fill`, [cap-1,now,checked]);
  const params = (nonce) => [now,"","/flags/","dummy concurrency check","",checked,nonce,since,300,checked,since,60];
  const results = await Promise.all(["dummy-a","dummy-b"].map(nonce=>query(FEEDBACK_INSERT_QUERY,params(nonce))));
  assert.equal(results.flatMap(batch=>batch.flatMap(result=>result.results)).length,1,`${mode}: one returned ID, so only one email may be scheduled`);
  const count = await query("SELECT count(*) AS n FROM feedback");
  assert.equal(count[0].results[0].n,cap,`${mode}: concurrent real D1 inserts stop at capacity`);
  const replay = await query(FEEDBACK_INSERT_QUERY,params("dummy-a"));
  assert.equal(replay[0].results.length,0,"Replay cannot store or schedule email again");
  console.log(`Real D1: concurrent ${mode} boundary stays at ${cap}; one insert, one possible mail`);
}
console.log("Disposable real D1 quota checks: pass (no feedback endpoint or mail called)");
