import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["cjs", "esm"],
    dts: true,
    clean: true,
    target: "es2022",
    outExtension: ({ format }) => ({ js: format === "cjs" ? ".cjs" : ".js" }),
  },
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    banner: { js: "#!/usr/bin/env node" },
    target: "node22",
  },
]);
