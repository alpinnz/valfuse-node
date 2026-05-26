/**
 * Comprehensive tests for ALL number rules.
 * Covers: required, min, max, gt, gte, lt, lte,
 *         int, positive, nonnegative, negative, nonpositive, multipleOf
 */

import { describe, it, expect } from "vitest";
import { validateNumberRule } from "../../rules/number.rule";
import { createSchema } from "../../create-schema";
import { validateSchema } from "../../validate-schema";
import type { ValfuseNumberRule } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseNumberRule) {
  return rule;
}

const ERR = { message: "error", code: "test.number" };

// ─── required ────────────────────────────────────────────────────────────────

describe("number rule: required", () => {
  const rule = mkRule({ name: "required", error: ERR });

  it("fails for null", () => expect(validateNumberRule(null, rule)).toEqual(ERR));
  it("fails for undefined", () => expect(validateNumberRule(undefined, rule)).toEqual(ERR));
  it("fails for empty string", () => expect(validateNumberRule("", rule)).toEqual(ERR));
  it("fails for NaN", () => expect(validateNumberRule(NaN, rule)).toEqual(ERR));
  it("fails for non-numeric string", () => expect(validateNumberRule("abc", rule)).toEqual(ERR));

  it("passes for 0", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for a positive number", () => expect(validateNumberRule(42, rule)).toBeNull());
  it("passes for a negative number", () => expect(validateNumberRule(-1, rule)).toBeNull());
  it("passes for a float", () => expect(validateNumberRule(3.14, rule)).toBeNull());
});

// ─── min ─────────────────────────────────────────────────────────────────────

describe("number rule: min", () => {
  const rule = mkRule({ name: "min", value: 5, error: ERR });

  it("fails when number is below minimum", () => expect(validateNumberRule(4, rule)).toEqual(ERR));
  it("fails when number is 0 (below minimum of 5)", () => expect(validateNumberRule(0, rule)).toEqual(ERR));
  it("fails for negative number (below minimum)", () => expect(validateNumberRule(-10, rule)).toEqual(ERR));

  it("passes when number equals minimum", () => expect(validateNumberRule(5, rule)).toBeNull());
  it("passes when number exceeds minimum", () => expect(validateNumberRule(100, rule)).toBeNull());

  it("skips check for null (no hasNumericValue)", () => expect(validateNumberRule(null, rule)).toBeNull());
  it("skips check for undefined", () => expect(validateNumberRule(undefined, rule)).toBeNull());
  it("skips check for empty string", () => expect(validateNumberRule("", rule)).toBeNull());
  it("skips check for NaN", () => expect(validateNumberRule(NaN, rule)).toBeNull());
});

// ─── max ─────────────────────────────────────────────────────────────────────

describe("number rule: max", () => {
  const rule = mkRule({ name: "max", value: 10, error: ERR });

  it("fails when number exceeds maximum", () => expect(validateNumberRule(11, rule)).toEqual(ERR));
  it("fails for very large number", () => expect(validateNumberRule(9999, rule)).toEqual(ERR));

  it("passes when number equals maximum", () => expect(validateNumberRule(10, rule)).toBeNull());
  it("passes when number is below maximum", () => expect(validateNumberRule(5, rule)).toBeNull());
  it("passes for 0 (below maximum)", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for negative number", () => expect(validateNumberRule(-5, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── gt (greater than) ───────────────────────────────────────────────────────

describe("number rule: gt", () => {
  const rule = mkRule({ name: "gt", value: 10, error: ERR });

  it("fails when number equals the gt value (not strictly greater)", () => {
    expect(validateNumberRule(10, rule)).toEqual(ERR);
  });
  it("fails when number is below gt value", () => {
    expect(validateNumberRule(9, rule)).toEqual(ERR);
  });
  it("fails for negative number", () => {
    expect(validateNumberRule(-1, rule)).toEqual(ERR);
  });

  it("passes when number is strictly greater", () => {
    expect(validateNumberRule(11, rule)).toBeNull();
  });
  it("passes for large number", () => {
    expect(validateNumberRule(1000, rule)).toBeNull();
  });

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── gte (greater than or equal) ─────────────────────────────────────────────

describe("number rule: gte", () => {
  const rule = mkRule({ name: "gte", value: 10, error: ERR });

  it("fails when number is below gte value", () => expect(validateNumberRule(9, rule)).toEqual(ERR));
  it("fails when number is negative", () => expect(validateNumberRule(-5, rule)).toEqual(ERR));

  it("passes when number equals gte value", () => expect(validateNumberRule(10, rule)).toBeNull());
  it("passes when number exceeds gte value", () => expect(validateNumberRule(11, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── lt (less than) ───────────────────────────────────────────────────────────

describe("number rule: lt", () => {
  const rule = mkRule({ name: "lt", value: 10, error: ERR });

  it("fails when number equals lt value (not strictly less)", () => {
    expect(validateNumberRule(10, rule)).toEqual(ERR);
  });
  it("fails when number exceeds lt value", () => {
    expect(validateNumberRule(11, rule)).toEqual(ERR);
  });

  it("passes when number is strictly less", () => {
    expect(validateNumberRule(9, rule)).toBeNull();
  });
  it("passes for 0", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for negative number", () => expect(validateNumberRule(-5, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── lte (less than or equal) ─────────────────────────────────────────────────

describe("number rule: lte", () => {
  const rule = mkRule({ name: "lte", value: 10, error: ERR });

  it("fails when number exceeds lte value", () => expect(validateNumberRule(11, rule)).toEqual(ERR));

  it("passes when number equals lte value", () => expect(validateNumberRule(10, rule)).toBeNull());
  it("passes when number is below lte value", () => expect(validateNumberRule(5, rule)).toBeNull());
  it("passes for negative number", () => expect(validateNumberRule(-100, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── int ──────────────────────────────────────────────────────────────────────

describe("number rule: int", () => {
  const rule = mkRule({ name: "int", error: ERR });

  it("fails for a float", () => expect(validateNumberRule(3.14, rule)).toEqual(ERR));
  it("fails for a negative float", () => expect(validateNumberRule(-1.5, rule)).toEqual(ERR));

  it("passes for an integer", () => expect(validateNumberRule(5, rule)).toBeNull());
  it("passes for 0", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for a negative integer", () => expect(validateNumberRule(-3, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
  it("skips check for NaN", () => expect(validateNumberRule(NaN, rule)).toBeNull());
});

// ─── positive ─────────────────────────────────────────────────────────────────

describe("number rule: positive", () => {
  const rule = mkRule({ name: "positive", error: ERR });

  it("fails for 0 (not strictly positive)", () => expect(validateNumberRule(0, rule)).toEqual(ERR));
  it("fails for a negative number", () => expect(validateNumberRule(-1, rule)).toEqual(ERR));

  it("passes for a positive integer", () => expect(validateNumberRule(1, rule)).toBeNull());
  it("passes for a positive float", () => expect(validateNumberRule(0.1, rule)).toBeNull());
  it("passes for large number", () => expect(validateNumberRule(9999, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── nonnegative ──────────────────────────────────────────────────────────────

describe("number rule: nonnegative", () => {
  const rule = mkRule({ name: "nonnegative", error: ERR });

  it("fails for a negative number", () => expect(validateNumberRule(-1, rule)).toEqual(ERR));
  it("fails for a negative float", () => expect(validateNumberRule(-0.001, rule)).toEqual(ERR));

  it("passes for 0 (nonnegative includes zero)", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for a positive integer", () => expect(validateNumberRule(5, rule)).toBeNull());
  it("passes for a positive float", () => expect(validateNumberRule(0.5, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── negative ─────────────────────────────────────────────────────────────────

describe("number rule: negative", () => {
  const rule = mkRule({ name: "negative", error: ERR });

  it("fails for 0 (not strictly negative)", () => expect(validateNumberRule(0, rule)).toEqual(ERR));
  it("fails for a positive number", () => expect(validateNumberRule(1, rule)).toEqual(ERR));
  it("fails for a positive float", () => expect(validateNumberRule(0.1, rule)).toEqual(ERR));

  it("passes for -1", () => expect(validateNumberRule(-1, rule)).toBeNull());
  it("passes for a large negative number", () => expect(validateNumberRule(-999, rule)).toBeNull());
  it("passes for a small negative float", () => expect(validateNumberRule(-0.001, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── nonpositive ──────────────────────────────────────────────────────────────

describe("number rule: nonpositive", () => {
  const rule = mkRule({ name: "nonpositive", error: ERR });

  it("fails for a positive number", () => expect(validateNumberRule(1, rule)).toEqual(ERR));
  it("fails for a positive float", () => expect(validateNumberRule(0.001, rule)).toEqual(ERR));

  it("passes for 0 (nonpositive includes zero)", () => expect(validateNumberRule(0, rule)).toBeNull());
  it("passes for -1", () => expect(validateNumberRule(-1, rule)).toBeNull());
  it("passes for large negative number", () => expect(validateNumberRule(-999, rule)).toBeNull());

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());
});

// ─── multipleOf ───────────────────────────────────────────────────────────────

describe("number rule: multipleOf", () => {
  const rule = mkRule({ name: "multipleOf", value: 5, error: ERR });

  it("fails when number is not a multiple of 5", () => {
    expect(validateNumberRule(7, rule)).toEqual(ERR);
    expect(validateNumberRule(1, rule)).toEqual(ERR);
    expect(validateNumberRule(11, rule)).toEqual(ERR);
  });

  it("passes when number is a multiple of 5", () => {
    expect(validateNumberRule(0, rule)).toBeNull();
    expect(validateNumberRule(5, rule)).toBeNull();
    expect(validateNumberRule(10, rule)).toBeNull();
    expect(validateNumberRule(25, rule)).toBeNull();
    expect(validateNumberRule(-10, rule)).toBeNull();
  });

  it("skips check for null", () => expect(validateNumberRule(null, rule)).toBeNull());

  it("handles multipleOf 2 (even numbers)", () => {
    const evenRule = mkRule({ name: "multipleOf", value: 2, error: ERR });
    expect(validateNumberRule(3, evenRule)).toEqual(ERR);
    expect(validateNumberRule(4, evenRule)).toBeNull();
  });
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("number rules integration via validateSchema", () => {
  it("validates required number field", () => {
    const schema = createSchema({
      age: { type: "number", rules: [{ name: "required", error: { message: "Age is required" } }] },
    });
    expect(validateSchema(schema, { age: null }).age?.message).toBe("Age is required");
    expect(validateSchema(schema, { age: undefined }).age?.message).toBe("Age is required");
    expect(validateSchema(schema, { age: 0 }).age).toBeUndefined();
    expect(validateSchema(schema, { age: 25 }).age).toBeUndefined();
  });

  it("validates min for number field", () => {
    const schema = createSchema({
      score: { type: "number", rules: [{ name: "min", value: 0, error: { message: "Score cannot be negative" } }] },
    });
    expect(validateSchema(schema, { score: -1 }).score?.message).toBe("Score cannot be negative");
    expect(validateSchema(schema, { score: 0 }).score).toBeUndefined();
  });

  it("validates max for number field", () => {
    const schema = createSchema({
      score: { type: "number", rules: [{ name: "max", value: 100, error: { message: "Score cannot exceed 100" } }] },
    });
    expect(validateSchema(schema, { score: 101 }).score?.message).toBe("Score cannot exceed 100");
    expect(validateSchema(schema, { score: 100 }).score).toBeUndefined();
  });

  it("validates gt rule", () => {
    const schema = createSchema({
      price: { type: "number", rules: [{ name: "gt", value: 0, error: { message: "Price must be greater than 0" } }] },
    });
    expect(validateSchema(schema, { price: 0 }).price?.message).toBe("Price must be greater than 0");
    expect(validateSchema(schema, { price: 0.01 }).price).toBeUndefined();
  });

  it("validates gte rule", () => {
    const schema = createSchema({
      qty: { type: "number", rules: [{ name: "gte", value: 1, error: { message: "Quantity must be at least 1" } }] },
    });
    expect(validateSchema(schema, { qty: 0 }).qty?.message).toBe("Quantity must be at least 1");
    expect(validateSchema(schema, { qty: 1 }).qty).toBeUndefined();
  });

  it("validates lt rule", () => {
    const schema = createSchema({
      pct: { type: "number", rules: [{ name: "lt", value: 100, error: { message: "Percentage must be less than 100" } }] },
    });
    expect(validateSchema(schema, { pct: 100 }).pct?.message).toBe("Percentage must be less than 100");
    expect(validateSchema(schema, { pct: 99.9 }).pct).toBeUndefined();
  });

  it("validates lte rule", () => {
    const schema = createSchema({
      pct: { type: "number", rules: [{ name: "lte", value: 100, error: { message: "Percentage cannot exceed 100" } }] },
    });
    expect(validateSchema(schema, { pct: 101 }).pct?.message).toBe("Percentage cannot exceed 100");
    expect(validateSchema(schema, { pct: 100 }).pct).toBeUndefined();
  });

  it("validates int rule", () => {
    const schema = createSchema({
      count: { type: "number", rules: [{ name: "int", error: { message: "Must be an integer" } }] },
    });
    expect(validateSchema(schema, { count: 3.5 }).count?.message).toBe("Must be an integer");
    expect(validateSchema(schema, { count: 3 }).count).toBeUndefined();
  });

  it("validates positive rule", () => {
    const schema = createSchema({
      price: { type: "number", rules: [{ name: "positive", error: { message: "Must be positive" } }] },
    });
    expect(validateSchema(schema, { price: 0 }).price?.message).toBe("Must be positive");
    expect(validateSchema(schema, { price: 1 }).price).toBeUndefined();
  });

  it("validates nonnegative rule", () => {
    const schema = createSchema({
      balance: { type: "number", rules: [{ name: "nonnegative", error: { message: "Balance cannot be negative" } }] },
    });
    expect(validateSchema(schema, { balance: -1 }).balance?.message).toBe("Balance cannot be negative");
    expect(validateSchema(schema, { balance: 0 }).balance).toBeUndefined();
  });

  it("validates negative rule", () => {
    const schema = createSchema({
      temp: { type: "number", rules: [{ name: "negative", error: { message: "Temperature must be negative" } }] },
    });
    expect(validateSchema(schema, { temp: 0 }).temp?.message).toBe("Temperature must be negative");
    expect(validateSchema(schema, { temp: -1 }).temp).toBeUndefined();
  });

  it("validates nonpositive rule", () => {
    const schema = createSchema({
      offset: { type: "number", rules: [{ name: "nonpositive", error: { message: "Offset must be nonpositive" } }] },
    });
    expect(validateSchema(schema, { offset: 1 }).offset?.message).toBe("Offset must be nonpositive");
    expect(validateSchema(schema, { offset: 0 }).offset).toBeUndefined();
  });

  it("validates multipleOf rule", () => {
    const schema = createSchema({
      duration: { type: "number", rules: [{ name: "multipleOf", value: 15, error: { message: "Must be a multiple of 15 minutes" } }] },
    });
    expect(validateSchema(schema, { duration: 20 }).duration?.message).toBe("Must be a multiple of 15 minutes");
    expect(validateSchema(schema, { duration: 30 }).duration).toBeUndefined();
    expect(validateSchema(schema, { duration: 45 }).duration).toBeUndefined();
  });

  it("stops at first failing rule in a chain", () => {
    const schema = createSchema({
      age: {
        type: "number",
        rules: [
          { name: "required", error: { message: "Required" } },
          { name: "min", value: 18, error: { message: "Must be at least 18" } },
          { name: "max", value: 120, error: { message: "Must be at most 120" } },
        ],
      },
    });
    expect(validateSchema(schema, { age: null }).age?.message).toBe("Required");
    expect(validateSchema(schema, { age: 17 }).age?.message).toBe("Must be at least 18");
    expect(validateSchema(schema, { age: 25 }).age).toBeUndefined();
  });
});

