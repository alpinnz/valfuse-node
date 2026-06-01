/**
 * Comprehensive tests for ALL object rules.
 * Covers: required, shape
 */

import { describe, it, expect } from "vitest";
import { validateObjectRule } from "../../rules/object.rule";
import { createSchema } from "../../schema/create-schema";
import { validateSchema } from "../../validation/validate-schema";
import type { ValfuseObjectRule } from "../../types/index";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseObjectRule) {
  return rule;
}

const ERR = { message: "error", code: "test.object" };

// ─── required ────────────────────────────────────────────────────────────────

describe("object rule: required", () => {
  const rule = mkRule({ name: "required", error: ERR });

  it("fails for null", () => expect(validateObjectRule(null, rule)).toEqual(ERR));
  it("fails for undefined", () => expect(validateObjectRule(undefined, rule)).toEqual(ERR));

  it("passes for an empty object", () => expect(validateObjectRule({}, rule)).toBeNull());
  it("passes for a non-empty object", () => expect(validateObjectRule({ id: 1 }, rule)).toBeNull());
  it("passes for an array (it is non-null)", () => expect(validateObjectRule([], rule)).toBeNull());
  it("passes for a string (non-null)", () => expect(validateObjectRule("str", rule)).toBeNull());
  it("passes for 0 (non-null)", () => expect(validateObjectRule(0, rule)).toBeNull());
  it("passes for false (non-null)", () => expect(validateObjectRule(false, rule)).toBeNull());
});

// ─── shape ────────────────────────────────────────────────────────────────────

describe("object rule: shape", () => {
  describe("with empty shape (asserts plain object)", () => {
    const rule = mkRule({ name: "shape", value: {}, error: ERR });

    it("fails when value is a string", () => expect(validateObjectRule("string", rule)).toEqual(ERR));
    it("fails when value is a number", () => expect(validateObjectRule(42, rule)).toEqual(ERR));
    it("fails when value is a boolean", () => expect(validateObjectRule(true, rule)).toEqual(ERR));
    it("fails when value is an array", () => expect(validateObjectRule([1, 2], rule)).toEqual(ERR));

    it("passes for a plain object", () => expect(validateObjectRule({ key: "value" }, rule)).toBeNull());
    it("passes for an empty object", () => expect(validateObjectRule({}, rule)).toBeNull());

    it("skips check when value is null", () => expect(validateObjectRule(null, rule)).toBeNull());
    it("skips check when value is undefined", () => expect(validateObjectRule(undefined, rule)).toBeNull());
  });

  describe("with specific shape constraints", () => {
    it("fails when required key is missing", () => {
      const rule = mkRule({ name: "shape", value: { active: true }, error: ERR });
      expect(validateObjectRule({ name: "Admin" }, rule)).toEqual(ERR);
    });

    it("fails when key exists but value does not match", () => {
      const rule = mkRule({ name: "shape", value: { active: true }, error: ERR });
      expect(validateObjectRule({ active: false }, rule)).toEqual(ERR);
    });

    it("passes when all shape key/values match", () => {
      const rule = mkRule({ name: "shape", value: { active: true }, error: ERR });
      expect(validateObjectRule({ active: true, extra: "allowed" }, rule)).toBeNull();
    });

    it("validates multiple shape constraints simultaneously", () => {
      const rule = mkRule({ name: "shape", value: { active: true, type: "admin" }, error: ERR });
      expect(validateObjectRule({ active: true, type: "user" }, rule)).toEqual(ERR);
      expect(validateObjectRule({ active: true, type: "admin" }, rule)).toBeNull();
    });

    it("fails when value is an array even with matching shape", () => {
      // arrays are not plain objects
      const rule = mkRule({ name: "shape", value: {}, error: ERR });
      expect(validateObjectRule([1, 2, 3], rule)).toEqual(ERR);
    });
  });
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("object rules integration via validateSchema", () => {
  it("validates required object field", () => {
    const schema = createSchema({
      user: { type: "object", rules: [{ name: "required", error: { message: "User is required" } }] },
    });
    expect(validateSchema(schema, { user: null }).user?.message).toBe("User is required");
    expect(validateSchema(schema, { user: undefined }).user?.message).toBe("User is required");
    expect(validateSchema(schema, { user: {} }).user).toBeUndefined();
    expect(validateSchema(schema, { user: { id: 1 } }).user).toBeUndefined();
  });

  it("validates shape rule — must be a plain object", () => {
    const schema = createSchema({
      meta: { type: "object", rules: [{ name: "shape", value: {}, error: { message: "Must be a plain object" } }] },
    });
    expect(validateSchema(schema, { meta: [1, 2] }).meta?.message).toBe("Must be a plain object");
    expect(validateSchema(schema, { meta: "string" }).meta?.message).toBe("Must be a plain object");
    expect(validateSchema(schema, { meta: { key: "val" } }).meta).toBeUndefined();
  });

  it("validates shape rule with specific key-value constraints", () => {
    const schema = createSchema({
      role: {
        type: "object",
        rules: [
          { name: "required", error: { message: "Role is required" } },
          { name: "shape", value: { active: true }, error: { message: "Role must be active" } },
        ],
      },
    });
    expect(validateSchema(schema, { role: null }).role?.message).toBe("Role is required");
    expect(validateSchema(schema, { role: { active: false } }).role?.message).toBe("Role must be active");
    expect(validateSchema(schema, { role: { active: true } }).role).toBeUndefined();
  });

  it("shape skips validation for null/undefined (required handles absence)", () => {
    const schema = createSchema({
      config: { type: "object", rules: [{ name: "shape", value: { debug: true }, error: { message: "Shape error" } }] },
    });
    expect(validateSchema(schema, { config: null }).config).toBeUndefined();
    expect(validateSchema(schema, { config: undefined }).config).toBeUndefined();
  });

  it("validates a complex real-world object field", () => {
    const schema = createSchema({
      address: {
        type: "object",
        rules: [
          { name: "required", error: { message: "Address is required" } },
          { name: "shape", value: {}, error: { message: "Address must be an object" } },
        ],
      },
    });
    expect(validateSchema(schema, { address: null }).address?.message).toBe("Address is required");
    expect(validateSchema(schema, { address: "123 Main St" }).address?.message).toBe("Address must be an object");
    expect(validateSchema(schema, { address: { street: "123 Main St", city: "Anytown" } }).address).toBeUndefined();
  });
});

