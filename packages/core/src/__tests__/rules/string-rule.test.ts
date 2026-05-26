/**
 * Comprehensive tests for ALL string rules.
 * Covers: required, min, max, length, email, url, uuid,
 *         regex, includes, startsWith, endsWith
 */

import { describe, it, expect } from "vitest";
import { validateStringRule } from "../../rules/string.rule";
import { createSchema } from "../../create-schema";
import { validateSchema } from "../../validate-schema";
import type { ValfuseStringRule } from "../../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mkRule(rule: ValfuseStringRule) {
  return rule;
}

const ERR = { message: "error", code: "test.error" };

// ─── required ────────────────────────────────────────────────────────────────

describe("string rule: required", () => {
  const rule = mkRule({ name: "required", error: ERR });

  it("fails for empty string", () => {
    expect(validateStringRule("", rule)).toEqual(ERR);
  });

  it("fails for whitespace-only string", () => {
    expect(validateStringRule("   ", rule)).toEqual(ERR);
  });

  it("fails for null", () => {
    expect(validateStringRule(null, rule)).toEqual(ERR);
  });

  it("fails for undefined", () => {
    expect(validateStringRule(undefined, rule)).toEqual(ERR);
  });

  it("passes for a non-empty string", () => {
    expect(validateStringRule("hello", rule)).toBeNull();
  });

  it("passes for a single character", () => {
    expect(validateStringRule("a", rule)).toBeNull();
  });

  it("passes for a string with internal spaces", () => {
    expect(validateStringRule("hello world", rule)).toBeNull();
  });
});

// ─── min ─────────────────────────────────────────────────────────────────────

describe("string rule: min", () => {
  const rule = mkRule({ name: "min", value: 5, error: ERR });

  it("fails when string length is below minimum", () => {
    expect(validateStringRule("hi", rule)).toEqual(ERR);
  });

  it("fails when string length is exactly one less than minimum", () => {
    expect(validateStringRule("abcd", rule)).toEqual(ERR);
  });

  it("passes when string length equals minimum", () => {
    expect(validateStringRule("hello", rule)).toBeNull();
  });

  it("passes when string length exceeds minimum", () => {
    expect(validateStringRule("hello world", rule)).toBeNull();
  });

  it("passes for empty string (not required — empty→length 0 < 5, so fails)", () => {
    // empty string has length 0, which is < 5
    expect(validateStringRule("", rule)).toEqual(ERR);
  });
});

// ─── max ─────────────────────────────────────────────────────────────────────

describe("string rule: max", () => {
  const rule = mkRule({ name: "max", value: 5, error: ERR });

  it("fails when string length exceeds maximum", () => {
    expect(validateStringRule("toolong", rule)).toEqual(ERR);
  });

  it("passes when string length equals maximum", () => {
    expect(validateStringRule("hello", rule)).toBeNull();
  });

  it("passes when string length is below maximum", () => {
    expect(validateStringRule("hi", rule)).toBeNull();
  });

  it("passes for empty string", () => {
    expect(validateStringRule("", rule)).toBeNull();
  });
});

// ─── length ──────────────────────────────────────────────────────────────────

describe("string rule: length", () => {
  const rule = mkRule({ name: "length", value: 6, error: ERR });

  it("fails when string length is less than required exact length", () => {
    expect(validateStringRule("abc", rule)).toEqual(ERR);
  });

  it("fails when string length is greater than required exact length", () => {
    expect(validateStringRule("toolongstring", rule)).toEqual(ERR);
  });

  it("passes when string length exactly matches", () => {
    expect(validateStringRule("abcdef", rule)).toBeNull();
  });

  it("fails for empty string when length is 6", () => {
    expect(validateStringRule("", rule)).toEqual(ERR);
  });

  it("passes for empty string when length is 0", () => {
    const exactZero = mkRule({ name: "length", value: 0, error: ERR });
    expect(validateStringRule("", exactZero)).toBeNull();
  });
});

// ─── email ───────────────────────────────────────────────────────────────────

