import satori, { init } from "satori/standalone";
import yoga from "satori/yoga.wasm";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
import resvg from "@resvg/resvg-wasm/index_bg.wasm";
import font from "../static/fonts/archivo-card.ttf";
let ready;
export default { async fetch() {
  try { await (ready ??= Promise.all([init(yoga), initWasm(resvg)]));
  const start = performance.now();
  const svg = await satori({type:"div", props:{style:{display:"flex",flexDirection:"column",width:1200,height:630,padding:72,backgroundColor:"#1f3c96",color:"white",fontFamily:"Archivo"},children:[{type:"div",props:{style:{fontSize:52},children:"NL LEDGER"}},{type:"div",props:{style:{fontSize:120,marginTop:50},children:"$9.8 billion"}},{type:"div",props:{style:{fontSize:34,marginTop:40},children:"Dépenses publiques · Newfoundland and Labrador"}},{type:"div",props:{style:{fontSize:30,marginTop:30},children:"nlledger.ca"}}]}}, {width:1200,height:630,fonts:[{name:"Archivo",data:font,weight:850,style:"normal"}]});
  const renderer = new Resvg(svg);
  const rendered = renderer.render();
  const png = rendered.asPng();
  rendered.free(); renderer.free();
  return new Response(png,{headers:{"content-type":"image/png","cache-control":"no-store","server-timing":`render;dur=${performance.now()-start}`}});
  } catch(e) { return new Response(String(e.stack), {status:500}); }
}};
