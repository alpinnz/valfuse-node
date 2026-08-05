import { describe, it, expect } from "vitest";
import { flattenKeys } from "../../normalizer/flatten-keys";

describe("flattenKeys", () => {
  it("returns a single flattened leaf for a flat string map", () => {
    const result = flattenKeys({ greeting: "Hello", farewell: "Bye" });
    expect(result).toEqual([
      { key: "farewell", sourceKey: "farewell", leaf: { value: "Bye" } },
      { key: "greeting", sourceKey: "greeting", leaf: { value: "Hello" } },
    ]);
  });

  it("flattens a nested object tree with dotted keys", () => {
    const result = flattenKeys({
      common: {
        strings: {
          app_title: "Valfuse",
          save_button: "Save",
        },
      },
    });
    expect(result).toEqual([
      {
        key: "common.strings.app_title",
        sourceKey: "common.strings.app_title",
        leaf: { value: "Valfuse" },
      },
      {
        key: "common.strings.save_button",
        sourceKey: "common.strings.save_button",
        leaf: { value: "Save" },
      },
    ]);
  });

  it("preserves LocalizedLeaf (value/metadata/structured) verbatim", () => {
    // flattenKeys is called AFTER parseLocalizationFile, which converts
    // @-prefixed keys into a LocalizedLeaf shape. So the input here is
    // already in the parsed shape.
    const result = flattenKeys({
      greeting: {
        value: "Hello",
        metadata: { description: "a greeting" },
      },
    });
    expect(result).toEqual([
      {
        key: "greeting",
        sourceKey: "greeting",
        leaf: { value: "Hello", metadata: { description: "a greeting" } },
      },
    ]);
  });

  it("skips file-level @@ metadata keys (e.g. @@locale, @@module)", () => {
    const result = flattenKeys({
      "@@locale": "en",
      "@@module": "common",
      greeting: "Hello",
    });
    expect(result).toEqual([{ key: "greeting", sourceKey: "greeting", leaf: { value: "Hello" } }]);
  });

  it("returns leaves sorted by key (alphabetical, locale-aware)", () => {
    // The output is sorted so downstream pipelines can rely on stable ordering
    // (e.g. for deterministic code generation and snapshot tests).
    const result = flattenKeys({
      z: "z",
      a: "a",
      m: "m",
    });
    expect(result.map((r) => r.key)).toEqual(["a", "m", "z"]);
  });

  it("preserves the sourceKey equal to the flattened key (no aliasing)", () => {
    // The current implementation always sets sourceKey = key. The two
    // separate fields are kept for future flexibility (e.g. when an
    // namespace_prefix config strips the module from the runtime key but
    // keeps it in the source).
    const result = flattenKeys({ common: { title: "T" } });
    expect(result[0].key).toBe("common.title");
    expect(result[0].sourceKey).toBe("common.title");
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenKeys({})).toEqual([]);
  });

  it("wraps bare string nodes into a { value } leaf", () => {
    // Documents the toLeaf helper: a string becomes a LocalizedLeaf with just
    // the value field. Verify by checking the result's shape.
    const result = flattenKeys({ a: "x" });
    expect(result[0].leaf).toEqual({ value: "x" });
  });

  it("treats string leaves and object-leaves uniformly in mixed trees", () => {
    // Note: flattenKeys is called AFTER parseLocalizationFile, which converts
    // @-prefixed keys into a LocalizedLeaf shape (with .value, .metadata,
    // .structured fields). So the input here is already in the parsed shape.
    const result = flattenKeys({
      stringLeaf: "hi",
      objectLeaf: { value: "ho" },
      nested: {
        deep: "deep value",
      },
    });
    expect(result).toEqual([
      { key: "nested.deep", sourceKey: "nested.deep", leaf: { value: "deep value" } },
      { key: "objectLeaf", sourceKey: "objectLeaf", leaf: { value: "ho" } },
      { key: "stringLeaf", sourceKey: "stringLeaf", leaf: { value: "hi" } },
    ]);
  });
});
