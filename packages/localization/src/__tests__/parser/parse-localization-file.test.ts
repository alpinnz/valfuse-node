import { describe, it, expect } from "vitest";
import { parseLocalizationFile } from "../../parser/parse-localization-file";

describe("parseLocalizationFile", () => {
  describe("leaf shapes", () => {
    it("returns a plain string as a string node", () => {
      const result = parseLocalizationFile({ greeting: "Hello" });
      expect(result).toEqual({ greeting: "Hello" });
    });

    it("returns an object with @value as a leaf with that value", () => {
      const result = parseLocalizationFile({ greeting: { "@value": "Hello" } });
      expect(result).toEqual({
        greeting: { value: "Hello", metadata: undefined, structured: undefined },
      });
    });

    it("returns an object with @value plus metadata", () => {
      const result = parseLocalizationFile({
        greeting: {
          "@value": "Hello",
          "@description": "greeting message",
        },
      });
      expect(result).toEqual({
        greeting: {
          value: "Hello",
          metadata: { description: "greeting message" },
          structured: undefined,
        },
      });
    });

    it("returns an object with structured (plural) variants", () => {
      const result = parseLocalizationFile({
        items: {
          "@plural": { one: "1 item", other: "{count} items" },
        },
      });
      expect(result).toEqual({
        items: {
          value: "",
          metadata: undefined,
          structured: { type: "plural", variants: { one: "1 item", other: "{count} items" } },
        },
      });
    });
  });

  describe("nested object trees", () => {
    it("recursively parses nested objects", () => {
      const result = parseLocalizationFile({
        common: {
          strings: {
            app_title: "Valfuse",
            save_button: "Save",
          },
        },
      });
      expect(result).toEqual({
        common: {
          strings: {
            app_title: "Valfuse",
            save_button: "Save",
          },
        },
      });
    });

    it("mixes string leaves, value-leaves, and structured-leaves in the same tree", () => {
      const result = parseLocalizationFile({
        title: "Valfuse",
        items: {
          "@plural": { one: "1 item", other: "{count} items" },
        },
        email: {
          "@value": "you@example.com",
          "@description": "default email",
        },
        nested: {
          deep: {
            leaf: "leaf value",
          },
        },
      });
      expect(result).toEqual({
        title: "Valfuse",
        items: {
          value: "",
          metadata: undefined,
          structured: { type: "plural", variants: { one: "1 item", other: "{count} items" } },
        },
        email: {
          value: "you@example.com",
          metadata: { description: "default email" },
          structured: undefined,
        },
        nested: {
          deep: {
            leaf: "leaf value",
          },
        },
      });
    });
  });

  describe("error handling", () => {
    it("throws on a non-object, non-string node", () => {
      expect(() => parseLocalizationFile({ bad: 42 as unknown })).toThrow(
        /Invalid localization node/
      );
    });

    it("throws on an array node (arrays are not valid leaves or subtrees)", () => {
      expect(() => parseLocalizationFile({ bad: ["a", "b"] as unknown })).toThrow(
        /Invalid localization node/
      );
    });

    it("throws on null at any level", () => {
      expect(() =>
        parseLocalizationFile({ bad: null as unknown })
      ).toThrow(/Invalid localization node/);
    });
  });
});
