import { defineConfig } from "tsup";

export default defineConfig([
  {
    // Main library + Node internals
    entry: {
      index: "src/index.ts",
      browser: "src/browser.ts",
    },
    format: ["esm"],
    dts: true,
    clean: true,
    target: "es2020",
  },
  {
    // CLI binary — shebang injected via banner
    entry: {
      "cli/index": "src/cli/index.ts",
    },
    format: ["esm"],
    dts: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
