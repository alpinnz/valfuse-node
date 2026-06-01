import { pickContextVariant } from "./pick-context-variant";
import { pickGenderVariant } from "./pick-gender-variant";
import { pickPluralVariant } from "./pick-plural-variant";
import { interpolate } from "./interpolate";

/**
 * Parses the JSON payload emitted for structured localization entries.
 *
 * @param raw Serialized structured variants from runtime manifest messages.
 * @returns Object variant map when valid, otherwise `null`.
 */
export function parseStructuredVariants(raw: string): Record<string, string> | null {
  if (!raw || raw[0] !== "{") return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, string>;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Picks a context-structured runtime value and optionally interpolates params.
 */
export function pickStructuredContextVariant(
  raw: string,
  context: string,
  params?: Record<string, string | number>
): string {
  const variants = parseStructuredVariants(raw);
  if (!variants) return raw;
  return interpolate(pickContextVariant(variants, context), params);
}

/**
 * Picks a gender-structured runtime value and interpolates placeholders.
 */
export function pickStructuredGenderVariant(
  raw: string,
  gender: string,
  params?: Record<string, string | number>
): string {
  const variants = parseStructuredVariants(raw);
  if (!variants) return raw;
  return interpolate(pickGenderVariant(variants, gender), params);
}

/**
 * Picks a plural-structured runtime value and injects `count` into interpolation params.
 */
export function pickStructuredPluralVariant(
  raw: string,
  count: number,
  params?: Record<string, string | number>
): string {
  const variants = parseStructuredVariants(raw);
  if (!variants) return raw;
  return interpolate(pickPluralVariant(variants, count), { count, ...params });
}

