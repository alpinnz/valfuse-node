// ============================================================================
// Form trigger Method (Framework-Agnostic)
// ============================================================================
// Manually trigger validation for specific fields.

import type { ValfuseSchema } from '../types';
import { validateSchema } from '../validation/validate-schema';

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a trigger function for manually validating fields.
 */
export function createTrigger<TSchema extends Record<string, unknown>>(
  onTrigger: (names?: string | string[]) => boolean
): (name?: keyof TSchema & string | Array<keyof TSchema & string>) => boolean {
  return (name?: keyof TSchema & string | Array<keyof TSchema & string>) => {
    return onTrigger(name as string | string[] | undefined);
  };
}

/**
 * Validate specific fields or all fields.
 */
export function validateFields(
  schema: ValfuseSchema,
  values: Record<string, unknown>,
  names?: string | string[]
): boolean {
  const fieldsToValidate: string[] =
    names === undefined
      ? Object.keys(schema)
      : Array.isArray(names)
      ? names
      : [names];

  let allValid = true;

  for (const field of fieldsToValidate) {
    if (!schema[field]) continue;

    const fieldSchema = schema[field] as { rules?: unknown[] };
    if (!fieldSchema?.rules?.length) continue;

    const errors = validateSchema({ [field]: schema[field] }, values);
    if (Object.keys(errors).length > 0) {
      allValid = false;
    }
  }

  return allValid;
}