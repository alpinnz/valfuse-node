export type Framework = "react" | "vue" | "nest";

export interface GeneratedConfig {
  runtime_entry_file: string;
  runtime_types_file: string;
  runtime_manifest_file: string;
}

export interface ValidationConfig {
  max_depth: number;
  require_key_parity: boolean;
  require_placeholder_parity: boolean;
  require_structured_parity: boolean;
  allow_custom_metadata: boolean;
  validate_path_metadata_consistency: boolean;
}

export interface ReportingConfig {
  output_dir: string;
  coverage_format: "json" | "html";
}

/**
 * Controls whether the module folder name is prepended to every generated key
 * as a namespace prefix.
 *
 * - `"module"` (default) → `auth.login.page_title`
 * - `"none"`             → `login.page_title`
 *
 * Use `"none"` only when all modules have globally-unique key paths.
 * Collisions across modules will silently overwrite each other at runtime.
 */
export type NamespacePrefix = "module" | "none";

export interface LocalizationConfig {
  input_dir: string;
  output_dir: string;
  framework: Framework;
  class_name: string;
  base_locale: string;
  fallback_locale: string;
  strict: boolean;
  /**
   * Whether to prepend the module name as a namespace prefix to generated keys.
   * Defaults to `"module"`.
   */
  namespace_prefix: NamespacePrefix;
  generated: GeneratedConfig;
  validation: ValidationConfig;
  reporting: ReportingConfig;
}
