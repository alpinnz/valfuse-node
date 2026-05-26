import React, { useCallback, useMemo } from "react";
import type { ValfuseFieldError, ValfuseFormControl } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ValfuseControllerFieldState = {
  error?: ValfuseFieldError;
  isTouched: boolean;
};

export type ValfuseControllerField<TValue> = {
  name: string;
  value: TValue;
  /** Receives the raw value — not a DOM event */
  onChange: (value: TValue) => void;
  onBlur: () => void;
};

export type ValfuseControllerRenderProps<
  TFieldValues extends Record<string, unknown>,
  TName extends keyof TFieldValues & string,
> = {
  field: ValfuseControllerField<TFieldValues[TName]>;
  fieldState: ValfuseControllerFieldState;
};

export type ValfuseControllerProps<
  TFieldValues extends Record<string, unknown>,
  TName extends keyof TFieldValues & string = keyof TFieldValues & string,
> = {
  control: ValfuseFormControl<TFieldValues>;
  name: TName;
  render: (
    props: ValfuseControllerRenderProps<TFieldValues, TName>
  ) => React.ReactElement;
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Controlled field wrapper for complex inputs (dropdowns, date-pickers, etc.)
 * that cannot be registered with `form.register(name)`.
 *
 * `fieldState.error` is typed as `ValfuseFieldError | undefined`, so both
 * `fieldState.error?.message` and `fieldState.error?.code` work out of the box.
 *
 * @example
 * <ValfuseController
 *   control={form.control}
 *   name="roleId"
 *   render={({ field, fieldState }) => (
 *     <RoleDropdown
 *       value={field.value}
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       error={fieldState.error?.code}
 *     />
 *   )}
 * />
 */
export function ValfuseController<
  TFieldValues extends Record<string, unknown>,
  TName extends keyof TFieldValues & string = keyof TFieldValues & string,
>({
  control,
  name,
  render,
}: ValfuseControllerProps<TFieldValues, TName>): React.ReactElement {
  // Stable callbacks — only recreate when control._updateField / _touchField
  // change (i.e. when the schema changes), NOT on every value/error update.
  // This ensures React.memo'd child inputs don't rerender from new function refs.
  const onChange = useCallback(
    (value: TFieldValues[TName]) => control._updateField(name, value),
    [control._updateField, name]
  );

  const onBlur = useCallback(
    () => control._touchField(name),
    [control._touchField, name]
  );

  // Extract only THIS field's reactive data so that when an unrelated field
  // changes (different name), these local vars stay the same reference and the
  // memos below don't invalidate — avoiding unnecessary re-renders of the
  // render prop's children.
  const fieldValue = control._values[name] as TFieldValues[TName];
  const fieldError = control._errors[name];
  const isTouched = control._touchedFields.has(name);

  const field = useMemo(
    (): ValfuseControllerField<TFieldValues[TName]> => ({
      name,
      value: fieldValue,
      onChange,
      onBlur,
    }),
    [name, fieldValue, onChange, onBlur]
  );

  const fieldState = useMemo(
    (): ValfuseControllerFieldState => ({
      error: fieldError,
      isTouched,
    }),
    [fieldError, isTouched]
  );

  return render({ field, fieldState });
}
