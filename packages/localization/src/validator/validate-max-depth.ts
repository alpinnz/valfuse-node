import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validateMaxDepth(
  project: NormalizedProject,
  maxDepth: number
): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const depth = message.sourceKey.split(".").length;
      if (depth > maxDepth) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.maxDepthExceeded,
          severity: "error",
          message: `Key ${message.sourceKey} exceeds max depth ${maxDepth}`,
          key: message.key,
        });
      }
    }
  }

  return diagnostics;
}
