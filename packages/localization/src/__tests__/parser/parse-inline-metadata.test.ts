import { describe, it, expect } from "vitest";
import { parseInlineMetadata } from "../../parser/parse-inline-metadata";

describe("parseInlineMetadata", () => {
  describe("well-known metadata keys", () => {
    it("parses @description", () => {
      expect(parseInlineMetadata({ "@description": "Greeting message" })).toEqual({
        description: "Greeting message",
      });
    });

    it("parses @example", () => {
      expect(parseInlineMetadata({ "@example": "Hello, {name}" })).toEqual({
        example: "Hello, {name}",
      });
    });

    it("parses @placeholders as a record", () => {
      expect(
        parseInlineMetadata({
          "@placeholders": { name: "user's name", count: "number of items" },
        })
      ).toEqual({
        placeholders: { name: "user's name", count: "number of items" },
      });
    });

    it("parses all three well-known keys together", () => {
      expect(
        parseInlineMetadata({
          "@description": "Greets a user",
          "@example": "Hello, {name}",
          "@placeholders": { name: "user's name" },
        })
      ).toEqual({
        description: "Greets a user",
        example: "Hello, {name}",
        placeholders: { name: "user's name" },
      });
    });
  });

  describe("reserved @-keys (not treated as metadata)", () => {
    // These keys have their own dedicated handling (value, structured variants)
    // and must NOT appear in the metadata object, even if present.
    it("ignores @value", () => {
      expect(parseInlineMetadata({ "@value": "ignored" })).toBeUndefined();
    });

    it("ignores @plural, @gender, @context", () => {
      expect(
        parseInlineMetadata({
          "@plural": { one: "1", other: "{count}" },
          "@gender": { male: "He" },
          "@context": { formal: "F" },
        })
      ).toBeUndefined();
    });

    it("treats well-known keys (description/example/placeholders) as metadata even when reserved keys are present", () => {
      expect(
        parseInlineMetadata({
          "@value": "hi",
          "@description": "desc",
        })
      ).toEqual({ description: "desc" });
    });
  });

  describe("custom metadata keys", () => {
    it("captures unknown @-prefixed keys under 'custom' (without the @ prefix)", () => {
      expect(parseInlineMetadata({ "@internal": "x", "@audience": "admin" })).toEqual({
        custom: { internal: "x", audience: "admin" },
      });
    });

    it("merges custom with well-known keys", () => {
      expect(
        parseInlineMetadata({
          "@description": "desc",
          "@internal": true,
        })
      ).toEqual({
        description: "desc",
        custom: { internal: true },
      });
    });
  });

  describe("empty / no metadata", () => {
    it("returns undefined for an empty object", () => {
      expect(parseInlineMetadata({})).toBeUndefined();
    });

    it("returns undefined for an object with no @-prefixed keys", () => {
      expect(parseInlineMetadata({ name: "x", value: 42 })).toBeUndefined();
    });
  });
});
