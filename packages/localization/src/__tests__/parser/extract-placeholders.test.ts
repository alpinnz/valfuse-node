import { describe, it, expect } from "vitest";
import { extractPlaceholders } from "../../parser/extract-placeholders";

describe("extractPlaceholders", () => {
  it("returns an empty array when no placeholders are present", () => {
    expect(extractPlaceholders("plain text with no tokens")).toEqual([]);
  });

  it("extracts a single placeholder", () => {
    expect(extractPlaceholders("Hello, {name}")).toEqual(["name"]);
  });

  it("extracts multiple unique placeholders, sorted alphabetically", () => {
    expect(extractPlaceholders("{b} {a} {c}")).toEqual(["a", "b", "c"]);
  });

  it("deduplicates repeated placeholders", () => {
    // {name} appears 3 times — should be reported once.
    expect(extractPlaceholders("{name} and {name} and again {name}")).toEqual(["name"]);
  });

  it("supports underscores and digits in placeholder names (after first char)", () => {
    expect(extractPlaceholders("{user_id} = {value2}")).toEqual(["user_id", "value2"]);
  });

  it("ignores tokens that don't match the identifier grammar", () => {
    // Same rules as interpolate: must start with letter/_, then [a-zA-Z0-9_]*,
    // and the whole pattern has to match contiguously (no spaces allowed).
    expect(extractPlaceholders("{0foo} {foo-bar} {foo bar} { valid }")).toEqual([]);
  });

  it("returns the same array reference is not guaranteed (new array each call)", () => {
    const a = extractPlaceholders("{x}");
    const b = extractPlaceholders("{x}");
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });

  it("returns an empty array for an empty string", () => {
    expect(extractPlaceholders("")).toEqual([]);
  });

  it("handles a string that is only a single placeholder", () => {
    expect(extractPlaceholders("{token}")).toEqual(["token"]);
  });

  it("handles non-ASCII characters in surrounding text", () => {
    // Placeholder names must be ASCII (same regex as interpolate), but the
    // surrounding text is free to contain any character.
    expect(extractPlaceholders("Halo {name}, 你好!")).toEqual(["name"]);
  });
});
