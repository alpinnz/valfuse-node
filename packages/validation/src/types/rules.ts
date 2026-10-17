import type { ValfuseRuleError } from "./errors";

// ─── Regex ────────────────────────────────────────────────────────────────────

export type ValfuseRegexValue = RegExp | { pattern: string; flags?: string };

// ─── String rules ─────────────────────────────────────────────────────────────

export type ValfuseStringRequiredRule = { name: "required"; error: ValfuseRuleError };
export type ValfuseStringMinRule = { name: "min"; value: number; error: ValfuseRuleError };
export type ValfuseStringMaxRule = { name: "max"; value: number; error: ValfuseRuleError };
export type ValfuseStringLengthRule = { name: "length"; value: number; error: ValfuseRuleError };
export type ValfuseStringEmailRule = { name: "email"; error: ValfuseRuleError };
export type ValfuseStringUrlRule = { name: "url"; error: ValfuseRuleError };
export type ValfuseStringUuidRule = { name: "uuid"; error: ValfuseRuleError };
export type ValfuseStringRegexRule = {
  name: "regex";
  value: ValfuseRegexValue;
  error: ValfuseRuleError;
};
export type ValfuseStringIncludesRule = {
  name: "includes";
  value: string;
  error: ValfuseRuleError;
};
export type ValfuseStringStartsWithRule = {
  name: "startsWith";
  value: string;
  error: ValfuseRuleError;
};
export type ValfuseStringEndsWithRule = {
  name: "endsWith";
  value: string;
  error: ValfuseRuleError;
};

export type ValfuseStringRule =
  | ValfuseStringRequiredRule
  | ValfuseStringMinRule
  | ValfuseStringMaxRule
  | ValfuseStringLengthRule
  | ValfuseStringEmailRule
  | ValfuseStringUrlRule
  | ValfuseStringUuidRule
  | ValfuseStringRegexRule
  | ValfuseStringIncludesRule
  | ValfuseStringStartsWithRule
  | ValfuseStringEndsWithRule;

// ─── Number rules ─────────────────────────────────────────────────────────────

export type ValfuseNumberRequiredRule = { name: "required"; error: ValfuseRuleError };
export type ValfuseNumberMinRule = { name: "min"; value: number; error: ValfuseRuleError };
export type ValfuseNumberMaxRule = { name: "max"; value: number; error: ValfuseRuleError };
export type ValfuseNumberGtRule = { name: "gt"; value: number; error: ValfuseRuleError };
export type ValfuseNumberGteRule = { name: "gte"; value: number; error: ValfuseRuleError };
export type ValfuseNumberLtRule = { name: "lt"; value: number; error: ValfuseRuleError };
export type ValfuseNumberLteRule = { name: "lte"; value: number; error: ValfuseRuleError };
export type ValfuseNumberIntRule = { name: "int"; error: ValfuseRuleError };
export type ValfuseNumberPositiveRule = { name: "positive"; error: ValfuseRuleError };
export type ValfuseNumberNonnegativeRule = { name: "nonnegative"; error: ValfuseRuleError };
export type ValfuseNumberNegativeRule = { name: "negative"; error: ValfuseRuleError };
export type ValfuseNumberNonpositiveRule = { name: "nonpositive"; error: ValfuseRuleError };
export type ValfuseNumberMultipleOfRule = {
  name: "multipleOf";
  value: number;
  error: ValfuseRuleError;
};

export type ValfuseNumberRule =
  | ValfuseNumberRequiredRule
  | ValfuseNumberMinRule
  | ValfuseNumberMaxRule
  | ValfuseNumberGtRule
  | ValfuseNumberGteRule
  | ValfuseNumberLtRule
  | ValfuseNumberLteRule
  | ValfuseNumberIntRule
  | ValfuseNumberPositiveRule
  | ValfuseNumberNonnegativeRule
  | ValfuseNumberNegativeRule
  | ValfuseNumberNonpositiveRule
  | ValfuseNumberMultipleOfRule;

// ─── Boolean rules ────────────────────────────────────────────────────────────

export type ValfuseBooleanRequiredRule = { name: "required"; error: ValfuseRuleError };
export type ValfuseBooleanLiteralRule = {
  name: "literal";
  value: boolean;
  error: ValfuseRuleError;
};
export type ValfuseBooleanAcceptedRule = { name: "accepted"; error: ValfuseRuleError };

export type ValfuseBooleanRule =
  ValfuseBooleanRequiredRule | ValfuseBooleanLiteralRule | ValfuseBooleanAcceptedRule;

// ─── Array rules ──────────────────────────────────────────────────────────────

export type ValfuseArrayRequiredRule = { name: "required"; error: ValfuseRuleError };
export type ValfuseArrayMinRule = { name: "min"; value: number; error: ValfuseRuleError };
export type ValfuseArrayMaxRule = { name: "max"; value: number; error: ValfuseRuleError };
export type ValfuseArrayLengthRule = { name: "length"; value: number; error: ValfuseRuleError };
export type ValfuseArrayNonemptyRule = { name: "nonempty"; error: ValfuseRuleError };

export type ValfuseArrayRule =
  | ValfuseArrayRequiredRule
  | ValfuseArrayMinRule
  | ValfuseArrayMaxRule
  | ValfuseArrayLengthRule
  | ValfuseArrayNonemptyRule;

// ─── Object rules ─────────────────────────────────────────────────────────────

export type ValfuseObjectRequiredRule = { name: "required"; error: ValfuseRuleError };
export type ValfuseObjectShapeRule = {
  name: "shape";
  value: Record<string, unknown>;
  error: ValfuseRuleError;
};

export type ValfuseObjectRule = ValfuseObjectRequiredRule | ValfuseObjectShapeRule;

// ─── Generic / custom rules ───────────────────────────────────────────────────

export type ValfuseCustomRule = {
  name: "custom";
  validate: (value: unknown, allValues: Record<string, unknown>) => boolean;
  error: ValfuseRuleError;
};

export type ValfuseRefineRule = {
  name: "refine";
  validate: (value: unknown, allValues: Record<string, unknown>) => boolean;
  error: ValfuseRuleError;
};

export type ValfuseMatchFieldRule = {
  name: "matchField";
  value: string;
  error: ValfuseRuleError;
};

export type ValfuseOneOfRule = {
  name: "oneOf";
  value: unknown[];
  error: ValfuseRuleError;
};

export type ValfuseNotOneOfRule = {
  name: "notOneOf";
  value: unknown[];
  error: ValfuseRuleError;
};

export type ValfuseGenericRule =
  | ValfuseCustomRule
  | ValfuseRefineRule
  | ValfuseMatchFieldRule
  | ValfuseOneOfRule
  | ValfuseNotOneOfRule;
