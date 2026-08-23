import { describe, it, expect } from "vitest";
import { shouldValidateOnChange, shouldValidateOnBlur } from "../../helpers/validation-mode";
import type { ValfuseFormMode } from "../../types";

describe("shouldValidateOnChange", () => {
  it.each([
    // [mode, isTouched, expected]
    ["onChange", false, true],
    ["onChange", true, true],
    ["all", false, true],
    ["all", true, true],
    ["onTouched", false, false],
    ["onTouched", true, true],
    ["onSubmit", false, false],
    ["onSubmit", true, false],
    ["onBlur", false, false],
    ["onBlur", true, false],
  ] as [ValfuseFormMode, boolean, boolean][])(
    "mode=%s isTouched=%s → %s",
    (mode, isTouched, expected) => {
      expect(shouldValidateOnChange(mode, isTouched)).toBe(expected);
    }
  );
});

describe("shouldValidateOnBlur", () => {
  it.each([
    ["onBlur", true],
    ["all", true],
    ["onTouched", true],
    ["onChange", false],
    ["onSubmit", false],
  ] as [ValfuseFormMode, boolean][])("mode=%s → %s", (mode, expected) => {
    expect(shouldValidateOnBlur(mode)).toBe(expected);
  });
});
