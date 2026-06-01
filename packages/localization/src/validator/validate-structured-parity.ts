import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validateStructuredParity(project: NormalizedProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const baseline = new Map<string, string>();

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const id = `${entry.module}:${message.key}`;
      const signature = message.structured
        ? `${message.structured.type}:${Object.keys(message.structured.variants)
            .sort()
            .join(",")}`
        : "none";

      if (!baseline.has(id)) {
        baseline.set(id, signature);
      } else if (baseline.get(id) !== signature) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.structuredParity,
          severity: "error",
          message: `Structured mismatch for ${id} in locale ${entry.locale}`,
          key: message.key,
        });
      }
    }
  }

  return diagnostics;
}
