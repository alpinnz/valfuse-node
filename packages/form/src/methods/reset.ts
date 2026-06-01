// ============================================================================
// Form reset Method (Framework-Agnostic)
// ============================================================================
// Reset form to default values.

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a reset function for resetting the form.
 */
export function createReset<TSchema extends Record<string, unknown>>(
  onReset: (newValues?: Partial<TSchema>) => void
): (newValues?: Partial<TSchema>) => void {
  return (newValues?: Partial<TSchema>) => {
    onReset(newValues);
  };
}