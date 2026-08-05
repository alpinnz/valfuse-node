import type { RuntimeManifest } from "@valfuse-node/localization";

/**
 * Creates a lazy locale loader that fetches messages from a pre-built manifest.
 *
 * Useful for code-splitting scenarios or SSR hydration flows where you want to
 * load only the active locale's messages on demand.
 */
export function createLazyLocaleLoader(manifest: RuntimeManifest) {
  return async (locale: string): Promise<Record<string, string>> => manifest.messages[locale] ?? {};
}
