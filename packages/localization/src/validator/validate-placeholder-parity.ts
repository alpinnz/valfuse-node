import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validatePlaceholderParity(project: NormalizedProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const baseline = new Map<string, string[]>();

  for (const entry of project.entries) {
    for (const message of Object.values(entry.messages)) {
      const key = `${entry.module}:${message.key}`;
      if (!baseline.has(key)) {
        baseline.set(key, message.placeholders);
        continue;
      }
      const expected = baseline.get(key) ?? [];
      if (JSON.stringify(expected) !== JSON.stringify(message.placeholders)) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.placeholderParity,
          severity: "error",
          message: `Placeholder mismatch for ${key} in locale ${entry.locale}`,
          key: message.key,
        });
      }
    }
  }

  return diagnostics;
}
