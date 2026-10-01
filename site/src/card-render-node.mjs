import { readFileSync } from "node:fs";
import { init } from "satori/standalone";
import { initWasm } from "@resvg/resvg-wasm";
import { renderCard } from "../lib/card-render.mjs";
const font = readFileSync(new URL("../static/fonts/archivo-card.ttf", import.meta.url));
await Promise.all([init(readFileSync(new URL("../node_modules/satori/yoga.wasm",import.meta.url))),initWasm(readFileSync(new URL("../node_modules/@resvg/resvg-wasm/index_bg.wasm",import.meta.url)))]);
export const render = c => renderCard(c,font);
