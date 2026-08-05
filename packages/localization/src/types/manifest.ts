export interface ManifestEntry {
  key: string;
  placeholders: string[];
}

export interface RuntimeManifest {
  base_locale: string;
  fallback_locale: string;
  locales: string[];
  entries: ManifestEntry[];
  /**
   * Per-locale flat message map.
   * - Plain keys → string value (e.g. `"Hello"`)
   * - Structured keys → JSON-encoded variants (e.g. `'{"zero":"...","one":"...","other":"..."}'`)
   *   Decode with `JSON.parse()` before structured resolution.
   * Keys are the original snake_case paths from source files.
   */
  messages: Record<string, Record<string, string>>;
}
