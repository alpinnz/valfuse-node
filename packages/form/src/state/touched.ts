// ============================================================================
// Form Touched State Management (Framework-Agnostic)
// ============================================================================
// Pure functions for managing touched fields state.

import type { ValfuseTouchedFields } from '../types';

// ============================================================================
// State Types
// ============================================================================

/** Form touched state */
export interface FormTouchedState {
  touchedFields: Set<string>;
}

// ============================================================================
// Factory
// ============================================================================

/** Create initial touched state (empty) */
export function createTouchedState(): FormTouchedState {
  return {
    touchedFields: new Set<string>(),
  };
}

// ============================================================================
// Operations
// ============================================================================

/** Mark a field as touched */
export function markTouched(
  state: FormTouchedState,
  name: string
): FormTouchedState {
  if (state.touchedFields.has(name)) {
    return state; // already touched, no change
  }
  const newTouched = new Set(state.touchedFields);
  newTouched.add(name);
  return { touchedFields: newTouched };
}

/** Mark a field as untouched */
export function markUntouched(
  state: FormTouchedState,
  name: string
): FormTouchedState {
  if (!state.touchedFields.has(name)) {
    return state; // already untouched, no change
  }
  const newTouched = new Set(state.touchedFields);
  newTouched.delete(name);
  return { touchedFields: newTouched };
}

/** Reset touched state (clear all) */
export function resetTouched(): FormTouchedState {
  return { touchedFields: new Set<string>() };
}

// ============================================================================
// Queries
// ============================================================================

/** Check if a field is touched */
export function isTouched(state: FormTouchedState, name: string): boolean {
  return state.touchedFields.has(name);
}

/** Convert touched Set to Record for public API */
export function toTouchedFieldsRecord(state: FormTouchedState): ValfuseTouchedFields<Record<string, unknown>> {
  const record: Partial<Record<string, true>> = {};
  for (const field of state.touchedFields) {
    record[field] = true;
  }
  return record as ValfuseTouchedFields<Record<string, unknown>>;
}