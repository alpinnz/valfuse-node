import type { ValfuseError, ValfuseGenericRule } from "../types";

// ─── Generic rule name registry ───────────────────────────────────────────────

const GENERIC_RULE_NAMES = new Set<string>([
  "custom",
  "refine",
  "matchField",
  "oneOf",
  "notOneOf",
]);

/** Returns `true` if the rule is a generic/cross-type rule (not tied to a field type). */
export function isGenericRule(rule: { name: string }): rule is ValfuseGenericRule {
  return GENERIC_RULE_NAMES.has(rule.name);
}

// ─── Validator ────────────────────────────────────────────────────────────────

export function validateGenericRule(
  value: unknown,
  rule: ValfuseGenericRule,
  allValues: Record<string, unknown>
): ValfuseError | null {
  switch (rule.name) {
    case "custom":
    case "refine":
      if (!rule.validate(value, allValues)) return rule.error;
      break;

    case "matchField":
      if (value !== allValues[rule.value]) return rule.error;
      break;

    case "oneOf":
      if (!rule.value.includes(value)) return rule.error;
      break;

    case "notOneOf":
      if (rule.value.includes(value)) return rule.error;
      break;
  }

  return null;
}
