import { DEFAULT_CONFIG } from "./defaults";
import type { LocalizationConfig } from "../types/config";

export function normalizeConfig(
  rawConfig: Partial<LocalizationConfig>
): LocalizationConfig {
  return {
    ...DEFAULT_CONFIG,
    ...rawConfig,
    generated: {
      ...DEFAULT_CONFIG.generated,
      ...rawConfig.generated,
    },
    validation: {
      ...DEFAULT_CONFIG.validation,
      ...rawConfig.validation,
    },
    reporting: {
      ...DEFAULT_CONFIG.reporting,
      ...rawConfig.reporting,
    },
  };
}

