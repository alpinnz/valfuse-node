import { describe, it, expect } from "vitest";
import { interpolate } from "../../runtime/interpolate";

describe("interpolate", () => {
  it("replaces a single named placeholder", () => {
    expect(interpolate("Hello, {name}", { name: "Alfin" })).toBe("Hello, Alfin");
  });

  it("replaces multiple placeholders in the same string", () => {
    expect(interpolate("{greeting}, {name}!", { greeting: "Hi", name: "Alfin" })).toBe(
      "Hi, Alfin!"
    );
  });

  it("accepts numeric parameter values and stringifies them", () => {
    expect(interpolate("You have {count} messages", { count: 5 })).toBe("You have 5 messages");
  });

  it("returns the original token when a param is missing", () => {
    // The contract says: keep `{name}` visible during development so missing
    // values are obvious in the rendered output.
    expect(interpolate("Hello, {name}", {})).toBe("Hello, {name}");
  });

  it("returns the original token when a param is explicitly undefined", () => {
    // The type is `Record<string, string | number>`, so we cast to bypass
    // strict-undefined checks and exercise the runtime's nullish-coalescing
    // fallback path explicitly.
    expect(interpolate("Hello, {name}", { name: undefined as unknown as string })).toBe(
      "Hello, {name}"
    );
  });

  it("coerces undefined-like values to the original token via String()", () => {
    // null is not in the type, but the implementation uses String(params[name] ?? `{name}`),
    // so null falls through to the original token.
    expect(interpolate("x={v}", { v: null as unknown as string })).toBe("x={v}");
  });

  it("accepts an empty params object without throwing", () => {
    expect(interpolate("plain string with no tokens", {})).toBe("plain string with no tokens");
  });

  it("defaults params to {} when not provided", () => {
    expect(interpolate("plain string")).toBe("plain string");
  });

  it("ignores tokens that don't match the placeholder identifier grammar", () => {
    // Identifier rule: must start with a letter or underscore, then [a-zA-Z0-9_]*.
    // So {0foo}, {foo-bar}, {foo bar} are NOT placeholders and are preserved as-is.
    expect(interpolate("{0foo} {foo-bar} {foo bar}", { foo: "ok" })).toBe(
      "{0foo} {foo-bar} {foo bar}"
    );
  });

  it("supports underscores and digits in placeholder names (after first char)", () => {
    expect(interpolate("{user_id_1} = {value2}", { user_id_1: "u", value2: "v" })).toBe("u = v");
  });

  it("does not match Unicode letters in placeholder names (ASCII-only contract)", () => {
    // The regex uses [a-zA-Z_] for the first character, so non-ASCII letters
    // (like ï, é, ñ) don't form a valid placeholder. Documenting this:
    // placeholders must use ASCII identifier characters only.
    expect(interpolate("Hi {naïve}", { naïve: "Alfin" })).toBe("Hi {naïve}");
  });

  it("does not double-substitute an inserted value", () => {
    // If a value contains {x}, the engine must NOT re-process it. This prevents
    // injection when a user-controlled value happens to look like a token.
    const injected = "Hello, {realName}";
    const out = interpolate("From {name}", { name: injected });
    expect(out).toBe("From Hello, {realName}");
  });

  it("handles consecutive placeholders with no separator", () => {
    expect(interpolate("{a}{b}{c}", { a: "1", b: "2", c: "3" })).toBe("123");
  });

  it("returns the input unchanged when there are no placeholders", () => {
    const input = "no tokens here, just text";
    expect(interpolate(input, { any: "thing" })).toBe(input);
  });
});
