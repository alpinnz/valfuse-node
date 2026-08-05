import { describe, it, expect } from "vitest";
import { parseStructuredNode } from "../../parser/parse-structured-node";

describe("parseStructuredNode", () => {
  describe("@plural", () => {
    it("parses a plural node with simple variants", () => {
      expect(parseStructuredNode({ "@plural": { one: "1 item", other: "{count} items" } })).toEqual(
        {
          type: "plural",
          variants: { one: "1 item", other: "{count} items" },
        }
      );
    });

    it("includes the zero variant in plural", () => {
      const result = parseStructuredNode({
        "@plural": { zero: "none", one: "1", other: "{count}" },
      });
      expect(result).toEqual({
        type: "plural",
        variants: { zero: "none", one: "1", other: "{count}" },
      });
    });
  });

  describe("@gender", () => {
    it("parses a gender node with male/female/other variants", () => {
      expect(
        parseStructuredNode({
          "@gender": { male: "He", female: "She", other: "They" },
        })
      ).toEqual({
        type: "gender",
        variants: { male: "He", female: "She", other: "They" },
      });
    });
  });

  describe("@context", () => {
    it("parses a context node with formal/casual/default variants", () => {
      expect(
        parseStructuredNode({
          "@context": { formal: "Good day", casual: "Hey", default: "Hello" },
        })
      ).toEqual({
        type: "context",
        variants: { formal: "Good day", casual: "Hey", default: "Hello" },
      });
    });
  });

  describe("priority when multiple structured keys are present", () => {
    // parseStructuredNode returns the first match: @plural → @gender → @context.
    // Documenting that order is enforced (the actual priority matters for the
    // parser contract — having both would be a project-level error caught by
    // the structured-parity validator, not parseStructuredNode itself).
    it("prefers @plural over @gender and @context", () => {
      const result = parseStructuredNode({
        "@plural": { one: "1" },
        "@gender": { male: "He" },
        "@context": { formal: "F" },
      });
      expect(result?.type).toBe("plural");
    });

    it("prefers @gender over @context when @plural is absent", () => {
      const result = parseStructuredNode({
        "@gender": { male: "He" },
        "@context": { formal: "F" },
      });
      expect(result?.type).toBe("gender");
    });
  });

  describe("no structured key", () => {
    it("returns undefined when no @-structured key is present", () => {
      expect(parseStructuredNode({ "@value": "plain" })).toBeUndefined();
    });

    it("returns undefined for an empty object", () => {
      expect(parseStructuredNode({})).toBeUndefined();
    });

    it("ignores other @-prefixed keys (@value, @description, etc.)", () => {
      expect(
        parseStructuredNode({
          "@value": "hello",
          "@description": "some description",
        })
      ).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("throws when @plural variants is not an object", () => {
      expect(() => parseStructuredNode({ "@plural": "not an object" })).toThrow(
        /Structured node variants must be an object/
      );
    });

    it("throws when @plural variants is an array", () => {
      expect(() => parseStructuredNode({ "@plural": ["one", "other"] })).toThrow(
        /Structured node variants must be an object/
      );
    });

    it("throws when a variant value is not a string", () => {
      expect(() => parseStructuredNode({ "@plural": { one: 42, other: "{count}" } })).toThrow(
        /Structured variant "one" must be a string/
      );
    });

    it("throws when a gender variant value is null", () => {
      expect(() => parseStructuredNode({ "@gender": { male: null, other: "They" } })).toThrow(
        /Structured variant "male" must be a string/
      );
    });

    it("throws when a context variant value is a boolean", () => {
      expect(() => parseStructuredNode({ "@context": { formal: true } })).toThrow(
        /Structured variant "formal" must be a string/
      );
    });
  });
});
