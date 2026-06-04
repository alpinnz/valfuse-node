// ============================================================================
// Form Values State Management (Framework-Agnostic)
// ============================================================================
// Pure functions for managing form values state.
// These are framework-agnostic and can be used by React, Vue, or any adapter.

import type { ValfuseDirtyFields } from '../types';

// ============================================================================
// State Types
// ============================================================================

/** Form values state */
export interface FormValuesState<TSchema extends Record<string, unknown>> {
  values: TSchema;
  defaultValues: TSchema;
}

// ============================================================================
// Factory
// ============================================================================

/** Create initial values state from default values */
export function createValuesState<TSchema extends Record<string, unknown>>(
  defaultValues: TSchema
): FormValuesState<TSchema> {
  return {
    values: { ...defaultValues } as TSchema,
    defaultValues: { ...defaultValues } as Readonly<TSchema>,
  };
}

// ============================================================================
// Value Operations
// ============================================================================

/** Update a single field value */
export function updateValue<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>,
  key: keyof TSchema & string,
  value: unknown
): FormValuesState<TSchema> {
  return {
    ...state,
    values: { ...state.values, [key]: value } as TSchema,
  };
}

/** Reset values to default (or provided partial overrides) */
export function resetValues<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>,
  newValues?: Partial<TSchema>
): FormValuesState<TSchema> {
  return {
    values: { ...state.defaultValues, ...newValues } as TSchema,
    defaultValues: state.defaultValues,
  };
}

// ============================================================================
// Derived State
// ============================================================================

/** Check if form is dirty (any field differs from default) */
export function computeIsDirty<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>
): boolean {
  return Object.keys(state.defaultValues).some(
    (key) => state.values[key as keyof TSchema] !== state.defaultValues[key as keyof TSchema]
  );
}

/** Get all dirty fields */
export function computeDirtyFields<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>
): ValfuseDirtyFields<TSchema> {
  const dirty: Partial<Record<keyof TSchema, boolean>> = {};
  for (const key of Object.keys(state.defaultValues)) {
    if (state.values[key as keyof TSchema] !== state.defaultValues[key as keyof TSchema]) {
      dirty[key as keyof TSchema] = true;
    }
  }
  return dirty as ValfuseDirtyFields<TSchema>;
}

/** Check if a specific field is dirty */
export function isFieldDirty<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>,
  key: keyof TSchema & string
): boolean {
  return state.values[key] !== state.defaultValues[key];
}

// ============================================================================
// Value Getters
// ============================================================================

/** Get a single field value */
export function getValue<TSchema extends Record<string, unknown>, TName extends keyof TSchema>(
  state: FormValuesState<TSchema>,
  name: TName
): TSchema[TName] {
  return state.values[name];
}

/** Get all values as plain object */
export function getValues<TSchema extends Record<string, unknown>>(
  state: FormValuesState<TSchema>
): TSchema {
  return { ...state.values } as TSchema;
}