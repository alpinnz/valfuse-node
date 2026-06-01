import type { LocalizationConfig } from "../types/config";

export const DEFAULT_CONFIG: LocalizationConfig = {
  input_dir: "assets/localizations",
  output_dir: "src/assets/localizations",
  framework: "react",
  class_name: "Localization",
  base_locale: "en",
  fallback_locale: "en",
  strict: true,
  namespace_prefix: "module",
  generated: {
    runtime_entry_file: "localization.ts",
    runtime_types_file: "localization.types.ts",
    runtime_manifest_file: "localization.manifest.json",
  },
  validation: {
    max_depth: 6,
    require_key_parity: true,
    require_placeholder_parity: true,
    require_structured_parity: true,
    allow_custom_metadata: true,
    validate_path_metadata_consistency: true,
  },
  reporting: {
    output_dir: "src/assets/localizations/reports",
    coverage_format: "json",
  },
};

