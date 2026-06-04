import { describe, it, expect } from "vitest";
import { pickContextVariant } from "../../runtime/pick-context-variant";

describe("pickContextVariant", () => {
  it("returns the variant matching the requested context", () => {
    const variants = { formal: "Good day", casual: "Hey", default: "Hello" };
    expect(pickContextVariant(variants, "formal")).toBe("Good day");
    expect(pickContextVariant(variants, "casual")).toBe("Hey");
  });

  it("falls back to 'default' when the requested context is missing", () => {
    const variants = { default: "Hello", formal: "Good day" };
    expect(pickContextVariant(variants, "informal")).toBe("Hello");
  });

  it("falls back to the first available variant when 'default' is missing", () => {
    const variants = { formal: "Good day", casual: "Hey" };
    // No 'default' key — uses first available (Object.values)[0]
    expect(pickContextVariant(variants, "missing")).toBe("Good day");
  });

  it("returns the requested variant even when 'default' is also present", () => {
    const variants = { default: "Hello", formal: "Good day" };
    expect(pickContextVariant(variants, "formal")).toBe("Good day");
  });

  it("returns an empty string when variants is empty", () => {
    expect(pickContextVariant({}, "anything")).toBe("");
  });

  it("returns the only available variant when the requested one is missing", () => {
    expect(pickContextVariant({ only: "lonely" }, "missing")).toBe("lonely");
  });
});
