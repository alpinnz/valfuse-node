import type { ValfuseSchema } from "../types";

/**
 * Applies each field's `transform` function to the corresponding value,
 * returning a new object with the transformed values.
 *
 * Fields without a `transform` definition are passed through unchanged.
 * The original `values` object is never mutated.
 *
 * @example
 * transformValues(schema, { email: "  HELLO@EMAIL.COM  ", age: "25" })
 * // → { email: "hello@email.com", age: 25 }
 */
export function transformValues(
  schema: ValfuseSchema,
  values: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...values };

  for (const [field, fieldSchema] of Object.entries(schema)) {
    if (typeof fieldSchema.transform === "function" && field in result) {
      result[field] = fieldSchema.transform(result[field]);
    }
  }

  return result;
}

