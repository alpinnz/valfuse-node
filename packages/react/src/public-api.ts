// ─── Form hook ────────────────────────────────────────────────────────────────
export { useValfuseForm } from "./hooks/use-valfuse-form";

// ─── Controller ───────────────────────────────────────────────────────────────
export { ValfuseController } from "./components/valfuse-controller";
export type {
  ValfuseControllerProps,
  ValfuseControllerField,
  ValfuseControllerFieldState,
  ValfuseControllerRenderProps,
} from "./components/valfuse-controller";

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormMode,
  ValfuseFormState,
  ValfuseFormErrors,
  ValfuseFormControl,
  ValfuseFieldError,
  ValfuseRegisterReturn,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
} from "./types/index";

// ─── Localization provider ────────────────────────────────────────────────────
export { default as LocalizationProvider } from "./localization/provider/localization-provider";
export type {
  LocalizationProviderProps,
  LocalizationContextValue,
} from "./localization/provider/localization-provider";

// ─── Localization hooks ───────────────────────────────────────────────────────
export { useLocalization } from "./localization/hooks/use-localization";
export type {
  UseLocalizationOptions,
  NamespacedLocalizer,
  InterpolationParams,
  GenderVariant,
  TranslationFallback,
} from "./localization/hooks/use-localization";

export { useLocalizationTree } from "./localization/hooks/use-localization-tree";

// ─── Localization bridge ──────────────────────────────────────────────────────
export { createLocalizationStore } from "./localization/bridge/create-localization-store";
export type { LocalizationStore } from "./localization/bridge/create-localization-store";

// ─── Lazy loader ──────────────────────────────────────────────────────────────
export { createLazyLocaleLoader } from "./localization/lazy/create-lazy-locale-loader";

// ─── SSR ──────────────────────────────────────────────────────────────────────
export { createSsrLocalizationState } from "./localization/ssr/create-ssr-localization-state";

// ─── Storage strategies ───────────────────────────────────────────────────────
export type { LocaleStorage } from "./localization/storage/locale-storage";
export {
  localStorageStrategy,
  sessionStorageStrategy,
  cookieStrategy,
  memoryStrategy,
  composeStorage,
} from "./localization/storage/locale-storage";
