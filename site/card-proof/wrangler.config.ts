import { defineWranglerConfig } from "wrangler/experimental-config";
export default defineWranglerConfig({ rules: [{ type: "Data", globs: ["**/*.ttf"], fallthrough: true }] });
