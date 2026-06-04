/**
 * Vue adapter barrel — re-exports @valfuse-node/vue's value-level public API
 * with `useValfuseForm` renamed to `useVueValfuseForm` to avoid the collision
 * with the identically-named React hook.
 *
 * Types are NOT re-exported here — they come through `export * from
 * "@valfuse-node/form"` in the top-level `index.ts` (single source of truth).
 *
 * Naming convention: `{Tech}{Domain}{Feature}` — `useVueValfuseForm` is the
 * Vue variant of the form hook. Adapter packages keep their original
 * `useValfuseForm` name; the rename is umbrella-level only.
 */
export { useValfuseForm as useVueValfuseForm } from "@valfuse-node/vue";
