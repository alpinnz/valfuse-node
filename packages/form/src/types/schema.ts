import type {
  ValfuseStringRule,
  ValfuseNumberRule,
  ValfuseBooleanRule,
  ValfuseArrayRule,
  ValfuseObjectRule,
  ValfuseGenericRule,
} from "./rules";
import type { ValfuseFieldErrors } from "./errors";

// ─── Transformer ──────────────────────────────────────────────────────────────

/**
 * A function that transforms a raw field value before validation runs.
 * Applied on every change, on `setValue`, and before `handleSubmit`.
 *
 * @example
 * transform: t.pipe(t.trim, t.toLowerCase)
 * transform: t.toNumber
 * transform: (v) => String(v).replace(/\s+/g, "-")
 */
export type ValfuseTransformer = (value: unknown) => unknown;

// ─── Field schemas ────────────────────────────────────────────────────────────

export type ValfuseStringFieldSchema = {
  type: "string";
  rules: (ValfuseStringRule | ValfuseGenericRule)[];
  /** Optional transform applied to the value before validation and before submit. */
  transform?: ValfuseTransformer;
};

export type ValfuseNumberFieldSchema = {
  type: "number";
  rules: (ValfuseNumberRule | ValfuseGenericRule)[];
  /** Optional transform applied to the value before validation and before submit. */
  transform?: ValfuseTransformer;
};

export type ValfuseBooleanFieldSchema = {
  type: "boolean";
  rules: (ValfuseBooleanRule | ValfuseGenericRule)[];
  /** Optional transform applied to the value before validation and before submit. */
  transform?: ValfuseTransformer;
};

export type ValfuseArrayFieldSchema = {
  type: "array";
  rules: (ValfuseArrayRule | ValfuseGenericRule)[];
  /** Optional transform applied to the value before validation and before submit. */
  transform?: ValfuseTransformer;
};

export type ValfuseObjectFieldSchema = {
  type: "object";
  rules: (ValfuseObjectRule | ValfuseGenericRule)[];
  /** Optional transform applied to the value before validation and before submit. */
  transform?: ValfuseTransformer;
};

export type ValfuseFieldSchema =
  | ValfuseStringFieldSchema
  | ValfuseNumberFieldSchema
  | ValfuseBooleanFieldSchema
  | ValfuseArrayFieldSchema
  | ValfuseObjectFieldSchema;

// ─── Schema ───────────────────────────────────────────────────────────────────

export type ValfuseSchema = Record<string, ValfuseFieldSchema>;

/** Alias for {@link ValfuseFieldErrors} — preferred for setErrors input typing */
export type SetErrorsInput<TFieldName extends string = string> = ValfuseFieldErrors<TFieldName>;

