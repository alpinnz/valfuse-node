import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validateMetadataUsage(project: NormalizedProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const value = message.value ?? "";
      if (
        (message.metadata || message.structured) &&
        value.length === 0 &&
        !message.structured
      ) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.valueRequired,
          severity: "error",
          message: `Key ${message.sourceKey} uses metadata but is missing @value`,
          key: message.key,
        });
      }
    }
  }

  return diagnostics;
}
