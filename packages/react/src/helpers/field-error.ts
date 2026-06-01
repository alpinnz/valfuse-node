import type { ValfuseFieldError, ValfuseFormErrors } from "../types/index";

// ── Types used internally by these helpers ───────────────────────────────────

/** Minimal shape of a raw error entry returned by `validateSchema`. */
type RawFieldError = {
  message: string;
  type?: string;
  code?: string;
  metadata?: Record<string, unknown>;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Maps a single raw schema error entry into a `ValfuseFieldError`.
 * Returns `null` when the field has no error (i.e. validation passed).
 *
 * @example
 * const raw = validateSchema({ email: schema.email }, values);
 * const error = buildFieldError(raw, "email"); // ValfuseFieldError | null
 */
export function buildFieldError(
  fieldErrors: Record<string, RawFieldError>,
  field: string
): ValfuseFieldError | null {
  const err = fieldErrors[field];
  if (!err) return null;
  return {
    message: err.message,
    type: err.type ?? "validation",
    ...(err.code !== undefined && { code: err.code }),
  };
}

/**
 * Converts the full raw schema error map (all fields) into a `ValfuseFormErrors`
 * record — preserving `metadata` which `buildFieldError` intentionally omits
 * (metadata is only meaningful for full-form errors, not per-keystroke).
 *
 * Used exclusively in `handleSubmit` where the full form is validated at once.
 */
export function mapToFieldErrors<TFieldValues extends Record<string, unknown>>(
  schemaErrors: Record<string, RawFieldError>
): ValfuseFormErrors<TFieldValues> {
  return Object.fromEntries(
    Object.entries(schemaErrors).map(([key, err]) => {
      const fieldError: ValfuseFieldError = {
        message: err.message,
        type: err.type ?? "validation",
        ...(err.code !== undefined && { code: err.code }),
        ...(err.metadata !== undefined && { metadata: err.metadata }),
      };
      return [key, fieldError];
    })
  ) as ValfuseFormErrors<TFieldValues>;
}

