import type { Request, Response } from "express";
import {
  interpolate,
  lookupMessage,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
} from "@valfuse-node/localization/runtime";
import type { RuntimeManifest } from "@valfuse-node/localization";
import type { InterpolationParams } from "@valfuse-node/localization/runtime";
import type {
  ExpressLocalization,
  NamespacedLocalizer,
  ExpressLocalizationMiddleware,
} from "../types";

export interface LocalizationMiddlewareOptions {
  /** Return the locale selected by application-specific request logic. */
  getLocale?: (request: Request) => string | undefined;
  /** Persist a locale using request-scoped application storage such as a session or cookie. */
  storage?: ExpressLocaleStorage;
}

/** Request-aware locale persistence for Express applications. */
export interface ExpressLocaleStorage {
  get(request: Request): string | undefined;
  set(request: Request, response: Response, locale: string): void;
  remove?(request: Request, response: Response): void;
}

/** Adds a request-scoped localizer to `response.locals.localization`. */
export function createLocalizationMiddleware(
  manifest: RuntimeManifest,
  options: LocalizationMiddlewareOptions = {}
): ExpressLocalizationMiddleware {
  return (request, response, next) => {
    let locale = selectLocale(request, manifest, options);
    const context = {
      locale,
      fallbackLocale: manifest.fallback_locale,
      messages: manifest.messages,
    };
    const readMessage = (key: string) => lookupMessage(context, key);
    const hasKey = (key: string) =>
      key in (manifest.messages[locale] ?? {}) ||
      key in (manifest.messages[manifest.fallback_locale] ?? {});
    const readRawMessage = (key: string) =>
      manifest.messages[locale]?.[key] ?? manifest.messages[manifest.fallback_locale]?.[key] ?? "";
    const translate = (key: string, fallbackValue?: string | null) => {
      const translated = readMessage(key);
      if (translated === key && fallbackValue !== null) return fallbackValue ?? translated;
      return translated;
    };
    const format = (key: string, params: InterpolationParams) =>
      interpolate(readMessage(key), params);
    const plural = (key: string, count: number) =>
      pickStructuredPluralVariant(readRawMessage(key), count);

    const localizer: ExpressLocalization = {
      get locale() {
        return locale;
      },
      setLocale(nextLocale) {
        if (!manifest.locales.includes(nextLocale)) return false;
        options.storage?.set(request, response, nextLocale);
        locale = nextLocale;
        context.locale = nextLocale;
        return true;
      },
      translate,
      translateOrNull(key) {
        return key === null || key === undefined || !hasKey(key) ? null : translate(key);
      },
      format,
      formatOrNull(key, params) {
        return key === null || key === undefined || !hasKey(key) ? null : format(key, params);
      },
      plural,
      pluralOrNull(key, count) {
        return key === null || key === undefined || !hasKey(key) ? null : plural(key, count);
      },
      gender(key, gender, params) {
        return pickStructuredGenderVariant(readRawMessage(key), gender, params);
      },
      context(key, value, params) {
        return pickStructuredContextVariant(readRawMessage(key), value, params);
      },
      namespace(scope) {
        return createNamespace(scope, localizer);
      },
    };

    response.locals.localization = localizer;
    next();
  };
}

function selectLocale(
  request: Request,
  manifest: RuntimeManifest,
  options: LocalizationMiddlewareOptions
): string {
  if (options.storage) {
    const storedLocale = options.storage.get(request);
    if (storedLocale !== undefined) {
      return manifest.locales.includes(storedLocale) ? storedLocale : manifest.base_locale;
    }
  }

  if (options.getLocale) {
    const requestedLocale = options.getLocale(request);
    return requestedLocale && manifest.locales.includes(requestedLocale)
      ? requestedLocale
      : manifest.base_locale;
  }

  const hasLanguageHeader = Boolean(request.get("Accept-Language"));
  const acceptedLocale =
    hasLanguageHeader && manifest.locales.length
      ? request.acceptsLanguages(...manifest.locales)
      : false;
  if (typeof acceptedLocale === "string") return acceptedLocale;

  return manifest.base_locale;
}

function createNamespace(scope: string, localizer: ExpressLocalization): NamespacedLocalizer {
  return {
    translate: (key, fallbackValue) => localizer.translate(`${scope}.${key}`, fallbackValue),
    translateOrNull: (key) =>
      key === null || key === undefined ? null : localizer.translateOrNull(`${scope}.${key}`),
    format: (key, params) => localizer.format(`${scope}.${key}`, params),
    formatOrNull: (key, params) =>
      key === null || key === undefined ? null : localizer.formatOrNull(`${scope}.${key}`, params),
    plural: (key, count) => localizer.plural(`${scope}.${key}`, count),
    pluralOrNull: (key, count) =>
      key === null || key === undefined ? null : localizer.pluralOrNull(`${scope}.${key}`, count),
    gender: (key, gender, params) => localizer.gender(`${scope}.${key}`, gender, params),
    context: (key, value, params) => localizer.context(`${scope}.${key}`, value, params),
  };
}