describe("string rule: email", () => {
  const rule = mkRule({ name: "email", error: ERR });

  it.each([
    "not-an-email",
    "missing-at-sign.com",
    "@nodomain.com",
    "user@",
    "user @example.com",
    "",
  ])("fails for invalid email: %s", (email) => {
    expect(validateStringRule(email, rule)).toEqual(ERR);
  });

  it.each([
    "user@example.com",
    "user.name+tag@sub.domain.org",
    "admin@valfuse.io",
    "a@b.co",
  ])("passes for valid email: %s", (email) => {
    expect(validateStringRule(email, rule)).toBeNull();
  });
});

// ─── url ─────────────────────────────────────────────────────────────────────

describe("string rule: url", () => {
  const rule = mkRule({ name: "url", error: ERR });

  it.each([
    "not-a-url",
    "ftp://missing-scheme",
    "www.example.com", // missing protocol
    "",
    "just text",
  ])("fails for invalid URL: %s", (url) => {
    expect(validateStringRule(url, rule)).toEqual(ERR);
  });

  it.each([
    "https://example.com",
    "http://example.com",
    "https://sub.domain.org/path?query=1&foo=bar",
    "https://example.com/path/to/resource",
    "http://localhost.com",
  ])("passes for valid URL: %s", (url) => {
    expect(validateStringRule(url, rule)).toBeNull();
  });
});

// ─── uuid ─────────────────────────────────────────────────────────────────────

describe("string rule: uuid", () => {
  const rule = mkRule({ name: "uuid", error: ERR });

  it.each([
    "not-a-uuid",
    "12345678-1234-1234-1234-1234567890ZZ", // invalid hex
    "12345678123412341234123456789012",       // no dashes
    "",
    "00000000-0000-0000-0000-00000000000",   // too short
  ])("fails for invalid UUID: %s", (uuid) => {
    expect(validateStringRule(uuid, rule)).toEqual(ERR);
  });

  it.each([
    "550e8400-e29b-41d4-a716-446655440000",
    "00000000-0000-0000-0000-000000000000",
    "FFFFFFFF-FFFF-FFFF-FFFF-FFFFFFFFFFFF", // uppercase is valid (case-insensitive)
    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  ])("passes for valid UUID: %s", (uuid) => {
    expect(validateStringRule(uuid, rule)).toBeNull();
  });
});

// ─── regex ────────────────────────────────────────────────────────────────────

describe("string rule: regex", () => {
  it("fails when value does not match RegExp instance", () => {
    const rule = mkRule({ name: "regex", value: /^\d+$/, error: ERR });
    expect(validateStringRule("abc", rule)).toEqual(ERR);
    expect(validateStringRule("12a", rule)).toEqual(ERR);
  });

  it("passes when value matches RegExp instance", () => {
    const rule = mkRule({ name: "regex", value: /^\d+$/, error: ERR });
    expect(validateStringRule("12345", rule)).toBeNull();
  });

  it("fails when value does not match pattern config object", () => {
    const rule = mkRule({ name: "regex", value: { pattern: "^[a-z]+$" }, error: ERR });
    expect(validateStringRule("ABC", rule)).toEqual(ERR);
    expect(validateStringRule("123", rule)).toEqual(ERR);
  });

  it("passes when value matches pattern config object", () => {
    const rule = mkRule({ name: "regex", value: { pattern: "^[a-z]+$" }, error: ERR });
    expect(validateStringRule("hello", rule)).toBeNull();
  });

  it("respects flags in pattern config object", () => {
    const rule = mkRule({ name: "regex", value: { pattern: "^[a-z]+$", flags: "i" }, error: ERR });
    expect(validateStringRule("HELLO", rule)).toBeNull(); // i flag makes case-insensitive
    expect(validateStringRule("HELLO123", rule)).toEqual(ERR);
  });
});

// ─── includes ────────────────────────────────────────────────────────────────

describe("string rule: includes", () => {
  const rule = mkRule({ name: "includes", value: "foo", error: ERR });

  it("fails when string does not include the substring", () => {
    expect(validateStringRule("bar baz", rule)).toEqual(ERR);
    expect(validateStringRule("", rule)).toEqual(ERR);
  });

  it("passes when string includes the substring", () => {
    expect(validateStringRule("foobar", rule)).toBeNull();
    expect(validateStringRule("barfoo", rule)).toBeNull();
    expect(validateStringRule("barfoobaz", rule)).toBeNull();
  });

  it("is case-sensitive", () => {
    expect(validateStringRule("FOO", rule)).toEqual(ERR);
  });
});

