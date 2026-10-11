/**
 * Vue adapter barrel — re-exports @valfuse-node/vue's value-level public API
 * with `useValfuseForm` renamed to `useVueValfuseForm` to avoid the collision
 * with the identically-named React hook.
 *
 * Vue-specific types are re-exported below with `Vue`-prefixed aliases to
 * avoid collisions. Shared form types come from the top-level `index.ts`.
 *
 * Naming convention: `{Tech}{Domain}{Feature}` — `useVueValfuseForm` is the
 * Vue variant of the form hook. Adapter packages keep their original
 * `useValfuseForm` name; the rename is umbrella-level only.
 */
export {
  useValfuseForm as useVueValfuseForm,
  LocalizationProvider as VueLocalizationProvider,
  provideLocalization as provideVueLocalization,
  useLocalization as useVueLocalization,
  useLocalizationTree as useVueLocalizationTree,
  ValfuseController as VueValfuseController,
  useValfuseController as useVueValfuseController,
  localStorageStrategy as vueLocalStorageStrategy,
  sessionStorageStrategy as vueSessionStorageStrategy,
  cookieStrategy as vueCookieStrategy,
  memoryStrategy as vueMemoryStrategy,
  composeStorage as composeVueStorage,
} from "@valfuse-node/vue";

export type {
  CookieStrategyOptions as VueCookieStrategyOptions,
  LocaleStorage as VueLocaleStorage,
  LocalizationProviderOptions as VueLocalizationProviderOptions,
  TranslationFallback as VueTranslationFallback,
  UseLocalizationOptions as VueUseLocalizationOptions,
  ValfuseControllerField as VueValfuseControllerField,
  ValfuseControllerFieldState as VueValfuseControllerFieldState,
  ValfuseControllerRenderProps as VueValfuseControllerRenderProps,
  WebStorageStrategyOptions as VueWebStorageStrategyOptions,
} from "@valfuse-node/vue";
