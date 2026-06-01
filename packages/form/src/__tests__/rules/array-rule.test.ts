/**
 * Comprehensive tests for ALL array rules.
 * Covers: required, min, max, length, nonempty
 */

import { describe, it, expect } from "vitest";
import { validateArrayRule } from "../../rules/array.rule";
import { createSchema } from "../../schema/create-schema";
import { validateSchema } from "../../validation/validate-schema";
import type { ValfuseArrayRule } from "../../types/index";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseArrayRule) {
  return rule;
}

const ERR = { message: "error", code: "test.array" };

// ─── required ────────────────────────────────────────────────────────────────

describe("array rule: required", () => {
  const rule = mkRule({ name: "required", error: ERR });

  it("fails for null", () => expect(validateArrayRule(null, rule)).toEqual(ERR));
  it("fails for undefined", () => expect(validateArrayRule(undefined, rule)).toEqual(ERR));
  it("fails for a non-array value (string)", () => expect(validateArrayRule("not-an-array", rule)).toEqual(ERR));
  it("fails for a non-array value (number)", () => expect(validateArrayRule(42, rule)).toEqual(ERR));
  it("fails for a non-array value (object)", () => expect(validateArrayRule({}, rule)).toEqual(ERR));

  it("passes for an empty array", () => expect(validateArrayRule([], rule)).toBeNull());
  it("passes for a non-empty array", () => expect(validateArrayRule([1, 2, 3], rule)).toBeNull());
  it("passes for an array of strings", () => expect(validateArrayRule(["a", "b"], rule)).toBeNull());
});

// ─── min ─────────────────────────────────────────────────────────────────────

describe("array rule: min", () => {
  const rule = mkRule({ name: "min", value: 2, error: ERR });

  it("fails when array length is below minimum", () => {
    expect(validateArrayRule([], rule)).toEqual(ERR);
    expect(validateArrayRule([1], rule)).toEqual(ERR);
  });

  it("passes when array length equals minimum", () => {
    expect(validateArrayRule([1, 2], rule)).toBeNull();
  });

  it("passes when array length exceeds minimum", () => {
    expect(validateArrayRule([1, 2, 3, 4], rule)).toBeNull();
  });

  it("skips check for null (no parsedArray)", () => {
    expect(validateArrayRule(null, rule)).toBeNull();
  });

  it("skips check for non-array value", () => {
    expect(validateArrayRule("not-array", rule)).toBeNull();
  });
});

// ─── max ─────────────────────────────────────────────────────────────────────

describe("array rule: max", () => {
  const rule = mkRule({ name: "max", value: 3, error: ERR });

  it("fails when array length exceeds maximum", () => {
    expect(validateArrayRule([1, 2, 3, 4], rule)).toEqual(ERR);
    expect(validateArrayRule([1, 2, 3, 4, 5], rule)).toEqual(ERR);
  });

  it("passes when array length equals maximum", () => {
    expect(validateArrayRule([1, 2, 3], rule)).toBeNull();
  });

  it("passes when array length is below maximum", () => {
    expect(validateArrayRule([], rule)).toBeNull();
    expect(validateArrayRule([1], rule)).toBeNull();
  });

  it("skips check for null", () => {
    expect(validateArrayRule(null, rule)).toBeNull();
  });
});

// ─── length ──────────────────────────────────────────────────────────────────

describe("array rule: length", () => {
  const rule = mkRule({ name: "length", value: 3, error: ERR });

  it("fails when array length is less than required", () => {
    expect(validateArrayRule([1, 2], rule)).toEqual(ERR);
    expect(validateArrayRule([], rule)).toEqual(ERR);
  });

  it("fails when array length is greater than required", () => {
    expect(validateArrayRule([1, 2, 3, 4], rule)).toEqual(ERR);
  });

  it("passes when array length exactly matches", () => {
    expect(validateArrayRule([1, 2, 3], rule)).toBeNull();
    expect(validateArrayRule(["a", "b", "c"], rule)).toBeNull();
  });

  it("passes for empty array when length is 0", () => {
    const zeroLength = mkRule({ name: "length", value: 0, error: ERR });
    expect(validateArrayRule([], zeroLength)).toBeNull();
  });

  it("skips check for null", () => {
    expect(validateArrayRule(null, rule)).toBeNull();
  });
});

