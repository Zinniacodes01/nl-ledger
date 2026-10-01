import satori from "satori/standalone";
import { Resvg } from "@resvg/resvg-wasm";
import { cardTree } from "./card-template.mjs";
export async function renderCard(c, font) {
  const svg = await satori(cardTree(c), {width:1200,height:630,fonts:[{name:"Archivo",data:font,weight:850,style:"normal"}]});
  const renderer = new Resvg(svg);
  let image;
  try { image=renderer.render(); return image.asPng(); }
  finally { image?.free(); renderer.free(); }
}
