import type { RuntimeManifest } from "../types/manifest";

export interface LocaleCoverage {
  locale: string;
  totalKeys: number;
  translated: number;
  missing: number;
  /** Translation percentage for this locale, rounded to one decimal. */
  percent: number;
}

export interface LocalizationCoverage {
  base_locale: string;
  fallback_locale: string;
  locales: LocaleCoverage[];
  totalKeys: number;
  /** Mean coverage across locales that have at least one key, rounded to one decimal. */
  overallPercent: number;
  /** Keys that are untranslated (missing or empty value) per locale. */
  missingKeys: Record<string, string[]>;
}

/**
 * Computes localization coverage from a compiled runtime manifest.
 *
 * A key is considered translated when its value exists and is non-empty.
 * Structured keys are stored JSON-encoded in the manifest; a serialized
 * variant object like `{"zero":"...","other":"..."}` is non-empty even when
 * one branch is empty, which is the intended place-holder semantics.
 */
export function buildCoverageJson(manifest: RuntimeManifest): LocalizationCoverage {
  const totalKeys = manifest.entries.length;

  const localeCoverage = (locale: string): LocaleCoverage => {
    const messages = manifest.messages[locale] ?? {};
    const missing = manifest.entries.filter((entry) => !isTranslated(messages[entry.key])).length;
    const translated = totalKeys - missing;
    return {
      locale,
      totalKeys,
      translated,
      missing,
      percent: roundPercent(totalKeys === 0 ? 0 : (translated / totalKeys) * 100),
    };
  };

  const locales = manifest.locales.map(localeCoverage);
  const missingKeys: Record<string, string[]> = Object.fromEntries(
    manifest.locales.map((locale) => {
      const messages = manifest.messages[locale] ?? {};
      return [
        locale,
        manifest.entries
          .filter((entry) => !isTranslated(messages[entry.key]))
          .map((entry) => entry.key),
      ];
    })
  );

  const scorable = locales.filter((l) => l.totalKeys > 0);
  const overallPercent =
    scorable.length === 0
      ? 0
      : roundPercent(scorable.reduce((sum, l) => sum + l.percent, 0) / scorable.length);

  return {
    base_locale: manifest.base_locale,
    fallback_locale: manifest.fallback_locale,
    locales,
    totalKeys,
    overallPercent,
    missingKeys,
  };
}

function isTranslated(value: string | undefined): boolean {
  return typeof value === "string" && value.length > 0;
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10;
}
