import type { LocalizationConfig } from "../types/config";

export function validateConfig(config: LocalizationConfig): void {
  if (!config.input_dir) {
    throw new Error("Config validation failed: input_dir is required.");
  }
  if (!config.output_dir) {
    throw new Error("Config validation failed: output_dir is required.");
  }
  if (config.validation.max_depth < 1) {
    throw new Error("Config validation failed: validation.max_depth must be >= 1.");
  }
  if (config.framework !== "react" && config.framework !== "vue" && config.framework !== "nest") {
    throw new Error("Config validation failed: framework must be react, vue, or nest.");
  }
  if (config.namespace_prefix !== "module" && config.namespace_prefix !== "none") {
    throw new Error('Config validation failed: namespace_prefix must be "module" or "none".');
  }
}
