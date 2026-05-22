import type { ValfuseError, ValfuseObjectRule } from "../types";

export function validateObjectRule(
  value: unknown,
  rule: ValfuseObjectRule
): ValfuseError | null {
  switch (rule.name) {
    case "required":
      if (value === null || value === undefined) {
        return rule.error;
      }
      break;

    case "shape":
      if (value !== null && value !== undefined && typeof value !== "object") {
        return rule.error;
      }
      break;
  }

  return null;
}

