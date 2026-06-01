/**
 * Picks a plural-based variant (`@plural`) from a variant dictionary.
 *
 * @param variants Plural variants map (`zero`, `one`, `other`, ...).
 * @param count Quantity used to pick the correct form.
 * @returns Matching plural branch using priority `zero → one → other → first`, else `""`.
 */
export function pickPluralVariant(
  variants: Record<string, string>,
  count: number
): string {
  if (count === 0 && variants.zero) return variants.zero;
  if (count === 1 && variants.one) return variants.one;
  return variants.other ?? Object.values(variants)[0] ?? "";
}

