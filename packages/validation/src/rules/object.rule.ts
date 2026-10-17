import type { ValfuseError, ValfuseObjectRule } from "../types";

export function validateObjectRule(value: unknown, rule: ValfuseObjectRule): ValfuseError | null {
  switch (rule.name) {
    case "required":
      if (value === null || value === undefined) {
        return rule.error;
      }
      break;

    case "shape":
      if (value !== null && value !== undefined) {
        // Must be a plain object (not an array, not a primitive).
        if (typeof value !== "object" || Array.isArray(value)) {
          return rule.error;
        }
        // Validate that every key/value in rule.value matches the actual object.
        // An empty rule.value ({}) simply asserts "must be a plain object".
        const obj = value as Record<string, unknown>;
        for (const [k, expected] of Object.entries(rule.value)) {
          if (obj[k] !== expected) {
            return rule.error;
          }
        }
      }
      break;
  }

  return null;
}
