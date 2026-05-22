import type { ValfuseError, ValfuseGenericRule, ValfuseSchema } from "./types";
import { validateStringRule } from "./rules/string.rules";
import { validateNumberRule } from "./rules/number.rules";
import { validateBooleanRule } from "./rules/boolean.rules";
import { validateArrayRule } from "./rules/array.rules";
import { validateObjectRule } from "./rules/object.rules";
import { validateGenericRule } from "./rules/custom.rules";

const GENERIC_RULE_NAMES = new Set([
  "custom",
  "refine",
  "matchField",
  "oneOf",
  "notOneOf",
]);

function isGenericRule(rule: { name: string }): rule is ValfuseGenericRule {
  return GENERIC_RULE_NAMES.has(rule.name);
}

export function validateSchema(
  schema: ValfuseSchema,
  values: Record<string, unknown>
): Record<string, ValfuseError> {
  const fieldErrors: Record<string, ValfuseError> = {};

  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fieldValue = values[fieldName];

    for (const rule of fieldSchema.rules) {
      let ruleError: ValfuseError | null = null;

      if (isGenericRule(rule)) {
        ruleError = validateGenericRule(fieldValue, rule, values);
      } else {
        switch (fieldSchema.type) {
          case "string":
            ruleError = validateStringRule(fieldValue, rule as Parameters<typeof validateStringRule>[1]);
            break;

          case "number":
            ruleError = validateNumberRule(fieldValue, rule as Parameters<typeof validateNumberRule>[1]);
            break;

          case "boolean":
            ruleError = validateBooleanRule(fieldValue, rule as Parameters<typeof validateBooleanRule>[1]);
            break;

          case "array":
            ruleError = validateArrayRule(fieldValue, rule as Parameters<typeof validateArrayRule>[1]);
            break;

          case "object":
            ruleError = validateObjectRule(fieldValue, rule as Parameters<typeof validateObjectRule>[1]);
            break;
        }
      }

      if (ruleError) {
        fieldErrors[fieldName] = ruleError;
        break;
      }
    }
  }

  return fieldErrors;
}
