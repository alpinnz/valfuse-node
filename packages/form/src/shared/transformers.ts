import type { ValfuseTransformer } from "../types";

// ─── String transformers ───────────────────────────────────────────────────────

/** Remove leading and trailing whitespace. */
const trim: ValfuseTransformer = (v) => (typeof v === "string" ? v.trim() : v);

/** Remove leading whitespace only. */
const trimStart: ValfuseTransformer = (v) => (typeof v === "string" ? v.trimStart() : v);

/** Remove trailing whitespace only. */
const trimEnd: ValfuseTransformer = (v) => (typeof v === "string" ? v.trimEnd() : v);

/** Convert string to lowercase. */
const toLowerCase: ValfuseTransformer = (v) => (typeof v === "string" ? v.toLowerCase() : v);

/** Convert string to uppercase. */
const toUpperCase: ValfuseTransformer = (v) => (typeof v === "string" ? v.toUpperCase() : v);

/** Capitalize first letter of each word. */
const toTitleCase: ValfuseTransformer = (v) =>
  typeof v === "string" ? v.replace(/\b\w/g, (c) => c.toUpperCase()) : v;

/** Capitalize only the first letter of the entire string. */
const toSentenceCase: ValfuseTransformer = (v) =>
  typeof v === "string" && v.length > 0 ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : v;

/** Collapse multiple whitespace characters into a single space. */
const collapseSpaces: ValfuseTransformer = (v) =>
  typeof v === "string" ? v.replace(/\s+/g, " ") : v;

// ─── Coercion transformers ─────────────────────────────────────────────────────

/**
 * Convert value to a number.
 * Returns the original value unchanged if coercion produces `NaN`.
 *
 * @example t.toNumber("42") → 42, t.toNumber("abc") → "abc"
 */
const toNumber: ValfuseTransformer = (v) => {
  const coerced = Number(v);
  return Number.isNaN(coerced) ? v : coerced;
};

/**
 * Convert value to an integer via `parseInt`.
 * Returns the original value unchanged if parsing produces `NaN`.
 *
 * @example t.toInteger("42.7") → 42, t.toInteger("abc") → "abc"
 */
const toInteger: ValfuseTransformer = (v) => {
  const coerced = parseInt(String(v), 10);
  return Number.isNaN(coerced) ? v : coerced;
};

/**
 * Convert value to a float via `parseFloat`.
 * Returns the original value unchanged if parsing produces `NaN`.
 *
 * @example t.toFloat("3.14") → 3.14
 */
const toFloat: ValfuseTransformer = (v) => {
  const coerced = parseFloat(String(v));
  return Number.isNaN(coerced) ? v : coerced;
};

/**
 * Coerce a value to boolean.
 * `"true"`, `"1"`, `1`, and `true` → `true`; everything else → `false`.
 */
const toBoolean: ValfuseTransformer = (v) => v === true || v === "true" || v === 1 || v === "1";

// ─── Composition ──────────────────────────────────────────────────────────────

/**
 * Compose multiple transformers left-to-right (output of each feeds into the next).
 *
 * @example
 * t.pipe(t.trim, t.toLowerCase)("  HELLO@EMAIL.COM  ") → "hello@email.com"
 */
function pipe(...fns: ValfuseTransformer[]): ValfuseTransformer {
  return (v) => fns.reduce((acc, fn) => fn(acc), v);
}

// ─── Namespace export ─────────────────────────────────────────────────────────

/**
 * Built-in transformers — import as `import { t } from "@valfuse-node/form"`.
 *
 * @example
 * transform: t.trim
 * transform: t.toNumber
 * transform: t.pipe(t.trim, t.toLowerCase)
 */
export const t = {
  // String
  trim,
  trimStart,
  trimEnd,
  toLowerCase,
  toUpperCase,
  toTitleCase,
  toSentenceCase,
  collapseSpaces,
  // Coercion
  toNumber,
  toInteger,
  toFloat,
  toBoolean,
  // Composition
  pipe,
} as const;
