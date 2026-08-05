import { interpolate, lookupMessage } from "@valfuse-node/localization/runtime";
import type { RuntimeManifest } from "@valfuse-node/localization";

/**
 * Minimal runtime store contract used by React adapter hooks and provider.
 */
export interface LocalizationStore {
  /** Returns the currently active locale. */
  getLocale(): string;
  /** Updates the active locale. */
  setLocale(locale: string): void;
  /** Looks up a key with fallback and optional interpolation. */
  t(key: string, params?: Record<string, string | number>): string;
}

/**
 * Creates a lightweight mutable localization store for React runtime usage.
 *
 * @param manifest Generated runtime manifest from `@valfuse-node/localization`.
 * @param initialLocale Optional starting locale; defaults to `manifest.base_locale`.
 */
export function createLocalizationStore(
  manifest: RuntimeManifest,
  initialLocale?: string
): LocalizationStore {
  let locale = initialLocale ?? manifest.base_locale;

  return {
    getLocale: () => locale,
    setLocale(nextLocale) {
      locale = nextLocale;
    },
    t(key, params) {
      const value = lookupMessage(
        {
          locale,
          fallbackLocale: manifest.fallback_locale,
          messages: manifest.messages,
        },
        key
      );
      return interpolate(value, params);
    },
  };
}
