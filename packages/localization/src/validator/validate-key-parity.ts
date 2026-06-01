import type { Diagnostic } from "../types/diagnostics";
import type { NormalizedProject } from "../types/normalized";
import { DIAGNOSTIC_CODES } from "../diagnostics/codes";

export function validateKeyParity(project: NormalizedProject): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const modules = new Map<string, Set<string>>();

  for (const entry of project.entries) {
    const keySet = modules.get(entry.module) ?? new Set<string>();
    for (const key of Object.keys(entry.messages)) keySet.add(key);
    modules.set(entry.module, keySet);
  }

  for (const entry of project.entries) {
    const expected = modules.get(entry.module) ?? new Set<string>();
    for (const key of expected) {
      if (!(key in entry.messages)) {
        diagnostics.push({
          code: DIAGNOSTIC_CODES.keyParity,
          severity: "error",
          message: `Missing key ${key} in module ${entry.module} for locale ${entry.locale}`,
          key,
        });
      }
    }
  }

  return diagnostics;
}
