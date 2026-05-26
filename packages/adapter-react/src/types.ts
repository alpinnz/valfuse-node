import type { ChangeEvent, FocusEvent } from "react";
import type { ValfuseFieldErrors, ValfuseSchema } from "@valfuse-node/core";

// ─── Validation mode ──────────────────────────────────────────────────────────

export type ValfuseFormMode = "onSubmit" | "onChange" | "onBlur";

// ─── Error ────────────────────────────────────────────────────────────────────

/** A single field error — extends the core error with a required `type` field */
export type ValfuseFieldError = {
  message: string;
  /** Error originator: "validation" | "server" | "manual" | "custom" */
  type: string;
  /** Optional semantic code (e.g. "email.required", "auth.not_found") */
  code?: string;
  metadata?: Record<string, unknown>;
};

// ─── Form state ───────────────────────────────────────────────────────────────

export type ValfuseFormErrors<TFieldValues extends Record<string, unknown>> = {
  [K in keyof TFieldValues]?: ValfuseFieldError;
};

export type ValfuseFormState<TFieldValues extends Record<string, unknown>> = {
  errors: ValfuseFormErrors<TFieldValues>;
  isSubmitting: boolean;
};

// ─── register() ───────────────────────────────────────────────────────────────

/** Props returned by `form.register(name)` — spread directly onto `<input>` */
export type ValfuseRegisterReturn = {
  name: string;
  /** Current field value — compatible with HTML input `value` prop */
  value: string | number | readonly string[] | undefined;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: (e?: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
};

// ─── control (internal bridge ─ useValfuseForm ↔ ValfuseController) ──────────

/**
 * Opaque control object — passed to `<ValfuseController control={...} />`.
 * Internal fields are prefixed with `_` and not part of the public API.
 */
export type ValfuseFormControl<TFieldValues extends Record<string, unknown>> = {
  /** @internal Current field values */
  _values: TFieldValues;
  /** @internal Current validation errors */
  _errors: ValfuseFormErrors<TFieldValues>;
  /** @internal Update a single field value */
  _updateField: <TName extends keyof TFieldValues & string>(
    name: TName,
    value: TFieldValues[TName]
  ) => void;
  /** @internal Mark a field as touched (triggers onBlur validation) */
  _touchField: (name: string) => void;
  /** @internal Set of names of fields the user has interacted with */
  _touchedFields: ReadonlySet<string>;
};

// ─── useValfuseForm ───────────────────────────────────────────────────────────

export type UseValfuseFormProps<TFieldValues extends Record<string, unknown>> = {
  schema: ValfuseSchema;
  defaultValues: TFieldValues;
  /**
   * When validation runs:
   * - `"onSubmit"` (default) — only on form submission
   * - `"onChange"` — on every keystroke
   * - `"onBlur"` — when a field loses focus
   */
  mode?: ValfuseFormMode;
};

export type UseValfuseFormReturn<TFieldValues extends Record<string, unknown>> = {
  /** Registers an input field — spread the return value onto `<input>` */
  register: <TName extends keyof TFieldValues & string>(name: TName) => ValfuseRegisterReturn;
  /** Passed to `<ValfuseController control={...} />` */
  control: ValfuseFormControl<TFieldValues>;
  /** Wraps form submission: validates first, then calls `onValid` */
  handleSubmit: (
    onValid: (values: TFieldValues) => void | Promise<void>
  ) => (e?: React.FormEvent | { preventDefault?: () => void }) => Promise<void>;
  /** Reactive form state (errors, isSubmitting) */
  formState: ValfuseFormState<TFieldValues>;
  /** Inject external errors (e.g. from API responses) */
  setErrors: (errors: ValfuseFieldErrors<Extract<keyof TFieldValues, string>>) => void;
  /** Clear one, many, or all field errors */
  clearErrors: (name?: keyof TFieldValues | Array<keyof TFieldValues>) => void;
  /**
   * Programmatically set a field value.
   * Pass `{ shouldValidate: true }` to run validation immediately after setting.
   */
  setValue: <TName extends keyof TFieldValues>(
    name: TName,
    value: TFieldValues[TName],
    options?: { shouldValidate?: boolean }
  ) => void;
  /**
   * Manually trigger validation.
   * - No argument → validate all fields
   * - Single name → validate one field
   * - Array of names → validate those fields
   *
   * Returns `true` if all triggered fields are valid, `false` otherwise.
   */
  trigger: (name?: keyof TFieldValues & string | Array<keyof TFieldValues & string>) => boolean;
  /** Watch all fields — returns the full values object */
  watch: () => TFieldValues;
  /** Reset the form to default values (or provided partial values) */
  reset: (values?: Partial<TFieldValues>) => void;
};


