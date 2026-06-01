import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { validateFlattenCollision } from "./validate-flatten-collision";
import { validateKeyParity } from "./validate-key-parity";
import { validateMaxDepth } from "./validate-max-depth";
import { validateMetadataUsage } from "./validate-metadata-usage";
import { validatePathConsistency } from "./validate-path-consistency";
import { validatePlaceholderParity } from "./validate-placeholder-parity";
import { validateStructuredParity } from "./validate-structured-parity";
import type { LocalizationConfig } from "../types/config";

export function validateProject(
  project: NormalizedProject,
  config: LocalizationConfig
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  diagnostics.push(...validateFlattenCollision(project));
  diagnostics.push(...validateMaxDepth(project, config.validation.max_depth));
  diagnostics.push(...validateMetadataUsage(project));

  if (config.validation.validate_path_metadata_consistency) {
    diagnostics.push(...validatePathConsistency(project));
  }
  if (config.validation.require_key_parity) {
    diagnostics.push(...validateKeyParity(project));
  }
  if (config.validation.require_placeholder_parity) {
    diagnostics.push(...validatePlaceholderParity(project));
  }
  if (config.validation.require_structured_parity) {
    diagnostics.push(...validateStructuredParity(project));
  }

  return diagnostics;
}

