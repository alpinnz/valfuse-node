import type { ValfuseError, ValfuseNumberRule } from "../types";

export function validateNumberRule(value: unknown, rule: ValfuseNumberRule): ValfuseError | null {
  const numericValue = typeof value === "number" ? value : NaN;
  const hasNumericValue =
    value !== null && value !== undefined && value !== "" && !isNaN(numericValue);

  switch (rule.name) {
    case "required":
      if (value === null || value === undefined || value === "" || isNaN(numericValue)) {
        return rule.error;
      }
      break;

    case "min":
      if (hasNumericValue && numericValue < rule.value) {
        return rule.error;
      }
      break;

    case "max":
      if (hasNumericValue && numericValue > rule.value) {
        return rule.error;
      }
      break;

    case "gt":
      if (hasNumericValue && numericValue <= rule.value) {
        return rule.error;
      }
      break;

    case "gte":
      if (hasNumericValue && numericValue < rule.value) {
        return rule.error;
      }
      break;

    case "lt":
      if (hasNumericValue && numericValue >= rule.value) {
        return rule.error;
      }
      break;

    case "lte":
      if (hasNumericValue && numericValue > rule.value) {
        return rule.error;
      }
      break;

    case "int":
      if (hasNumericValue && !Number.isInteger(numericValue)) {
        return rule.error;
      }
      break;

    case "positive":
      if (hasNumericValue && numericValue <= 0) {
        return rule.error;
      }
      break;

    case "nonnegative":
      if (hasNumericValue && numericValue < 0) {
        return rule.error;
      }
      break;

    case "negative":
      if (hasNumericValue && numericValue >= 0) {
        return rule.error;
      }
      break;

    case "nonpositive":
      if (hasNumericValue && numericValue > 0) {
        return rule.error;
      }
      break;

    case "multipleOf":
      if (hasNumericValue && numericValue % rule.value !== 0) {
        return rule.error;
      }
      break;
  }

  return null;
}
