import { init } from "satori/standalone";
import yoga from "satori/yoga.wasm";
import { initWasm } from "@resvg/resvg-wasm";
import resvg from "@resvg/resvg-wasm/index_bg.wasm";
import font from "../static/fonts/archivo-card.ttf";
import { renderCard } from "./card-render.mjs";
let ready;
export async function render(c) {
  await (ready ??= Promise.all([init(yoga),initWasm(resvg)]));
  return renderCard(c,font);
}
