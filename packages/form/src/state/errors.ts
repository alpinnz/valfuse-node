// ============================================================================
// Form Errors State Management (Framework-Agnostic)
// ============================================================================
// Pure functions for managing validation errors state.

import type { ValfuseFormErrors, ValfuseFieldError } from '../types';

// ============================================================================
// State Types
// ============================================================================

/** Form errors state */
export interface FormErrorsState {
  errors: Record<string, ValfuseFieldError>;
}

// ============================================================================
// Factory
// ============================================================================

/** Create initial errors state (empty) */
export function createErrorsState(): FormErrorsState {
  return { errors: {} };
}

// ============================================================================
// Operations
// ============================================================================

/** Set errors for specific fields (e.g., from server or setErrors call) */
export function setErrors(
  state: FormErrorsState,
  fieldErrors: Partial<Record<string, ValfuseFieldError>>
): FormErrorsState {
  const newErrors = { ...state.errors };
  let changed = false;

  for (const [field, error] of Object.entries(fieldErrors)) {
    if (error === undefined) {
      if (field in newErrors) {
        delete newErrors[field];
        changed = true;
      }
    } else {
      if (newErrors[field]?.message !== error.message || newErrors[field]?.type !== error.type || newErrors[field]?.code !== error.code) {
        newErrors[field] = error;
        changed = true;
      }
    }
  }

  return changed ? { errors: newErrors } : state;
}

/** Set a single field error */
export function setFieldError(
  state: FormErrorsState,
  name: string,
  error: ValfuseFieldError | null
): FormErrorsState {
  if (error === null) {
    if (!(name in state.errors)) {
      return state; // already no error
    }
    const newErrors = { ...state.errors };
    delete newErrors[name];
    return { errors: newErrors };
  }

  const existing = state.errors[name];
  if (existing?.message === error.message && existing?.type === error.type && existing?.code === error.code) {
    return state; // identical error, no change
  }

  return { errors: { ...state.errors, [name]: error } };
}

/** Clear errors for specific fields */
export function clearFieldErrors(
  state: FormErrorsState,
  names?: string | string[]
): FormErrorsState {
  if (names === undefined) {
    // Clear all
    return Object.keys(state.errors).length > 0
      ? { errors: {} }
      : state;
  }

  const fieldsToClear = Array.isArray(names) ? names : [names];
  const newErrors = { ...state.errors };
  let changed = false;

  for (const name of fieldsToClear) {
    if (name in newErrors) {
      delete newErrors[name];
      changed = true;
    }
  }

  return changed ? { errors: newErrors } : state;
}

/** Reset errors state (clear all) */
export function resetErrors(): FormErrorsState {
  return { errors: {} };
}

// ============================================================================
// Queries
// ============================================================================

/** Check if there are any errors */
export function hasErrors(state: FormErrorsState): boolean {
  return Object.keys(state.errors).length > 0;
}

/** Get error for a specific field */
export function getFieldError(state: FormErrorsState, name: string): ValfuseFieldError | undefined {
  return state.errors[name];
}

/** Convert errors state to form errors type */
export function toFormErrors<TSchema extends Record<string, unknown>>(
  state: FormErrorsState
): ValfuseFormErrors<TSchema> {
  return state.errors as ValfuseFormErrors<TSchema>;
}