// ============================================================================
// @valfuse-node/core - Umbrella Entry Point
// ============================================================================
// Re-exports the entire valfuse-node ecosystem from a single package so that
// `npm install @valfuse-node/core` gives consumers the full library.
//
// Naming convention:
//   - Framework-agnostic APIs (`form`, validation compatibility exports, and
//     `localization`) are flattened to the top level.
//   - Framework adapters (`react`, `vue`) follow the `{Tech}{Domain}{Feature}`
//     pattern. The only value-level conflict is `useValfuseForm` (both adapters
//     export it); it is renamed at the umbrella level to `useReactValfuseForm`
//     and `useVueValfuseForm`. Adapter packages keep their original names.
//   - Form and validation types retain their package ownership and are
//     re-exported through the compatibility facade.
//   - Express middleware is available through the explicit `./express` subpath
//     so the browser-oriented root entry does not load the Express peer.

// ---------------------------------------------------------------------------
// Form state plus validation exports re-exported from `form` for compatibility.
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
