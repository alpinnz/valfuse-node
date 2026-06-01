import type { RuntimeManifest } from "@valfuse-node/localization";

/**
 * Creates an SSR-safe localization state snapshot.
 *
 * Use this on the server to pre-render localized content and hydrate
 * the client with the correct locale without a flash of incorrect content.
 */
export function createSsrLocalizationState(
  manifest: RuntimeManifest,
  locale?: string
) {
  const activeLocale = locale ?? manifest.base_locale;
  return {
    locale: activeLocale,
    messages: manifest.messages[activeLocale] ?? {},
  };
}

