import type { ValfuseFormMode } from "../types/index";

/**
 * Returns `true` if an onChange event should trigger validation.
 *
 * | mode        | triggers when                                    |
 * |-------------|--------------------------------------------------|
 * | onChange    | always                                           |
 * | all         | always                                           |
 * | onTouched   | only after the field has been blurred at least once |
 * | onSubmit    | never on change                                  |
 * | onBlur      | never on change                                  |
 */
export function shouldValidateOnChange(mode: ValfuseFormMode, isTouched: boolean): boolean {
  return mode === "onChange" || mode === "all" || (mode === "onTouched" && isTouched);
}

/**
 * Returns `true` if an onBlur event should trigger validation.
 *
 * | mode        | triggers |
 * |-------------|----------|
 * | onBlur      | ✅       |
 * | all         | ✅       |
 * | onTouched   | ✅       |
 * | onChange    | ❌       |
 * | onSubmit    | ❌       |
 */
export function shouldValidateOnBlur(mode: ValfuseFormMode): boolean {
  return mode === "onBlur" || mode === "all" || mode === "onTouched";
}

