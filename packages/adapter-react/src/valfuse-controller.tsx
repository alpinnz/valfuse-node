import React from "react";
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
  const field: ValfuseControllerField<TFieldValues[TName]> = {
    name,
    value: control._values[name] as TFieldValues[TName],
    onChange: (value: TFieldValues[TName]) => {
      control._updateField(name, value);
    },
    onBlur: () => {
      control._touchField(name);
    },
  };

  const fieldState: ValfuseControllerFieldState = {
    error: control._errors[name],
    isTouched: control._touchedFields.has(name),
  };

  return render({ field, fieldState });
}
