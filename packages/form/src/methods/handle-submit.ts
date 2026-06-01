// ============================================================================
// Form handleSubmit Method (Framework-Agnostic)
// ============================================================================
// Form submission handling - validates then calls onValid callback.

import type { ValfuseSchema, ValfuseFormErrors } from '../types';
import { validateSchema } from '../validation/validate-schema';
import { transformValues } from '../transformation/transform-values';

// ============================================================================
// Types
// ============================================================================

export interface HandleSubmitOptions<TSchema extends Record<string, unknown>> {
  schema: ValfuseSchema;
  onValid: (values: TSchema) => void | Promise<void>;
  onInvalid?: (errors: ValfuseFormErrors<TSchema>) => void;
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a submit handler for a form.
 * Validates all fields, transforms values, then calls onValid or onInvalid.
 */
export function createSubmitHandler<TSchema extends Record<string, unknown>>(
  options: HandleSubmitOptions<TSchema>
): (event?: unknown) => Promise<void> {
  return async (event?: unknown) => {
    // Prevent default if event is a form event
    if (event && typeof event === 'object' && 'preventDefault' in event) {
      (event as { preventDefault?: () => void }).preventDefault?.();
    }

    const values = {} as TSchema; // TODO: Get from form state

    // Transform values before validation
    const transformed = transformValues(options.schema, values as Record<string, unknown>) as TSchema;

    // Validate
    const errors = validateSchema(options.schema, transformed as Record<string, unknown>);

    if (Object.keys(errors).length > 0) {
      options.onInvalid?.(errors as ValfuseFormErrors<TSchema>);
      return;
    }

    // All valid - call onValid
    await options.onValid(transformed);
  };
}