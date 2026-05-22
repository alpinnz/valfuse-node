import type { ValfuseError, ValfuseGenericRule } from "../types";

export function validateGenericRule(
  value: unknown,
  rule: ValfuseGenericRule,
  allValues: Record<string, unknown>
): ValfuseError | null {
  switch (rule.name) {
    case "custom":
    case "refine":
      if (!rule.validate(value, allValues)) {
        return rule.error;
      }
      break;

    case "matchField": {
      const matchedFieldValue = allValues[rule.value];
      if (value !== matchedFieldValue) {
        return rule.error;
      }
      break;
    }

    case "oneOf":
      if (!rule.value.includes(value)) {
        return rule.error;
      }
      break;

    case "notOneOf":
      if (rule.value.includes(value)) {
        return rule.error;
      }
      break;
  }

  return null;
}
