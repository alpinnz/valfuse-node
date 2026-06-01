// ============================================================================
// Form watch Method (Framework-Agnostic)
// ============================================================================
// Watch field values and subscribe to changes.

import type { ValfuseWatchCallback, ValfuseWatchFunction } from '../types';

// ============================================================================
// Factory
// ============================================================================

/**
 * Create a watch function for subscribing to field value changes.
 */
export function createWatch<TSchema extends Record<string, unknown>>(
  onWatch: (callback: ValfuseWatchCallback<TSchema>) => () => void
): ValfuseWatchFunction<TSchema> {
  const watchFn = ((nameOrCallback?: unknown) => {
    if (typeof nameOrCallback === 'function') {
      // Subscribe
      return onWatch(nameOrCallback as ValfuseWatchCallback<TSchema>);
    }
    return undefined; // TODO: Return value or values
  }) as ValfuseWatchFunction<TSchema>;

  return watchFn;
}