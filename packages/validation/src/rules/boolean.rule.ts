import type { ValfuseError, ValfuseBooleanRule } from "../types";

export function validateBooleanRule(value: unknown, rule: ValfuseBooleanRule): ValfuseError | null {
  const isValuePresent = value !== null && value !== undefined;

  switch (rule.name) {
    case "required":
      if (!isValuePresent) {
        return rule.error;
      }
      break;

    case "literal":
      if (isValuePresent && value !== rule.value) {
        return rule.error;
      }
      break;

    case "accepted":
      if (!value) {
        return rule.error;
      }
      break;
  }

  return null;
}
