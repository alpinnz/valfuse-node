import { describe, it, expect } from "vitest";
import { pickGenderVariant } from "../../runtime/pick-gender-variant";

describe("pickGenderVariant", () => {
  it("returns the variant matching the requested gender", () => {
    const variants = {
      male: "He submitted",
      female: "She submitted",
      other: "They submitted",
    };
    expect(pickGenderVariant(variants, "male")).toBe("He submitted");
    expect(pickGenderVariant(variants, "female")).toBe("She submitted");
    expect(pickGenderVariant(variants, "other")).toBe("They submitted");
  });

  it("falls back to 'other' when the requested gender is missing", () => {
    const variants = { male: "He", female: "She", other: "They" };
    expect(pickGenderVariant(variants, "nonbinary")).toBe("They");
  });

  it("falls back to the first available variant when 'other' is missing", () => {
    const variants = { male: "He", female: "She" };
    expect(pickGenderVariant(variants, "nonbinary")).toBe("He");
  });

  it("returns an empty string when variants is empty", () => {
    expect(pickGenderVariant({}, "any")).toBe("");
  });

  it("'other' takes priority over 'default' when both are present", () => {
    // Distinguishes pickGenderVariant from pickContextVariant: context looks
    // for "default", gender looks for "other". With both keys present, gender
    // uses "other" as its primary fallback.
    const variants = { default: "Default", other: "Other", male: "He" };
    expect(pickGenderVariant(variants, "nonbinary")).toBe("Other");
  });
});
