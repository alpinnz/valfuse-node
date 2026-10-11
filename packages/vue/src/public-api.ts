// ─── Composable ───────────────────────────────────────────────────────────────
export { useValfuseForm } from "./composables/use-valfuse-form";
export { ValfuseController, useValfuseController } from "./components/valfuse-controller";
export type {
  ValfuseControllerField,
  ValfuseControllerFieldState,
  ValfuseControllerRenderProps,
} from "./components/valfuse-controller";

// ─── Localization ────────────────────────────────────────────────────────────
export {
  LocalizationProvider,
  provideLocalization,
  useLocalization,
  useLocalizationTree,
} from "./localization/localization";

export {
  localStorageStrategy,
  sessionStorageStrategy,
  cookieStrategy,
  memoryStrategy,
  composeStorage,
} from "./localization/storage";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormMode,
  ValfuseFormState,
  ValfuseRegisterReturn,
} from "./types/index";

export type {
  GenderVariant,
  InterpolationParams,
  NamespacedLocalizer,
  TranslationFallback,
  UseLocalizationOptions,
  LocaleStorage,
  LocalizationStore,
  LocalizationProviderOptions,
  LocalizationContextValue,
} from "./localization/localization";

export type { CookieStrategyOptions, WebStorageStrategyOptions } from "./localization/storage";
