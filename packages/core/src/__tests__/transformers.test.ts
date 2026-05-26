import { describe, it, expect } from "vitest";
import { t } from "../transformers";

// ── String transformers ───────────────────────────────────────────────────────

describe("t.trim", () => {
  it("trims whitespace from both ends", () => expect(t.trim("  hello  ")).toBe("hello"));
  it("no-ops non-string values", () => expect(t.trim(42)).toBe(42));
  it("returns empty string when all whitespace", () => expect(t.trim("   ")).toBe(""));
});

describe("t.trimStart", () => {
  it("trims only the start", () => expect(t.trimStart("  hi  ")).toBe("hi  "));
});

describe("t.trimEnd", () => {
  it("trims only the end", () => expect(t.trimEnd("  hi  ")).toBe("  hi"));
});

describe("t.toLowerCase", () => {
  it("converts to lowercase", () => expect(t.toLowerCase("HELLO")).toBe("hello"));
  it("no-ops non-string", () => expect(t.toLowerCase(99)).toBe(99));
});

describe("t.toUpperCase", () => {
  it("converts to uppercase", () => expect(t.toUpperCase("hello")).toBe("HELLO"));
  it("no-ops non-string", () => expect(t.toUpperCase(null)).toBe(null));
});

describe("t.toTitleCase", () => {
  it("capitalizes first letter of each word", () =>
    expect(t.toTitleCase("hello world")).toBe("Hello World"));
  it("works on single word", () => expect(t.toTitleCase("hello")).toBe("Hello"));
});

describe("t.toSentenceCase", () => {
  it("capitalizes first letter, lowercases rest", () =>
    expect(t.toSentenceCase("hELLO WORLD")).toBe("Hello world"));
});

describe("t.collapseSpaces", () => {
  it("collapses multiple spaces to one", () =>
    expect(t.collapseSpaces("hello   world")).toBe("hello world"));
  it("collapses tabs and newlines too", () =>
    expect(t.collapseSpaces("hello\t\nworld")).toBe("hello world"));
});

// ── Coercion transformers ─────────────────────────────────────────────────────

describe("t.toNumber", () => {
  it("converts numeric string to number", () => expect(t.toNumber("42")).toBe(42));
  it("converts float string to number", () => expect(t.toNumber("3.14")).toBe(3.14));
  it("returns original value on NaN", () => expect(t.toNumber("abc")).toBe("abc"));
  it("passes through existing numbers", () => expect(t.toNumber(99)).toBe(99));
  it("converts empty string to 0 (Number('') = 0)", () => expect(t.toNumber("")).toBe(0));
});

describe("t.toInteger", () => {
  it("converts float string to integer", () => expect(t.toInteger("42.9")).toBe(42));
  it("converts integer string to integer", () => expect(t.toInteger("5")).toBe(5));
  it("returns original value on NaN", () => expect(t.toInteger("abc")).toBe("abc"));
});

describe("t.toFloat", () => {
  it("converts float string to float", () => expect(t.toFloat("3.14")).toBe(3.14));
  it("returns original on NaN", () => expect(t.toFloat("xyz")).toBe("xyz"));
});

describe("t.toBoolean", () => {
  it.each([
    [true,   true],
    ["true", true],
    [1,      true],
    ["1",    true],
    [false,  false],
    ["false",false],
    [0,      false],
    ["0",    false],
    ["",     false],
  ] as [unknown, boolean][])(
    "t.toBoolean(%j) → %s",
    (input, expected) => expect(t.toBoolean(input)).toBe(expected)
  );
});

// ── Composition ───────────────────────────────────────────────────────────────

describe("t.pipe", () => {
  it("chains transformers left-to-right", () => {
    const transform = t.pipe(t.trim, t.toLowerCase);
    expect(transform("  HELLO@EMAIL.COM  ")).toBe("hello@email.com");
  });

  it("works with a single transformer", () => {
    const transform = t.pipe(t.trim);
    expect(transform("  hi  ")).toBe("hi");
  });

  it("passes through unchanged with no transformers", () => {
    const transform = t.pipe();
    expect(transform("hello")).toBe("hello");
  });

  it("chains coercion + string transform", () => {
    // toNumber first, then… toUpperCase no-ops on a number
    const transform = t.pipe(t.trim, t.toNumber);
    expect(transform("  42  ")).toBe(42);
  });
});

