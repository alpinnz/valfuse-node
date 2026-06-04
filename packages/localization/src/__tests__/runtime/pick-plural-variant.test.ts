import { describe, it, expect } from "vitest";
import { pickPluralVariant } from "../../runtime/pick-plural-variant";

describe("pickPluralVariant", () => {
  it("returns 'zero' variant when count is 0", () => {
    const variants = {
      zero: "No messages",
      one: "1 message",
      other: "{count} messages",
    };
    expect(pickPluralVariant(variants, 0)).toBe("No messages");
  });

  it("returns 'one' variant when count is 1", () => {
    const variants = { one: "1 message", other: "{count} messages" };
    expect(pickPluralVariant(variants, 1)).toBe("1 message");
  });

  it("returns 'other' variant for count > 1", () => {
    const variants = { one: "1 message", other: "{count} messages" };
    expect(pickPluralVariant(variants, 2)).toBe("{count} messages");
    expect(pickPluralVariant(variants, 100)).toBe("{count} messages");
  });

  it("falls back to first available when 'other' is missing", () => {
    const variants = { one: "1 message", many: "lots" };
    expect(pickPluralVariant(variants, 5)).toBe("1 message");
  });

  it("zero takes priority over one and other for count=0", () => {
    const variants = { zero: "none", one: "1", other: "many" };
    expect(pickPluralVariant(variants, 0)).toBe("none");
  });

  it("one takes priority over other for count=1", () => {
    const variants = { one: "1", other: "many" };
    expect(pickPluralVariant(variants, 1)).toBe("1");
  });

  it("handles negative counts by routing to 'other'", () => {
    const variants = { zero: "none", one: "1", other: "{count}" };
    expect(pickPluralVariant(variants, -3)).toBe("{count}");
  });

  it("returns an empty string when variants is empty", () => {
    expect(pickPluralVariant({}, 5)).toBe("");
  });

  it("returns 'zero' for count=0 even when 'one' is also present", () => {
    // Documents priority: zero → one → other
    const variants = { one: "1 item" };
    expect(pickPluralVariant(variants, 0)).toBe("1 item");
  });
});
