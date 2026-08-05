/**
 * Picks a context-based variant (`@context`) from a variant dictionary.
 *
 * @param variants Context-to-message map, e.g. `{ formal: "...", casual: "..." }`.
 * @param context Requested context value.
 * @returns Matching variant, then `default`, then first available, else empty string.
 */
export function pickContextVariant(variants: Record<string, string>, context: string): string {
  return variants[context] ?? variants.default ?? Object.values(variants)[0] ?? "";
}
