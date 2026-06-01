/**
 * Comprehensive tests for ALL boolean rules.
 * Covers: required, literal, accepted
 */

import { describe, it, expect } from "vitest";
import { validateBooleanRule } from "../../rules/boolean.rule";
import { createSchema } from "../../schema/create-schema";
import { validateSchema } from "../../validation/validate-schema";
import type { ValfuseBooleanRule } from "../../types/index";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseBooleanRule) {
  return rule;
}

const ERR = { message: "error", code: "test.boolean" };

// ─── required ────────────────────────────────────────────────────────────────

describe("boolean rule: required", () => {
  const rule = mkRule({ name: "required", error: ERR });

  it("fails for null", () => expect(validateBooleanRule(null, rule)).toEqual(ERR));
  it("fails for undefined", () => expect(validateBooleanRule(undefined, rule)).toEqual(ERR));

  it("passes for true", () => expect(validateBooleanRule(true, rule)).toBeNull());
  it("passes for false (false is a valid boolean presence)", () => {
    expect(validateBooleanRule(false, rule)).toBeNull();
  });
  it("passes for 0 (non-null, non-undefined)", () => {
    expect(validateBooleanRule(0, rule)).toBeNull();
  });
});

// ─── literal ─────────────────────────────────────────────────────────────────

describe("boolean rule: literal", () => {
  it("fails when value does not match literal true", () => {
    const rule = mkRule({ name: "literal", value: true, error: ERR });
    expect(validateBooleanRule(false, rule)).toEqual(ERR);
    expect(validateBooleanRule(1, rule)).toEqual(ERR);
    expect(validateBooleanRule("true", rule)).toEqual(ERR);
  });

  it("passes when value matches literal true", () => {
    const rule = mkRule({ name: "literal", value: true, error: ERR });
    expect(validateBooleanRule(true, rule)).toBeNull();
  });

  it("fails when value does not match literal false", () => {
    const rule = mkRule({ name: "literal", value: false, error: ERR });
    expect(validateBooleanRule(true, rule)).toEqual(ERR);
    expect(validateBooleanRule(0, rule)).toEqual(ERR);
  });

  it("passes when value matches literal false", () => {
    const rule = mkRule({ name: "literal", value: false, error: ERR });
    expect(validateBooleanRule(false, rule)).toBeNull();
  });

  it("skips check when value is null/undefined (presence handled by required)", () => {
    const rule = mkRule({ name: "literal", value: true, error: ERR });
    expect(validateBooleanRule(null, rule)).toBeNull();
    expect(validateBooleanRule(undefined, rule)).toBeNull();
  });
});

// ─── accepted ─────────────────────────────────────────────────────────────────

describe("boolean rule: accepted", () => {
  const rule = mkRule({ name: "accepted", error: ERR });

  it("fails for false", () => expect(validateBooleanRule(false, rule)).toEqual(ERR));
  it("fails for null", () => expect(validateBooleanRule(null, rule)).toEqual(ERR));
  it("fails for undefined", () => expect(validateBooleanRule(undefined, rule)).toEqual(ERR));
  it("fails for 0 (falsy)", () => expect(validateBooleanRule(0, rule)).toEqual(ERR));
  it("fails for empty string (falsy)", () => expect(validateBooleanRule("", rule)).toEqual(ERR));

  it("passes for true", () => expect(validateBooleanRule(true, rule)).toBeNull());
  it("passes for truthy value like 1", () => expect(validateBooleanRule(1, rule)).toBeNull());
  it("passes for non-empty string (truthy)", () => expect(validateBooleanRule("yes", rule)).toBeNull());
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("boolean rules integration via validateSchema", () => {
  it("validates required boolean field (null)", () => {
    const schema = createSchema({
      active: { type: "boolean", rules: [{ name: "required", error: { message: "Active is required" } }] },
    });
    expect(validateSchema(schema, { active: null }).active?.message).toBe("Active is required");
    expect(validateSchema(schema, { active: undefined }).active?.message).toBe("Active is required");
    expect(validateSchema(schema, { active: false }).active).toBeUndefined();
    expect(validateSchema(schema, { active: true }).active).toBeUndefined();
  });

  it("validates literal true rule (terms acceptance)", () => {
    const schema = createSchema({
      terms: {
        type: "boolean",
        rules: [{ name: "literal", value: true, error: { message: "You must accept the terms" } }],
      },
    });
    expect(validateSchema(schema, { terms: false }).terms?.message).toBe("You must accept the terms");
    expect(validateSchema(schema, { terms: true }).terms).toBeUndefined();
  });

  it("validates accepted rule (checkbox must be checked)", () => {
    const schema = createSchema({
      consent: { type: "boolean", rules: [{ name: "accepted", error: { message: "Consent is required" } }] },
    });
    expect(validateSchema(schema, { consent: false }).consent?.message).toBe("Consent is required");
    expect(validateSchema(schema, { consent: null }).consent?.message).toBe("Consent is required");
    expect(validateSchema(schema, { consent: true }).consent).toBeUndefined();
  });

  it("chains required + accepted rules", () => {
    const schema = createSchema({
      gdpr: {
        type: "boolean",
        rules: [
          { name: "required", error: { message: "GDPR consent field is required" } },
          { name: "accepted", error: { message: "You must accept GDPR" } },
        ],
      },
    });
    // null triggers required first
    expect(validateSchema(schema, { gdpr: null }).gdpr?.message).toBe("GDPR consent field is required");
    // false: required passes (false is present), accepted fails
    expect(validateSchema(schema, { gdpr: false }).gdpr?.message).toBe("You must accept GDPR");
    // true: all pass
    expect(validateSchema(schema, { gdpr: true }).gdpr).toBeUndefined();
  });

  it("validates literal false (must be declined)", () => {
    const schema = createSchema({
      marketing: {
        type: "boolean",
        rules: [{ name: "literal", value: false, error: { message: "Marketing must be declined" } }],
      },
    });
    expect(validateSchema(schema, { marketing: true }).marketing?.message).toBe("Marketing must be declined");
    expect(validateSchema(schema, { marketing: false }).marketing).toBeUndefined();
  });
});

