import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validatePathConsistency(project: NormalizedProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const metadataLocale = message.metadata?.custom?.locale;
      const metadataModule = message.metadata?.custom?.module;

      if (typeof metadataLocale === "string" && metadataLocale !== message.locale) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.pathMetadataLocaleMismatch,
          severity: "error",
          message: `Metadata locale ${metadataLocale} does not match file locale ${message.locale}`,
          key: message.key,
        });
      }
      if (typeof metadataModule === "string" && metadataModule !== message.module) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.pathMetadataModuleMismatch,
          severity: "error",
          message: `Metadata module ${metadataModule} does not match file module ${message.module}`,
          key: message.key,
        });
      }
    }
  }

  return diagnostics;
}
