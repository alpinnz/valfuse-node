/**
 * Comprehensive tests for ALL generic / cross-type rules.
 * Covers: custom, refine, matchField, oneOf, notOneOf
 */

import { describe, it, expect } from "vitest";
import { validateGenericRule, isGenericRule } from "../../rules/generic.rule";
import { createSchema } from "../../create-schema";
import { validateSchema } from "../../validate-schema";
import type { ValfuseGenericRule } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseGenericRule) {
  return rule;
}

const ALL_VALUES = { field: "value", other: "other" };
const ERR = { message: "error", code: "test.generic" };

// ─── isGenericRule ────────────────────────────────────────────────────────────

describe("isGenericRule", () => {
  it("returns true for 'custom'", () => expect(isGenericRule({ name: "custom" } as any)).toBe(true));
  it("returns true for 'refine'", () => expect(isGenericRule({ name: "refine" } as any)).toBe(true));
  it("returns true for 'matchField'", () => expect(isGenericRule({ name: "matchField" } as any)).toBe(true));
  it("returns true for 'oneOf'", () => expect(isGenericRule({ name: "oneOf" } as any)).toBe(true));
  it("returns true for 'notOneOf'", () => expect(isGenericRule({ name: "notOneOf" } as any)).toBe(true));

  it("returns false for 'required'", () => expect(isGenericRule({ name: "required" })).toBe(false));
  it("returns false for 'min'", () => expect(isGenericRule({ name: "min" })).toBe(false));
  it("returns false for 'email'", () => expect(isGenericRule({ name: "email" })).toBe(false));
  it("returns false for unknown rule names", () => expect(isGenericRule({ name: "unknown" })).toBe(false));
});

// ─── custom ───────────────────────────────────────────────────────────────────

describe("generic rule: custom", () => {
  it("fails when validate function returns false", () => {
    const rule = mkRule({ name: "custom", validate: () => false, error: ERR });
    expect(validateGenericRule("anything", rule, ALL_VALUES)).toEqual(ERR);
  });

  it("passes when validate function returns true", () => {
    const rule = mkRule({ name: "custom", validate: () => true, error: ERR });
    expect(validateGenericRule("anything", rule, ALL_VALUES)).toBeNull();
  });

  it("receives the field value as first argument", () => {
    const rule = mkRule({
      name: "custom",
      validate: (value) => value === "expected",
      error: ERR,
    });
    expect(validateGenericRule("expected", rule, ALL_VALUES)).toBeNull();
    expect(validateGenericRule("unexpected", rule, ALL_VALUES)).toEqual(ERR);
  });

  it("receives allValues as second argument", () => {
    const rule = mkRule({
      name: "custom",
      validate: (_, all) => (all as any).approved === true,
      error: ERR,
    });
    expect(validateGenericRule("x", rule, { approved: false })).toEqual(ERR);
    expect(validateGenericRule("x", rule, { approved: true })).toBeNull();
  });

  it("validates adult age check", () => {
    const rule = mkRule({
      name: "custom",
      validate: (value) => typeof value === "number" && value >= 18,
      error: { message: "Must be 18 or older" },
    });
    expect(validateGenericRule(17, rule, {})).toEqual({ message: "Must be 18 or older" });
    expect(validateGenericRule(18, rule, {})).toBeNull();
    expect(validateGenericRule(25, rule, {})).toBeNull();
  });
});

// ─── refine ──────────────────────────────────────────────────────────────────

describe("generic rule: refine", () => {
  it("fails when validate function returns false", () => {
    const rule = mkRule({ name: "refine", validate: () => false, error: ERR });
    expect(validateGenericRule("anything", rule, ALL_VALUES)).toEqual(ERR);
  });

  it("passes when validate function returns true", () => {
    const rule = mkRule({ name: "refine", validate: () => true, error: ERR });
    expect(validateGenericRule("anything", rule, ALL_VALUES)).toBeNull();
  });

  it("receives the field value", () => {
    const rule = mkRule({
      name: "refine",
      validate: (value) => typeof value === "string" && value.length > 3,
      error: ERR,
    });
    expect(validateGenericRule("ab", rule, {})).toEqual(ERR);
    expect(validateGenericRule("abcd", rule, {})).toBeNull();
  });

  it("receives allValues and can cross-validate", () => {
    const rule = mkRule({
      name: "refine",
      validate: (value, all) => value !== (all as any).forbidden,
      error: { message: "Value is forbidden" },
    });
    const allValues = { forbidden: "bad" };
    expect(validateGenericRule("bad", rule, allValues)).toEqual({ message: "Value is forbidden" });
    expect(validateGenericRule("good", rule, allValues)).toBeNull();
  });

  it("works the same as custom (same implementation)", () => {
    const custom = mkRule({ name: "custom", validate: (v) => v === "ok", error: ERR });
    const refine = mkRule({ name: "refine", validate: (v) => v === "ok", error: ERR });
    expect(validateGenericRule("ok", custom, {})).toBeNull();
    expect(validateGenericRule("ok", refine, {})).toBeNull();
    expect(validateGenericRule("bad", custom, {})).toEqual(ERR);
    expect(validateGenericRule("bad", refine, {})).toEqual(ERR);
  });
});

