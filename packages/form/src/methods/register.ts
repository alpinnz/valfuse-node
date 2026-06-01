// ============================================================================
// Form Register Method (Framework-Agnostic)
// ============================================================================
// Field registration logic - creates props for binding to input elements.

import type { ValfuseRegisterReturn } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface RegisterOptions {
  name: string;
  value?: unknown;
  onChange?: (value: unknown) => void;
  onBlur?: () => void;
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create field registration props for a specific field.
 * Framework adapters (React/Vue) call this to generate input props.
 */
export function createFieldRegister(options: RegisterOptions): ValfuseRegisterReturn {
  return {
    name: options.name,
    value: options.value as string | number | readonly string[] | undefined,
    onChange: options.onChange as ((e: unknown) => void),
    onBlur: options.onBlur ?? (() => {}),
  };
}