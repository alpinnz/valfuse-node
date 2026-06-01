// ============================================================================
// Form setValue Method (Framework-Agnostic)
// ============================================================================
// Programmatically set a field value.

// Framework-agnostic setValue implementation

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a setValue function for programmatically setting field values.
 */
export function createSetValue<TSchema extends Record<string, unknown>>(
  onSetValue: (name: string, value: unknown, options?: { shouldValidate?: boolean }) => void
): <TName extends keyof TSchema>(
  name: TName,
  value: TSchema[TName],
  options?: { shouldValidate?: boolean }
) => void {
  return <TName extends keyof TSchema>(
    name: TName,
    value: TSchema[TName],
    options?: { shouldValidate?: boolean }
  ) => {
    onSetValue(name as string, value, options);
  };
}