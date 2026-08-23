import type { ValfuseError, ValfuseArrayRule } from "../types";

export function validateArrayRule(value: unknown, rule: ValfuseArrayRule): ValfuseError | null {
  const parsedArray = Array.isArray(value) ? value : null;
  const isValuePresent = value !== null && value !== undefined;

  switch (rule.name) {
    case "required":
      if (!isValuePresent || !parsedArray) {
        return rule.error;
      }
      break;

    case "min":
      if (parsedArray && parsedArray.length < rule.value) {
        return rule.error;
      }
      break;

    case "max":
      if (parsedArray && parsedArray.length > rule.value) {
        return rule.error;
      }
      break;

    case "length":
      if (parsedArray && parsedArray.length !== rule.value) {
        return rule.error;
      }
      break;

    case "nonempty":
      if (!parsedArray || parsedArray.length === 0) {
        return rule.error;
      }
      break;
  }

  return null;
}
