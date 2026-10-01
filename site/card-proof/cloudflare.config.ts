import { defineConfig } from "cf/config";
import { existsSync } from "node:fs";
if (existsSync("../.env")) process.loadEnvFile("../.env");
export default defineConfig({ accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "", worker: { name: "nlledger-cards-proof", entrypoint: "./worker.mjs", compatibilityDate: "2026-09-01", workersDev: true, limits: { cpuMs: 1000 }, observability: { enabled: true } } });
