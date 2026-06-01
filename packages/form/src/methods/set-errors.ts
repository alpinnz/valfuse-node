// ============================================================================
// Form setErrors Method (Framework-Agnostic)
// ============================================================================
// Set external errors (e.g., from API responses).

import type { ValfuseFieldError } from '../types';

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a setErrors function for setting external errors.
 */
export function createSetErrors(
  onSetErrors: (errors: Record<string, ValfuseFieldError>) => void
): (errors: Record<string, ValfuseFieldError>) => void {
  return (errors: Record<string, ValfuseFieldError>) => {
    onSetErrors(errors);
  };
}