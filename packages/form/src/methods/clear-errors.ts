// ============================================================================
// Form clearErrors Method (Framework-Agnostic)
// ============================================================================
// Clear field errors.

// Uses ValfuseFieldError via the callback

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a clearErrors function for clearing field errors.
 */
export function createClearErrors(
  onClearErrors: (names?: string | string[]) => void
): (name?: string | string[]) => void {
  return (name?: string | string[]) => {
    onClearErrors(name);
  };
}