// ─── nonempty ─────────────────────────────────────────────────────────────────

describe("array rule: nonempty", () => {
  const rule = mkRule({ name: "nonempty", error: ERR });

  it("fails for empty array", () => expect(validateArrayRule([], rule)).toEqual(ERR));
  it("fails for null (no parsedArray → treated as empty)", () => {
    expect(validateArrayRule(null, rule)).toEqual(ERR);
  });
  it("fails for undefined", () => expect(validateArrayRule(undefined, rule)).toEqual(ERR));
  it("fails for non-array", () => expect(validateArrayRule("string", rule)).toEqual(ERR));

  it("passes for array with one element", () => expect(validateArrayRule([1], rule)).toBeNull());
  it("passes for array with multiple elements", () => expect(validateArrayRule([1, 2, 3], rule)).toBeNull());
  it("passes for array containing falsy values", () => {
    expect(validateArrayRule([null, false, 0, ""], rule)).toBeNull();
  });
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("array rules integration via validateSchema", () => {
  it("validates required array field", () => {
    const schema = createSchema({
      tags: { type: "array", rules: [{ name: "required", error: { message: "Tags are required" } }] },
    });
    expect(validateSchema(schema, { tags: null }).tags?.message).toBe("Tags are required");
    expect(validateSchema(schema, { tags: undefined }).tags?.message).toBe("Tags are required");
    expect(validateSchema(schema, { tags: [] }).tags).toBeUndefined();
    expect(validateSchema(schema, { tags: ["a"] }).tags).toBeUndefined();
  });

  it("validates min array length", () => {
    const schema = createSchema({
      skills: { type: "array", rules: [{ name: "min", value: 1, error: { message: "At least 1 skill required" } }] },
    });
    expect(validateSchema(schema, { skills: [] }).skills?.message).toBe("At least 1 skill required");
    expect(validateSchema(schema, { skills: ["js"] }).skills).toBeUndefined();
  });

  it("validates max array length", () => {
    const schema = createSchema({
      roles: { type: "array", rules: [{ name: "max", value: 5, error: { message: "Max 5 roles allowed" } }] },
    });
    expect(validateSchema(schema, { roles: [1, 2, 3, 4, 5, 6] }).roles?.message).toBe("Max 5 roles allowed");
    expect(validateSchema(schema, { roles: [1, 2, 3] }).roles).toBeUndefined();
  });

  it("validates exact array length", () => {
    const schema = createSchema({
      coords: { type: "array", rules: [{ name: "length", value: 2, error: { message: "Must have exactly 2 coordinates" } }] },
    });
    expect(validateSchema(schema, { coords: [1] }).coords?.message).toBe("Must have exactly 2 coordinates");
    expect(validateSchema(schema, { coords: [1, 2, 3] }).coords?.message).toBe("Must have exactly 2 coordinates");
    expect(validateSchema(schema, { coords: [1, 2] }).coords).toBeUndefined();
  });

  it("validates nonempty array", () => {
    const schema = createSchema({
      items: { type: "array", rules: [{ name: "nonempty", error: { message: "Cart cannot be empty" } }] },
    });
    expect(validateSchema(schema, { items: [] }).items?.message).toBe("Cart cannot be empty");
    expect(validateSchema(schema, { items: [{ id: 1 }] }).items).toBeUndefined();
  });

  it("chains nonempty + min rules on array", () => {
    const schema = createSchema({
      members: {
        type: "array",
        rules: [
          { name: "nonempty", error: { message: "Must have at least one member" } },
          { name: "min", value: 2, error: { message: "Must have at least 2 members" } },
        ],
      },
    });
    // empty → nonempty fails first
    expect(validateSchema(schema, { members: [] }).members?.message).toBe("Must have at least one member");
    // 1 element → nonempty passes, min fails
    expect(validateSchema(schema, { members: ["a"] }).members?.message).toBe("Must have at least 2 members");
    // 2+ → all pass
    expect(validateSchema(schema, { members: ["a", "b"] }).members).toBeUndefined();
  });
});