// ─── matchField ──────────────────────────────────────────────────────────────

describe("generic rule: matchField", () => {
  it("fails when value does not match the target field", () => {
    const rule = mkRule({ name: "matchField", value: "password", error: ERR });
    const allValues = { password: "secret123", confirmPassword: "different" };
    expect(validateGenericRule("different", rule, allValues)).toEqual(ERR);
  });

  it("passes when value matches the target field", () => {
    const rule = mkRule({ name: "matchField", value: "password", error: ERR });
    const allValues = { password: "secret123", confirmPassword: "secret123" };
    expect(validateGenericRule("secret123", rule, allValues)).toBeNull();
  });

  it("fails when target field is undefined and value is something", () => {
    const rule = mkRule({ name: "matchField", value: "nonexistent", error: ERR });
    expect(validateGenericRule("hello", rule, {})).toEqual(ERR);
  });

  it("passes when both value and target field are undefined", () => {
    const rule = mkRule({ name: "matchField", value: "otherField", error: ERR });
    expect(validateGenericRule(undefined, rule, { otherField: undefined })).toBeNull();
  });

  it("uses strict equality for matching", () => {
    const rule = mkRule({ name: "matchField", value: "number", error: ERR });
    expect(validateGenericRule("5", rule, { number: 5 })).toEqual(ERR); // "5" !== 5
    expect(validateGenericRule(5, rule, { number: 5 })).toBeNull();
  });
});

// ─── oneOf ────────────────────────────────────────────────────────────────────

describe("generic rule: oneOf", () => {
  it("fails when value is not in the allowed list", () => {
    const rule = mkRule({ name: "oneOf", value: ["admin", "user", "moderator"], error: ERR });
    expect(validateGenericRule("guest", rule, {})).toEqual(ERR);
    expect(validateGenericRule("", rule, {})).toEqual(ERR);
    expect(validateGenericRule(null, rule, {})).toEqual(ERR);
  });

  it("passes when value is in the allowed list", () => {
    const rule = mkRule({ name: "oneOf", value: ["admin", "user", "moderator"], error: ERR });
    expect(validateGenericRule("admin", rule, {})).toBeNull();
    expect(validateGenericRule("user", rule, {})).toBeNull();
    expect(validateGenericRule("moderator", rule, {})).toBeNull();
  });

  it("uses strict equality in the check", () => {
    const rule = mkRule({ name: "oneOf", value: [1, 2, 3], error: ERR });
    expect(validateGenericRule("1", rule, {})).toEqual(ERR); // "1" !== 1
    expect(validateGenericRule(1, rule, {})).toBeNull();
  });

  it("works with mixed types in the list", () => {
    const rule = mkRule({ name: "oneOf", value: [true, 0, "no"], error: ERR });
    expect(validateGenericRule(false, rule, {})).toEqual(ERR);
    expect(validateGenericRule(true, rule, {})).toBeNull();
    expect(validateGenericRule(0, rule, {})).toBeNull();
    expect(validateGenericRule("no", rule, {})).toBeNull();
  });

  it("passes when value is null and null is in the allowed list", () => {
    const rule = mkRule({ name: "oneOf", value: [null, undefined], error: ERR });
    expect(validateGenericRule(null, rule, {})).toBeNull();
  });
});

// ─── notOneOf ─────────────────────────────────────────────────────────────────

