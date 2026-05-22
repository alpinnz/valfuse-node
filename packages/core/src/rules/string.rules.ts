import type { ValfuseError, ValfuseRegexValue, ValfuseStringRule } from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function resolveRegex(regexValue: ValfuseRegexValue): RegExp {
  if (regexValue instanceof RegExp) {
    return regexValue;
  }
  return new RegExp(regexValue.pattern, regexValue.flags);
}

export function validateStringRule(
  value: unknown,
  rule: ValfuseStringRule
): ValfuseError | null {
  const stringValue = typeof value === "string" ? value : "";

  switch (rule.name) {
    case "required":
      if (!value || stringValue.trim() === "") {
        return rule.error;
      }
      break;

    case "min":
      if (stringValue.length < rule.value) {
        return rule.error;
      }
      break;

    case "max":
      if (stringValue.length > rule.value) {
        return rule.error;
      }
      break;

    case "length":
      if (stringValue.length !== rule.value) {
        return rule.error;
      }
      break;

    case "email":
      if (!EMAIL_REGEX.test(stringValue)) {
        return rule.error;
      }
      break;

    case "url":
      if (!URL_REGEX.test(stringValue)) {
        return rule.error;
      }
      break;

    case "uuid":
      if (!UUID_REGEX.test(stringValue)) {
        return rule.error;
      }
      break;

    case "regex": {
      const resolvedRegex = resolveRegex(rule.value);
      if (!resolvedRegex.test(stringValue)) {
        return rule.error;
      }
      break;
    }

    case "includes":
      if (!stringValue.includes(rule.value)) {
        return rule.error;
      }
      break;

    case "startsWith":
      if (!stringValue.startsWith(rule.value)) {
        return rule.error;
      }
      break;

    case "endsWith":
      if (!stringValue.endsWith(rule.value)) {
        return rule.error;
      }
      break;
  }

  return null;
}
