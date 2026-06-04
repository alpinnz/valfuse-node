import { defineConfig } from "tsup";

// @valfuse-node/core is a pure re-export facade. Nothing is bundled —
// every entry resolves to a `require('@valfuse-node/...')` at runtime, so
// consumers can tree-shake per-package and we never duplicate domain code.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  target: "es2020",
  sourcemap: true,
  external: [
    "@valfuse-node/form",
    "@valfuse-node/localization",
    "@valfuse-node/react",
    "@valfuse-node/vue",
    "react",
    "react-dom",
    "vue",
  ],
});