describe("generic rule: notOneOf", () => {
  it("fails when value IS in the disallowed list", () => {
    const rule = mkRule({ name: "notOneOf", value: ["banned", "blocked"], error: ERR });
    expect(validateGenericRule("banned", rule, {})).toEqual(ERR);
    expect(validateGenericRule("blocked", rule, {})).toEqual(ERR);
  });

  it("passes when value is NOT in the disallowed list", () => {
    const rule = mkRule({ name: "notOneOf", value: ["banned", "blocked"], error: ERR });
    expect(validateGenericRule("allowed", rule, {})).toBeNull();
    expect(validateGenericRule("user", rule, {})).toBeNull();
    expect(validateGenericRule("", rule, {})).toBeNull();
  });

  it("uses strict equality for exclusion check", () => {
    const rule = mkRule({ name: "notOneOf", value: [1, 2, 3], error: ERR });
    expect(validateGenericRule("1", rule, {})).toBeNull(); // "1" !== 1, so not excluded
    expect(validateGenericRule(1, rule, {})).toEqual(ERR);
  });

  it("works with common username/email blacklisting", () => {
    const rule = mkRule({
      name: "notOneOf",
      value: ["admin", "root", "superuser"],
      error: { message: "Username is reserved" },
    });
    expect(validateGenericRule("admin", rule, {})).toEqual({ message: "Username is reserved" });
    expect(validateGenericRule("alice", rule, {})).toBeNull();
  });
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("generic rules integration via validateSchema", () => {
  it("validates refine rule on string field", () => {
    const schema = createSchema({
      username: {
        type: "string",
        rules: [
          {
            name: "refine",
            validate: (v) => typeof v === "string" && !v.includes(" "),
            error: { message: "Username cannot contain spaces" },
          },
        ],
      },
    });
    expect(validateSchema(schema, { username: "user name" }).username?.message).toBe("Username cannot contain spaces");
    expect(validateSchema(schema, { username: "username" }).username).toBeUndefined();
  });

  it("validates oneOf rule on string field", () => {
    const schema = createSchema({
      role: {
        type: "string",
        rules: [
          {
            name: "oneOf",
            value: ["admin", "user", "guest"],
            error: { message: "Invalid role" },
          },
        ],
      },
    });
    expect(validateSchema(schema, { role: "superadmin" }).role?.message).toBe("Invalid role");
    expect(validateSchema(schema, { role: "admin" }).role).toBeUndefined();
    expect(validateSchema(schema, { role: "guest" }).role).toBeUndefined();
  });

  it("validates notOneOf rule on string field", () => {
    const schema = createSchema({
      username: {
        type: "string",
        rules: [
          {
            name: "notOneOf",
            value: ["admin", "root"],
            error: { message: "Username is reserved" },
          },
        ],
      },
    });
    expect(validateSchema(schema, { username: "root" }).username?.message).toBe("Username is reserved");
    expect(validateSchema(schema, { username: "alice" }).username).toBeUndefined();
  });

  it("validates matchField on a complete signup form", () => {
    const schema = createSchema({
      email: {
        type: "string",
        rules: [{ name: "required", error: { message: "Email required" } }],
      },
      password: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Password required" } },
          { name: "min", value: 8, error: { message: "Password must be 8+ chars" } },
        ],
      },
      confirmPassword: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Confirm password required" } },
          { name: "matchField", value: "password", error: { message: "Passwords must match" } },
        ],
      },
    });

    // All invalid
    const invalidErrors = validateSchema(schema, {
      email: "",
      password: "short",
      confirmPassword: "different",
    });
    expect(invalidErrors.email?.message).toBe("Email required");
    expect(invalidErrors.password?.message).toBe("Password must be 8+ chars");
    expect(invalidErrors.confirmPassword?.message).toBe("Passwords must match");

    // All valid
    const validErrors = validateSchema(schema, {
      email: "user@example.com",
      password: "secureP@ss",
      confirmPassword: "secureP@ss",
    });
    expect(Object.keys(validErrors)).toHaveLength(0);
  });

  it("validates custom rule with cross-field access on number field", () => {
    const schema = createSchema({
      minPrice: { type: "number", rules: [{ name: "required", error: { message: "Min price required" } }] },
      maxPrice: {
        type: "number",
        rules: [
          { name: "required", error: { message: "Max price required" } },
          {
            name: "custom",
            validate: (value, all) =>
              typeof value === "number" && typeof (all as any).minPrice === "number"
                ? value > (all as any).minPrice
                : true,
            error: { message: "Max price must be greater than min price" },
          },
        ],
      },
    });

    expect(validateSchema(schema, { minPrice: 100, maxPrice: 50 }).maxPrice?.message).toBe(
      "Max price must be greater than min price"
    );
    expect(validateSchema(schema, { minPrice: 50, maxPrice: 100 }).maxPrice).toBeUndefined();
  });

  it("validates refine on number field for even-number constraint", () => {
    const schema = createSchema({
      count: {
        type: "number",
        rules: [
          {
            name: "refine",
            validate: (v) => typeof v === "number" && v % 2 === 0,
            error: { message: "Count must be even" },
          },
        ],
      },
    });
    expect(validateSchema(schema, { count: 3 }).count?.message).toBe("Count must be even");
    expect(validateSchema(schema, { count: 4 }).count).toBeUndefined();
  });

  it("validates oneOf on number field", () => {
    const schema = createSchema({
      priority: {
        type: "number",
        rules: [{ name: "oneOf", value: [1, 2, 3], error: { message: "Priority must be 1, 2, or 3" } }],
      },
    });
    expect(validateSchema(schema, { priority: 4 }).priority?.message).toBe("Priority must be 1, 2, or 3");
    expect(validateSchema(schema, { priority: 2 }).priority).toBeUndefined();
  });

  it("validates notOneOf on number field", () => {
    const schema = createSchema({
      port: {
        type: "number",
        rules: [{ name: "notOneOf", value: [80, 443, 22], error: { message: "Reserved port number" } }],
      },
    });
    expect(validateSchema(schema, { port: 80 }).port?.message).toBe("Reserved port number");
    expect(validateSchema(schema, { port: 8080 }).port).toBeUndefined();
  });
});

