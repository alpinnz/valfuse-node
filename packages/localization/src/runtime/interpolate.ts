/**
 * Interpolates named placeholders in a localized string.
 *
 * @param value Source string that may contain `{placeholder}` tokens.
 * @param params Map of placeholder values.
 * @returns String with tokens replaced by parameter values.
 *
 * @example
 * interpolate("Hello, {name}", { name: "Alfin" }) // "Hello, Alfin"
 *
 * @remarks
 * Missing params keep their original token (`{token}`) so missing values
 * are visible during development.
 */
export function interpolate(
  value: string,
  params: Record<string, string | number> = {}
): string {
  return value.replace(
    /\{([a-zA-Z_][a-zA-Z0-9_]*)\}/gu,
    (_match, name: string) => String(params[name] ?? `{${name}}`)
  );
}

