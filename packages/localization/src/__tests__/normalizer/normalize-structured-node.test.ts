import { describe, it, expect } from "vitest";
import { normalizeStructuredNode } from "../../normalizer/normalize-structured-node";

describe("normalizeStructuredNode", () => {
  it("returns undefined when given undefined", () => {
    expect(normalizeStructuredNode(undefined)).toBeUndefined();
  });

  it("sorts plural variant keys alphabetically", () => {
    const result = normalizeStructuredNode({
      type: "plural",
      variants: { one: "1", other: "{count}", zero: "0" },
    });
    expect(Object.keys(result?.variants ?? {})).toEqual(["one", "other", "zero"]);
  });

  it("sorts gender variant keys alphabetically", () => {
    const result = normalizeStructuredNode({
      type: "gender",
      variants: { male: "He", female: "She", other: "They" },
    });
    expect(Object.keys(result?.variants ?? {})).toEqual(["female", "male", "other"]);
  });

  it("sorts context variant keys alphabetically", () => {
    const result = normalizeStructuredNode({
      type: "context",
      variants: { formal: "F", casual: "C", default: "D" },
    });
    expect(Object.keys(result?.variants ?? {})).toEqual(["casual", "default", "formal"]);
  });

  it("preserves the type field", () => {
    const result = normalizeStructuredNode({
      type: "plural",
      variants: { one: "1" },
    });
    expect(result?.type).toBe("plural");
  });

  it("returns a new object (not the same reference)", () => {
    const input = { type: "plural" as const, variants: { one: "1", other: "{count}" } };
    const result = normalizeStructuredNode(input);
    expect(result).not.toBe(input);
    expect(result?.variants).not.toBe(input.variants);
  });

  it("preserves variant values exactly (only key order is normalized)", () => {
    const result = normalizeStructuredNode({
      type: "plural",
      variants: { one: "1", other: "{count}" },
    });
    expect(result?.variants).toEqual({ one: "1", other: "{count}" });
  });
});
