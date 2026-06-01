// ============================================================================
// Form control Method (Framework-Agnostic)
// ============================================================================
// Internal control object for connecting controlled inputs.

import type { ValfuseFormControl, ValfuseFormErrors } from '../types';

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a control object for controlled inputs (ValfuseController bridge).
 */
export function createControl<TSchema extends Record<string, unknown>>(
  values: TSchema,
  errors: ValfuseFormErrors<TSchema>,
  touchedFields: Set<keyof TSchema>,
  onUpdateField: (name: string, value: unknown) => void,
  onTouchField: (name: string) => void
): ValfuseFormControl<TSchema> {
  return {
    _values: values,
    _errors: errors,
    _touchedFields: touchedFields,
    _updateField: onUpdateField as <TName extends keyof TSchema & string>(
      name: TName,
      value: TSchema[TName]
    ) => void,
    _touchField: onTouchField,
  };
}