// ============================================================================
// @valfuse-node/core - Umbrella Entry Point
// ============================================================================
// Re-exports the entire valfuse-node ecosystem from a single package so that
// `npm install @valfuse-node/core` gives consumers the full library.
//
// Naming convention:
//   - Framework-agnostic APIs (`form`, `localization`) are flattened to top
//     level — no naming collision risk.
//   - Framework adapters (`react`, `vue`) are exported as namespaces because
//     they both define `useValfuseForm` and overlapping hook types.

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
// React adapter — namespaced to avoid collision with Vue's hook of the same
// name. Import like: `import { ReactAdapter } from "@valfuse-node/core"`,
// then `ReactAdapter.useValfuseForm(...)`. React/Vue are optional peer deps.
// ---------------------------------------------------------------------------
export * as ReactAdapter from "@valfuse-node/react";

// ---------------------------------------------------------------------------
// Vue adapter — namespaced for the same reason as React.
// ---------------------------------------------------------------------------
export * as VueAdapter from "@valfuse-node/vue";
