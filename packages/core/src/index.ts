// ============================================================================
// @valfuse-node/core - Umbrella Entry Point
// ============================================================================
// Re-exports the entire valfuse-node ecosystem from a single package so that
// `npm install @valfuse-node/core` gives consumers the full library.
//
// Naming convention:
//   - Framework-agnostic APIs (`form`, `localization`) are flattened to top
//     level — no naming collision risk.
//   - Framework adapters (`react`, `vue`) follow the `{Tech}{Domain}{Feature}`
//     pattern. The only value-level conflict is `useValfuseForm` (both adapters
//     export it); it is renamed at the umbrella level to `useReactValfuseForm`
//     and `useVueValfuseForm`. Adapter packages keep their original names.
//   - Types come from `form` (single source of truth) and are exported once.

// ---------------------------------------------------------------------------
// Form domain (framework-agnostic): schema, rules, validation, transformation,
// state, and the `t` transformer namespace.
// ---------------------------------------------------------------------------
export * from "@valfuse-node/form";

// ---------------------------------------------------------------------------
// Localization: compiler, CLI, and runtime interpolation engine.
// ---------------------------------------------------------------------------
export * from "@valfuse-node/localization";

// ---------------------------------------------------------------------------
// React adapter — barrel re-export with the conflicting `useValfuseForm`
// renamed to `useReactValfuseForm`. Import like:
//   `import { useReactValfuseForm, ValfuseController } from "@valfuse-node/core";`
// React/Vue are optional peer deps.
// ---------------------------------------------------------------------------
export * from "./react-adapter";

// ---------------------------------------------------------------------------
// Vue adapter — barrel re-export with the conflicting `useValfuseForm`
// renamed to `useVueValfuseForm`. Import like:
//   `import { useVueValfuseForm } from "@valfuse-node/core";`
// ---------------------------------------------------------------------------
export * from "./vue-adapter";
