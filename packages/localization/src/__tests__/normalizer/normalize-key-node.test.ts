import { describe, it, expect } from "vitest";
import { normalizeKeyNode } from "../../normalizer/normalize-key-node";

describe("normalizeKeyNode", () => {
  it("attaches module and locale to the leaf", () => {
    const result = normalizeKeyNode(
      { key: "greeting", sourceKey: "greeting", leaf: { value: "Hello" } },
      "common",
      "en"
    );
    expect(result).toEqual({
      key: "greeting",
      sourceKey: "greeting",
      module: "common",
      locale: "en",
      value: "Hello",
      metadata: undefined,
      structured: undefined,
      placeholders: [],
    });
  });

  it("extracts placeholders from the value", () => {
    const result = normalizeKeyNode(
      { key: "greeting", sourceKey: "greeting", leaf: { value: "Hello, {name}" } },
      "common",
      "en"
    );
    expect(result.placeholders).toEqual(["name"]);
  });

  it("preserves structured and metadata fields from the leaf", () => {
    const result = normalizeKeyNode(
      {
        key: "items",
        sourceKey: "items",
        leaf: {
          value: "",
          metadata: { description: "items" },
          structured: { type: "plural", variants: { one: "1", other: "{count}" } },
        },
      },
      "common",
      "en"
    );
    expect(result.metadata).toEqual({ description: "items" });
    expect(result.structured).toEqual({
      type: "plural",
      variants: { one: "1", other: "{count}" },
    });
  });

  it("uses empty array for placeholders when value has none", () => {
    const result = normalizeKeyNode(
      { key: "static", sourceKey: "static", leaf: { value: "no tokens" } },
      "common",
      "en"
    );
    expect(result.placeholders).toEqual([]);
  });

  it("preserves an empty string value (not coerced to undefined)", () => {
    const result = normalizeKeyNode(
      { key: "items", sourceKey: "items", leaf: { value: "" } },
      "common",
      "en"
    );
    expect(result.value).toBe("");
  });
});
