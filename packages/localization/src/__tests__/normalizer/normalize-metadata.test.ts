import { describe, it, expect } from "vitest";
import { normalizeMetadata } from "../../normalizer/normalize-metadata";

describe("normalizeMetadata", () => {
  it("returns undefined when given undefined", () => {
    expect(normalizeMetadata(undefined)).toBeUndefined();
  });

  it("returns a copy of the metadata (not the same reference)", () => {
    const input = { description: "x" };
    const result = normalizeMetadata(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it("sorts @placeholders keys alphabetically", () => {
    const result = normalizeMetadata({
      placeholders: { zebra: "z", alpha: "a", mango: "m" },
    });
    expect(Object.keys(result?.placeholders ?? {})).toEqual(["alpha", "mango", "zebra"]);
  });

  it("sorts @custom keys alphabetically", () => {
    const result = normalizeMetadata({
      custom: { zebra: 1, alpha: 2, mango: 3 },
    });
    expect(Object.keys(result?.custom ?? {})).toEqual(["alpha", "mango", "zebra"]);
  });

  it("drops placeholders/custom when absent (does not preserve empty objects)", () => {
    const result = normalizeMetadata({ description: "x" });
    expect(result).toEqual({ description: "x" });
    expect(result?.placeholders).toBeUndefined();
    expect(result?.custom).toBeUndefined();
  });

  it("preserves @description and @example order-independent of the sort applied to other fields", () => {
    const result = normalizeMetadata({
      description: "desc",
      example: "ex",
      placeholders: { b: "1", a: "2" },
      custom: { y: 1, x: 2 },
    });
    expect(result).toEqual({
      description: "desc",
      example: "ex",
      placeholders: { a: "2", b: "1" },
      custom: { x: 2, y: 1 },
    });
  });

  it("returns an empty object when metadata has no recognized fields", () => {
    // The contract: normalizeMetadata returns a new object even when there
    // are no sortable fields, because the input was truthy.
    const result = normalizeMetadata({});
    expect(result).toEqual({});
  });
});
