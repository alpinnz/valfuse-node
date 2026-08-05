import type { RuntimeManifest } from "../types/manifest";
import type { LocalizationConfig } from "../types/config";
import type { NormalizedProject } from "../types/normalized";

export function buildManifest(
  project: NormalizedProject,
  config: LocalizationConfig
): RuntimeManifest {
  const messages: Record<string, Record<string, string>> = {};
  const entriesMap = new Map<string, RuntimeManifest["entries"][number]>();

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const localeMessages = (messages[entry.locale] ??= {});
      const fullKey =
        config.namespace_prefix === "none" ? message.key : `${entry.module}.${message.key}`;

      // Structured keys: store JSON-encoded variants for runtime resolution.
      // Plain keys: store the string value directly.
      localeMessages[fullKey] = message.structured
        ? JSON.stringify(message.structured.variants)
        : (message.value ?? "");

      if (!entriesMap.has(fullKey)) {
        entriesMap.set(fullKey, { key: fullKey, placeholders: message.placeholders });
      }
    }
  }

  return {
    base_locale: config.base_locale,
    fallback_locale: config.fallback_locale,
    locales: project.locales,
    entries: [...entriesMap.values()].sort((a, b) => a.key.localeCompare(b.key)),
    messages,
  };
}
