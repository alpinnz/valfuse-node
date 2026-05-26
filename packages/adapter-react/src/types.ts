import type { ChangeEvent, FocusEvent } from "react";
import type { ValfuseFieldErrors, ValfuseSchema } from "@valfuse-node/core";

// ─── Validation mode ──────────────────────────────────────────────────────────

/**
 * Controls when validation is triggered — mirrors react-hook-form's `mode` option:
 *
 * | Mode         | Behaviour                                                               |
 * |--------------|-------------------------------------------------------------------------|
 * | `onSubmit`   | Validate only when the form is submitted (default)                      |
 * | `onBlur`     | Validate when a field loses focus                                       |
 * | `onChange`   | Validate on every keystroke / value change                              |
 * | `onTouched`  | Validate on the first blur; after that validate on every change         |
 * | `all`        | Validate on both `onChange` and `onBlur`                                |
 */
export type ValfuseFormMode = "onSubmit" | "onBlur" | "onChange" | "onTouched" | "all";

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

export type ValfuseDirtyFields<TFieldValues extends Record<string, unknown>> = {
  [K in keyof TFieldValues]?: boolean;
};

export type ValfuseTouchedFields<TFieldValues extends Record<string, unknown>> = {
  [K in keyof TFieldValues]?: boolean;
};

export type ValfuseFormState<TFieldValues extends Record<string, unknown>> = {
  /** All current field validation errors */
  errors: ValfuseFormErrors<TFieldValues>;

  // ── Submission ──────────────────────────────────────────────────────────────

  /** `true` while an async submit handler is running */
  isSubmitting: boolean;
  /** `true` after the form has been submitted at least once */
  isSubmitted: boolean;
  /**
   * `true` if the most recent submission completed without validation errors
   * and the `onValid` handler resolved successfully.
   */
  isSubmitSuccessful: boolean;
  /** Total number of submit attempts (resets on `reset()`) */
  submitCount: number;

  // ── Derived ─────────────────────────────────────────────────────────────────

  /** `true` if any field value differs from its default value */
  isDirty: boolean;
  /**
   * `true` if there are currently no validation errors.
   * Note: for `"onSubmit"` mode this will be `true` until the first submission.
   */
  isValid: boolean;
  /** Map of fields whose current value differs from the default (`{ email: true }`) */
  dirtyFields: ValfuseDirtyFields<TFieldValues>;
  /** Map of fields the user has interacted with (focused + blurred) */
  touchedFields: ValfuseTouchedFields<TFieldValues>;
  /** The `defaultValues` that were passed to `useValfuseForm` */
  defaultValues: TFieldValues;
};

// ─── watch ────────────────────────────────────────────────────────────────────

/**
 * Callback passed to `form.watch(callback)`.
 * Called every time any field value changes.
 */
export type ValfuseWatchCallback<TFieldValues extends Record<string, unknown>> = (
  values: TFieldValues,
  info: { name?: string; type?: string }
) => void;

/**
 * Callable type for `form.watch` — mirrors react-hook-form overloads:
 *
 * ```ts
 * form.watch()                          // → TFieldValues (all values)
 * form.watch("email")                   // → TFieldValues["email"]
 * form.watch(["email", "name"])         // → Array of values in the same order
 * form.watch((values, info) => void)    // → () => void  (unsubscribe)
 * ```
 */
export interface ValfuseWatchFunction<TFieldValues extends Record<string, unknown>> {
  (): TFieldValues;
  <TName extends keyof TFieldValues & string>(name: TName): TFieldValues[TName];
  (names: Array<keyof TFieldValues & string>): Array<TFieldValues[keyof TFieldValues]>;
  (callback: ValfuseWatchCallback<TFieldValues>): () => void;
}

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
   * - `"onBlur"` — when a field loses focus
   * - `"onChange"` — on every keystroke
   * - `"onTouched"` — on first blur, then on every change after that
   * - `"all"` — on both onChange and onBlur
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
  /**
   * Reactive form state.
   * Includes: errors, isSubmitting, isSubmitted, isSubmitSuccessful,
   * submitCount, isDirty, isValid, dirtyFields, touchedFields, defaultValues.
   */
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
  /**
   * Watch field values — mirrors react-hook-form's `watch`:
   *
   * ```ts
   * form.watch()                           // all current values
   * form.watch("email")                    // single field value
   * form.watch(["email", "name"])          // array of values
   * const unsub = form.watch((values, info) => { ... }); // subscribe
   * unsub();                               // unsubscribe
   * ```
   */
  watch: ValfuseWatchFunction<TFieldValues>;
  /** Reset the form to default values (or provided partial values) */
  reset: (values?: Partial<TFieldValues>) => void;
};