// ─── startsWith ──────────────────────────────────────────────────────────────

describe("string rule: startsWith", () => {
  const rule = mkRule({ name: "startsWith", value: "https://", error: ERR });

  it("fails when string does not start with prefix", () => {
    expect(validateStringRule("http://example.com", rule)).toEqual(ERR);
    expect(validateStringRule("example.com", rule)).toEqual(ERR);
    expect(validateStringRule("", rule)).toEqual(ERR);
  });

  it("passes when string starts with the prefix", () => {
    expect(validateStringRule("https://example.com", rule)).toBeNull();
    expect(validateStringRule("https://", rule)).toBeNull();
  });

  it("is case-sensitive", () => {
    expect(validateStringRule("HTTPS://example.com", rule)).toEqual(ERR);
  });
});

// ─── endsWith ────────────────────────────────────────────────────────────────

describe("string rule: endsWith", () => {
  const rule = mkRule({ name: "endsWith", value: ".com", error: ERR });

  it("fails when string does not end with the suffix", () => {
    expect(validateStringRule("example.org", rule)).toEqual(ERR);
    expect(validateStringRule("", rule)).toEqual(ERR);
  });

  it("passes when string ends with the suffix", () => {
    expect(validateStringRule("example.com", rule)).toBeNull();
    expect(validateStringRule(".com", rule)).toBeNull();
  });

  it("is case-sensitive", () => {
    expect(validateStringRule("example.COM", rule)).toEqual(ERR);
  });
});

// ─── Integration via validateSchema ──────────────────────────────────────────

describe("string rules integration via validateSchema", () => {
  it("validates length rule correctly", () => {
    const schema = createSchema({
      pin: { type: "string", rules: [{ name: "length", value: 4, error: { message: "PIN must be 4 digits" } }] },
    });
    expect(validateSchema(schema, { pin: "123" }).pin?.message).toBe("PIN must be 4 digits");
    expect(validateSchema(schema, { pin: "12345" }).pin?.message).toBe("PIN must be 4 digits");
    expect(validateSchema(schema, { pin: "1234" }).pin).toBeUndefined();
  });

  it("validates url rule correctly", () => {
    const schema = createSchema({
      website: { type: "string", rules: [{ name: "url", error: { message: "Invalid URL" } }] },
    });
    expect(validateSchema(schema, { website: "not-a-url" }).website?.message).toBe("Invalid URL");
    expect(validateSchema(schema, { website: "https://example.com" }).website).toBeUndefined();
  });

  it("validates uuid rule correctly", () => {
    const schema = createSchema({
      id: { type: "string", rules: [{ name: "uuid", error: { message: "Invalid UUID" } }] },
    });
    expect(validateSchema(schema, { id: "bad-uuid" }).id?.message).toBe("Invalid UUID");
    expect(validateSchema(schema, { id: "550e8400-e29b-41d4-a716-446655440000" }).id).toBeUndefined();
  });

  it("validates includes rule correctly", () => {
    const schema = createSchema({
      bio: { type: "string", rules: [{ name: "includes", value: "valfuse", error: { message: "Must mention valfuse" } }] },
    });
    expect(validateSchema(schema, { bio: "I love forms" }).bio?.message).toBe("Must mention valfuse");
    expect(validateSchema(schema, { bio: "I love valfuse" }).bio).toBeUndefined();
  });

  it("validates startsWith rule correctly", () => {
    const schema = createSchema({
      link: { type: "string", rules: [{ name: "startsWith", value: "https://", error: { message: "Must be HTTPS" } }] },
    });
    expect(validateSchema(schema, { link: "http://example.com" }).link?.message).toBe("Must be HTTPS");
    expect(validateSchema(schema, { link: "https://example.com" }).link).toBeUndefined();
  });

  it("validates endsWith rule correctly", () => {
    const schema = createSchema({
      email: { type: "string", rules: [{ name: "endsWith", value: "@company.com", error: { message: "Must be company email" } }] },
    });
    expect(validateSchema(schema, { email: "user@gmail.com" }).email?.message).toBe("Must be company email");
    expect(validateSchema(schema, { email: "user@company.com" }).email).toBeUndefined();
  });
});

