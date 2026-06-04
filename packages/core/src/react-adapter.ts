/**
 * React adapter barrel — re-exports @valfuse-node/react's value-level public
 * API with `useValfuseForm` renamed to `useReactValfuseForm` to avoid the
 * collision with the identically-named Vue composable.
 *
 * Types are NOT re-exported here — they come through `export * from
 * "@valfuse-node/form"` in the top-level `index.ts` (single source of truth,
 * no duplication, no risk of drift).
 *
 * Naming convention: `{Tech}{Domain}{Feature}` — `useReactValfuseForm` is the
 * React variant of the form hook. Adapter packages keep their original
 * `useValfuseForm` name; the rename is umbrella-level only.
 */
export {
  useValfuseForm as useReactValfuseForm,
  ValfuseController,
  LocalizationProvider,
  useLocalization,
  useLocalizationTree,
  createLocalizationStore,
  createLazyLocaleLoader,
  createSsrLocalizationState,
  localStorageStrategy,
  sessionStorageStrategy,
  cookieStrategy,
  memoryStrategy,
  composeStorage,
} from "@valfuse-node/react";
