import { describe, it, expect } from "vitest";
import {
  parseStructuredVariants,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
} from "../../runtime/pick-structured-variant";

// ─── parseStructuredVariants ─────────────────────────────────────────────────

describe("parseStructuredVariants", () => {
  it("parses a valid JSON object string", () => {
    expect(parseStructuredVariants('{"formal":"Good day","casual":"Hey"}')).toEqual({
      formal: "Good day",
      casual: "Hey",
    });
  });

  it("returns null for an empty string", () => {
    expect(parseStructuredVariants("")).toBeNull();
  });

  it("returns null for a string that does not start with '{'", () => {
    // Optimization: skip JSON.parse for non-object-shaped strings.
    expect(parseStructuredVariants("plain string")).toBeNull();
    expect(parseStructuredVariants("[1,2,3]")).toBeNull();
  });

  it("returns null for a non-object JSON value (array)", () => {
    // parseStructuredVariants expects a record. Arrays are JSON objects, but
    // the explicit Array.isArray check rejects them.
    expect(parseStructuredVariants("[]")).toBeNull();
  });

  it("returns null for invalid JSON syntax", () => {
    expect(parseStructuredVariants('{"key": value}')).toBeNull();
  });

  it("returns null for a JSON literal (string, number, null)", () => {
    expect(parseStructuredVariants('"hello"')).toBeNull();
    expect(parseStructuredVariants("42")).toBeNull();
    expect(parseStructuredVariants("null")).toBeNull();
  });
});

// ─── pickStructuredContextVariant ────────────────────────────────────────────

describe("pickStructuredContextVariant", () => {
  const raw = JSON.stringify({ formal: "Good day, {name}", casual: "Hey, {name}" });

  it("picks the matching context variant and interpolates params", () => {
    expect(pickStructuredContextVariant(raw, "formal", { name: "Alfin" })).toBe("Good day, Alfin");
    expect(pickStructuredContextVariant(raw, "casual", { name: "Alfin" })).toBe("Hey, Alfin");
  });

  it("falls back to 'default' when the requested context is missing", () => {
    const withDefault = JSON.stringify({
      default: "Hello, {name}",
      formal: "Good day, {name}",
    });
    expect(pickStructuredContextVariant(withDefault, "missing", { name: "X" })).toBe("Hello, X");
  });

  it("interpolates without params (no params argument)", () => {
    const noParams = JSON.stringify({ formal: "Good day" });
    expect(pickStructuredContextVariant(noParams, "formal")).toBe("Good day");
  });

  it("keeps placeholders intact when params is omitted but value has tokens", () => {
    // Without params, the interpolation step leaves the original {name} token
    // in place (interpolate's contract for missing params).
    const withToken = JSON.stringify({ formal: "Hello, {name}" });
    expect(pickStructuredContextVariant(withToken, "formal")).toBe("Hello, {name}");
  });

  it("returns the raw input unchanged when it is not a valid structured payload", () => {
    expect(pickStructuredContextVariant("plain string", "formal", { x: 1 })).toBe("plain string");
  });
});

// ─── pickStructuredGenderVariant ─────────────────────────────────────────────

describe("pickStructuredGenderVariant", () => {
  const raw = JSON.stringify({
    male: "He submitted",
    female: "She submitted",
    other: "They submitted",
  });

  it("picks the matching gender variant", () => {
    expect(pickStructuredGenderVariant(raw, "male", {})).toBe("He submitted");
    expect(pickStructuredGenderVariant(raw, "female", {})).toBe("She submitted");
  });

  it("falls back to 'other' for unrecognized gender", () => {
    expect(pickStructuredGenderVariant(raw, "nonbinary", {})).toBe("They submitted");
  });

  it("interpolates params into the chosen variant", () => {
    const named = JSON.stringify({ male: "{name} submitted" });
    expect(pickStructuredGenderVariant(named, "male", { name: "Alfin" })).toBe("Alfin submitted");
  });

  it("returns raw input when not a structured payload", () => {
    expect(pickStructuredGenderVariant("not-json", "male", {})).toBe("not-json");
  });
});

// ─── pickStructuredPluralVariant ─────────────────────────────────────────────

describe("pickStructuredPluralVariant", () => {
  const raw = JSON.stringify({
    zero: "No messages",
    one: "1 message",
    other: "{count} messages",
  });

  it("picks 'zero' for count=0", () => {
    expect(pickStructuredPluralVariant(raw, 0, {})).toBe("No messages");
  });

  it("picks 'one' for count=1", () => {
    expect(pickStructuredPluralVariant(raw, 1, {})).toBe("1 message");
  });

  it("picks 'other' for count>1 and injects the count into interpolation params", () => {
    expect(pickStructuredPluralVariant(raw, 5, {})).toBe("5 messages");
    // The {count} placeholder is auto-injected. User params merge on top.
  });

  it("user-provided params override the auto-injected count", () => {
    const withCount = JSON.stringify({ other: "{count} items" });
    expect(pickStructuredPluralVariant(withCount, 5, { count: 99 })).toBe("99 items");
  });

  it("merges user params alongside the count injection", () => {
    const withName = JSON.stringify({ other: "{name} has {count} items" });
    expect(pickStructuredPluralVariant(withName, 3, { name: "Alfin" })).toBe("Alfin has 3 items");
  });

  it("returns raw input when not a structured payload", () => {
    expect(pickStructuredPluralVariant("not-json", 5, {})).toBe("not-json");
  });
});
