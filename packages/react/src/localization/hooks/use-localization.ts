import { useCallback, useContext, useMemo } from "react";
import {
  interpolate,
  lookupMessage,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
} from "@valfuse-node/localization/runtime";
import { LocalizationContext } from "../provider/localization-provider";

export type InterpolationParams = Record<string, string | number>;
export type GenderVariant = "male" | "female" | "other";

export interface NamespacedLocalizer {
  translate(key: string, fallbackValue?: string | null): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  translateOrNull(key: string | null | undefined): string | null;
  format(key: string, params: InterpolationParams): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  formatOrNull(key: string | null | undefined, params: InterpolationParams): string | null;
  plural(key: string, count: number): string;
  /** Returns `null` when key does not exist or is `null`/`undefined`. */
  pluralOrNull(key: string | null | undefined, count: number): string | null;
  gender(key: string, gender: GenderVariant, params: InterpolationParams): string;
  context(key: string, context: string, params?: InterpolationParams): string;
}

export type TranslationFallback =
  string | Record<string, string> | ((key: string) => string | undefined);

export interface UseLocalizationOptions {
  fallback?: TranslationFallback;
}

function pickFallbackText(
  fallback: TranslationFallback | undefined,
  key: string
): string | undefined {
  if (!fallback) return undefined;
  if (typeof fallback === "string") return fallback;
  if (typeof fallback === "function") return fallback(key);
  return fallback[key];
}

/**
 * Returns the current localization context from `LocalizationProvider`.
 *
 * @throws Error when called outside of `LocalizationProvider`.
 */
export function useLocalization(options: UseLocalizationOptions = {}) {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalization must be used within LocalizationProvider.");
  }

  const { locale, manifest } = context;
  const fallback = options.fallback;

  const runtimeContext = useMemo(
    () => ({
      locale,
      fallbackLocale: manifest.fallback_locale,
      messages: manifest.messages,
    }),
    [locale, manifest.fallback_locale, manifest.messages]
  );

  const readTranslation = useCallback(
    (key: string) => lookupMessage(runtimeContext, key),
    [runtimeContext]
  );

  const hasKey = useCallback(
    (key: string): boolean =>
      key in (manifest.messages[locale] ?? {}) ||
      key in (manifest.messages[manifest.fallback_locale] ?? {}),
    [locale, manifest.fallback_locale, manifest.messages]
  );

  const translate = useCallback(
    (key: string, fallbackValue?: string | null): string => {
      const translated = readTranslation(key);
      if (!translated || translated === key) {
        if (fallbackValue === null) return translated;
        return fallbackValue ?? pickFallbackText(fallback, key) ?? translated;
      }
      return translated;
    },
    [fallback, readTranslation]
  );

  const format = useCallback(
    (key: string, params: InterpolationParams) => interpolate(translate(key), params),
    [translate]
  );

  const translateOrNull = useCallback(
    (key: string | null | undefined): string | null => {
      if (key == null) return null;
      return hasKey(key) ? translate(key) : null;
    },
    [hasKey, translate]
  );

  const formatOrNull = useCallback(
    (key: string | null | undefined, params: InterpolationParams): string | null => {
      if (key == null) return null;
      return hasKey(key) ? format(key, params) : null;
    },
    [hasKey, format]
  );

  const raw = useCallback(
    (key: string) =>
      manifest.messages[locale]?.[key] ?? manifest.messages[manifest.fallback_locale]?.[key] ?? "",
    [locale, manifest.fallback_locale, manifest.messages]
  );

  const plural = useCallback(
    (key: string, count: number) => pickStructuredPluralVariant(raw(key), count),
    [raw]
  );

  const pluralOrNull = useCallback(
    (key: string | null | undefined, count: number): string | null => {
      if (key == null) return null;
      return hasKey(key) ? plural(key, count) : null;
    },
    [hasKey, plural]
  );

  const gender = useCallback(
    (key: string, value: GenderVariant, params: InterpolationParams) =>
      interpolate(pickStructuredGenderVariant(raw(key), value), params),
    [raw]
  );

  const contextFn = useCallback(
    (key: string, value: string, params?: InterpolationParams) => {
      const translated = pickStructuredContextVariant(raw(key), value);
      return params ? interpolate(translated, params) : translated;
    },
    [raw]
  );

  const namespace = useCallback(
    (scope: string): NamespacedLocalizer => ({
      translate: (key, fallbackValue) => translate(`${scope}.${key}`, fallbackValue),
      translateOrNull: (key) => (key == null ? null : translateOrNull(`${scope}.${key}`)),
      format: (key, params) => format(`${scope}.${key}`, params),
      formatOrNull: (key, params) => (key == null ? null : formatOrNull(`${scope}.${key}`, params)),
      plural: (key, count) => plural(`${scope}.${key}`, count),
      pluralOrNull: (key, count) => (key == null ? null : pluralOrNull(`${scope}.${key}`, count)),
      gender: (key, value, params) => gender(`${scope}.${key}`, value, params),
      context: (key, value, params) => contextFn(`${scope}.${key}`, value, params),
    }),
    [translate, translateOrNull, format, formatOrNull, plural, pluralOrNull, gender, contextFn]
  );

  const entriesForLocale = useMemo(
    () => Object.entries(manifest.messages[locale] ?? {}).sort(([a], [b]) => a.localeCompare(b)),
    [locale, manifest.messages]
  );

  return {
    ...context,
    translate,
    translateOrNull,
    format,
    formatOrNull,
    plural,
    pluralOrNull,
    gender,
    context: contextFn,
    namespace,
    entriesForLocale,
  };
}
