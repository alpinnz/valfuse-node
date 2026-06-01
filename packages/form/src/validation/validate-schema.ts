import type {
  ValfuseError,
  ValfuseSchema,
  ValfuseStringRule,
  ValfuseNumberRule,
  ValfuseBooleanRule,
  ValfuseArrayRule,
  ValfuseObjectRule,
} from "../types";
import { validateStringRule } from "../rules/string.rule";
import { validateNumberRule } from "../rules/number.rule";
import { validateBooleanRule } from "../rules/boolean.rule";
import { validateArrayRule } from "../rules/array.rule";
import { validateObjectRule } from "../rules/object.rule";
import { validateGenericRule, isGenericRule } from "../rules/generic.rule";

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
            ruleError = validateStringRule(fieldValue, rule as ValfuseStringRule);
            break;
          case "number":
            ruleError = validateNumberRule(fieldValue, rule as ValfuseNumberRule);
            break;
          case "boolean":
            ruleError = validateBooleanRule(fieldValue, rule as ValfuseBooleanRule);
            break;
          case "array":
            ruleError = validateArrayRule(fieldValue, rule as ValfuseArrayRule);
            break;
          case "object":
            ruleError = validateObjectRule(fieldValue, rule as ValfuseObjectRule);
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

