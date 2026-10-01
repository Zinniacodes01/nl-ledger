// The MCP server, served from the site's own address.
import { handleMcp } from "../lib/mcp.mjs";
import { searchIO } from "./_shared.js";

const cache = new Map();
let cacheBytes = 0;
const MAX_CACHE_BYTES = 8 * 1024 * 1024;
export async function onRequest(ctx) {
  const io = {
    ...searchIO(ctx),
    json: async (p) => {
      if (cache.has(p)) return cache.get(p);
      const res = await ctx.env.ASSETS.fetch(new URL(p, ctx.request.url));
      if (!res.ok) return null;
      const raw = await res.text();
      const v = JSON.parse(raw);
      const bytes = new TextEncoder().encode(raw).byteLength;
      if (cache.size >= 40 || cacheBytes + bytes > MAX_CACHE_BYTES) { cache.clear(); cacheBytes = 0; }
      if (bytes <= MAX_CACHE_BYTES) { cache.set(p, v); cacheBytes += bytes; }
      return v;
    },
  };
  return handleMcp(ctx.request, io);
}
