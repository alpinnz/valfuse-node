// ─── Compiler & Config (used at build time) ───────────────────────────────────
export { loadConfig } from "./config/load-config";
export { compileProject } from "./compiler/compile-project";
export { normalizeProject } from "./normalizer/normalize-project";
export { validateProject } from "./validator/validate-project";

// ─── CLI commands ─────────────────────────────────────────────────────────────
export { runInit } from "./cli/init";
export { runGenerate } from "./cli/generate";
export { runValidate } from "./cli/validate";
export { runClean } from "./cli/clean";
export { runCoverage } from "./cli/coverage";

// ─── Runtime (browser-safe interpolation engine) ──────────────────────────────
export {
  interpolate,
  lookupMessage,
  pickContextVariant,
  pickGenderVariant,
  pickPluralVariant,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
  parseStructuredVariants,
} from "./runtime/index";

// ─── Types ────────────────────────────────────────────────────────────────────
export * from "./types/public-api";
