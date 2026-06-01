import type { RuntimeContext } from "./types";

/**
 * Looks up a translation value for a fully-qualified message key.
 *
 * @param context Runtime locale context.
 * @param key Flattened message key, for example `common.strings.app_title`.
 * @returns
 * 1) value from `context.locale`, or
 * 2) value from `context.fallbackLocale`, or
 * 3) the original `key` when missing in both locales.
 */
export function lookupMessage(context: RuntimeContext, key: string): string {
  return (
    context.messages[context.locale]?.[key] ??
    context.messages[context.fallbackLocale]?.[key] ??
    key
  );
}

