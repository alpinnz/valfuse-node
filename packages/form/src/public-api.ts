// ============================================================================
// @valfuse-node/form - Form State Public API
// ============================================================================
// Framework-agnostic form state and methods. Validation APIs are re-exported
// for compatibility; new code should import them from @valfuse-node/validation.

// ============================================================================
// Types
// ============================================================================

export * from "./types";

// ============================================================================
// Validation APIs remain re-exported for compatibility. New code should import
// them from @valfuse-node/validation directly.
export * from "@valfuse-node/validation";
export { createSchema, t, transformValues, validateSchema } from "@valfuse-node/validation";

// ============================================================================
// Errors
// ============================================================================

export { normalizeError } from "./errors/normalize-error";

// ============================================================================
// State Management (Framework-Agnostic)
// ============================================================================

export * from "./state";
