/**
 * Picks a gender-based variant (`@gender`) from a variant dictionary.
 *
 * @param variants Gender-to-message map, commonly `male`, `female`, `other`.
 * @param gender Requested gender key.
 * @returns Matching variant, then `other`, then first available, else empty string.
 */
export function pickGenderVariant(
  variants: Record<string, string>,
  gender: string
): string {
  return variants[gender] ?? variants.other ?? Object.values(variants)[0] ?? "";
}

