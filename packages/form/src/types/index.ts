// ============================================================================
// Form Domain Types
// ============================================================================
// Framework-agnostic types for form validation and state management.
// These interfaces allow React, Vue, and other adapters to implement the form contract.

// ============================================================================
// Import from type files
// ============================================================================

import type {
  ValfuseRuleError,
  ValfuseErrorType,
  ValfuseError,
  ValfuseFieldErrors,
} from './errors';

import type {
  ValfuseRegexValue,
  ValfuseStringRule,
  ValfuseNumberRule,
  ValfuseBooleanRule,
  ValfuseArrayRule,
  ValfuseObjectRule,
  ValfuseGenericRule,
  ValfuseCustomRule,
  ValfuseRefineRule,
  ValfuseMatchFieldRule,
  ValfuseOneOfRule,
  ValfuseNotOneOfRule,
} from './rules';

import type {
  ValfuseTransformer,
  ValfuseStringFieldSchema,
  ValfuseNumberFieldSchema,
  ValfuseBooleanFieldSchema,
  ValfuseArrayFieldSchema,
  ValfuseObjectFieldSchema,
  ValfuseFieldSchema,
  ValfuseSchema,
  SetErrorsInput,
} from './schema';

// ============================================================================
// Re-export for public API
// ============================================================================

export type {
  ValfuseRuleError,
  ValfuseErrorType,
  ValfuseError,
  ValfuseFieldErrors,
  ValfuseRegexValue,
  ValfuseStringRule,
  ValfuseNumberRule,
  ValfuseBooleanRule,
  ValfuseArrayRule,
  ValfuseObjectRule,
  ValfuseGenericRule,
  ValfuseCustomRule,
  ValfuseRefineRule,
  ValfuseMatchFieldRule,
  ValfuseOneOfRule,
  ValfuseNotOneOfRule,
  ValfuseTransformer,
  ValfuseStringFieldSchema,
  ValfuseNumberFieldSchema,
  ValfuseBooleanFieldSchema,
  ValfuseArrayFieldSchema,
  ValfuseObjectFieldSchema,
  ValfuseFieldSchema,
  ValfuseSchema,
  SetErrorsInput,
};

// ============================================================================
// Validation Mode
// ============================================================================

/**
 * Controls when validation is triggered:
 *
 * | Mode         | Behaviour                                                               |
 * |--------------|-------------------------------------------------------------------------|
 * | `onSubmit`   | Validate only when the form is submitted (default)                      |
 * | `onBlur`     | Validate when a field loses focus                                       |
 * | `onChange`   | Validate on every keystroke / value change                              |
 * | `onTouched`  | Validate on the first blur; after that validate on every change         |
 * | `all`        | Validate on both `onChange` and `onBlur`                                |
 */
export type ValfuseFormMode =
  | "onSubmit"
  | "onBlur"
  | "onChange"
  | "onTouched"
  | "all";

// ============================================================================
// Error Types (Form-specific)
// ============================================================================

/** A single field error */
export interface ValfuseFieldError {
  message: string;
  /** Error originator: "validation" | "server" | "manual" | "custom" */
  type?: string;
  /** Optional semantic code (e.g. "email.required", "auth.not_found") */
  code?: string;
  metadata?: Record<string, unknown>;
}

/** Map of field names to their error */
export type ValfuseFormErrors<TSchema extends Record<string, unknown>> = {
  [K in keyof TSchema]?: ValfuseFieldError;
};

// ============================================================================
// Field State Types
// ============================================================================

/** Map of dirty fields (value changed from default) */
export type ValfuseDirtyFields<TSchema extends Record<string, unknown>> = {
  [K in keyof TSchema]?: boolean;
};

/** Map of touched fields (user interacted with) */
export type ValfuseTouchedFields<TSchema extends Record<string, unknown>> = {
  [K in keyof TSchema]?: boolean;
};

// ============================================================================
// Form State Interface
// ============================================================================

/** Reactive form state exposed to consumers */
export interface ValfuseFormState<TSchema extends Record<string, unknown>> {
  /** All current field validation errors */
  readonly errors: ValfuseFormErrors<TSchema>;

  // ── Submission ──────────────────────────────────────────────────────────────

  /** `true` while an async submit handler is running */
  readonly isSubmitting: boolean;
  /** `true` after the form has been submitted at least once */
  readonly isSubmitted: boolean;
  /** `true` if the most recent submission completed successfully */
  readonly isSubmitSuccessful: boolean;
  /** Total number of submit attempts */
  readonly submitCount: number;

  // ── Derived ─────────────────────────────────────────────────────────────────

  /** `true` if any field value differs from its default value */
  readonly isDirty: boolean;
  /** `true` if current values pass schema validation and there are no active errors */
  readonly isValid: boolean;
  /** Map of fields whose current value differs from the default */
  readonly dirtyFields: ValfuseDirtyFields<TSchema>;
  /** Map of fields the user has interacted with */
  readonly touchedFields: ValfuseTouchedFields<TSchema>;
  /** The defaultValues that were passed to useValfuseForm */
  readonly defaultValues: Readonly<TSchema>;
}

// ============================================================================
// Watch Types
// ============================================================================

/**
 * Callback passed to `form.watch(callback)`.
 * Called every time any field value changes.
 */
export type ValfuseWatchCallback<TSchema extends Record<string, unknown>> = (
  values: TSchema,
  info?: { name?: string; type?: string }
) => void;

/**
 * Callable type for `form.watch`:
 *
 * ```ts
 * form.watch()                          // → TSchema (all values)
 * form.watch("email")                   // → TSchema["email"]
 * form.watch(["email", "name"])         // → Array of values
 * form.watch((values, info) => void)    // → () => void  (unsubscribe)
 * ```
 */
export interface ValfuseWatchFunction<TSchema extends Record<string, unknown>> {
  (): TSchema;
  <TName extends keyof TSchema & string>(name: TName): TSchema[TName];
  (names: Array<keyof TSchema & string>): Array<TSchema[keyof TSchema]>;
  (callback: ValfuseWatchCallback<TSchema>): () => void;
}

// ============================================================================
// Field Registration Types
// ============================================================================

/** Props returned by `form.register(name)` — spread onto input element (React) */
export interface ValfuseRegisterReturn {
  name: string;
  value?: string | number | readonly string[] | undefined;
  onChange: (e: unknown) => void;  // React ChangeEvent
  onBlur: () => void;
}

/** Props returned by `form.register(name)` — for Vue v-model compatibility */
export interface ValfuseVueRegisterReturn {
  name: string;
  modelValue: unknown;
  "onUpdate:modelValue": (value: unknown) => void;
  onBlur: () => void;
}

// ============================================================================
// Control (Internal Bridge)
// ============================================================================

/**
 * Opaque control object — passed to ValfuseController.
 * Internal fields are prefixed with `_` and not part of the public API.
 */
export interface ValfuseFormControl<TSchema extends Record<string, unknown>> {
  /** @internal Current field values */
  _values: TSchema;
  /** @internal Current validation errors */
  _errors: ValfuseFormErrors<TSchema>;
  /** @internal Update a single field value */
  _updateField: <TName extends keyof TSchema & string>(
    name: TName,
    value: TSchema[TName]
  ) => void;
  /** @internal Mark a field as touched */
  _touchField: (name: string) => void;
  /** @internal Set of names of fields the user has interacted with */
  _touchedFields: ReadonlySet<keyof TSchema>;
}

// ============================================================================
// useValfuseForm Contract
// ============================================================================

/** Props passed to useValfuseForm */
export interface UseValfuseFormProps<TSchema extends Record<string, unknown>> {
  schema: ValfuseSchema;
  defaultValues: TSchema;
  mode?: ValfuseFormMode;
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";
}

/**
 * Return type of useValfuseForm — defined as interface so adapters can implement it.
 * This is the core form contract that React, Vue, and other adapters must fulfill.
 */
export interface UseValfuseFormReturn<TSchema extends Record<string, unknown>> {
  // ── Field Registration ────────────────────────────────────────────────────────

  /**
   * Registers an input field.
   * Returns props to spread onto the input element.
   */
  register: <TName extends keyof TSchema & string>(name: TName) => ValfuseRegisterReturn;

  // ── Control (for ValfuseController / Vue equivalent) ─────────────────────────

  /** Passed to ValfuseController for controlled inputs */
  control: ValfuseFormControl<TSchema>;

  // ── Form Methods ─────────────────────────────────────────────────────────────

  /**
   * Wraps form submission: validates first, then calls onValid.
   * Returns an event handler to pass to form onSubmit.
   */
  handleSubmit: (
    onValid: (values: TSchema) => void | Promise<void>
  ) => (e?: unknown) => Promise<void>;

  /** Reactive form state */
  formState: ValfuseFormState<TSchema>;

  /** Inject external errors (e.g. from API responses) */
  setErrors: (errors: Partial<Record<string, ValfuseFieldError>>) => void;

  /** Clear one, many, or all field errors */
  clearErrors: (name?: keyof TSchema | Array<keyof TSchema>) => void;

  /**
   * Programmatically set a field value.
   * Pass { shouldValidate: true } to run validation immediately.
   */
  setValue: <TName extends keyof TSchema>(
    name: TName,
    value: TSchema[TName],
    options?: { shouldValidate?: boolean }
  ) => void;

  /**
   * Manually trigger validation.
   * - No argument → validate all fields
   * - Single name → validate one field
   * - Array of names → validate those fields
   *
   * Returns true if all triggered fields are valid, false otherwise.
   */
  trigger: (name?: keyof TSchema & string | Array<keyof TSchema & string>) => boolean;

  /**
   * Watch field values:
   *
   * ```ts
   * form.watch()                           // all current values
   * form.watch("email")                    // single field value
   * form.watch(["email", "name"])          // array of values
   * const unsub = form.watch((values, info) => { ... }); // subscribe
   * unsub();                               // unsubscribe
   * ```
   */
  watch: ValfuseWatchFunction<TSchema>;

  /** Reset the form to default values (or provided partial values) */
  reset: (values?: Partial<TSchema>) => void;

  // ── Vue-specific getters (for API parity) ───────────────────────────────────

  /** Get a single field value (Vue only) */
  getValue?: <TName extends keyof TSchema>(name: TName) => TSchema[TName];

  /** Get all field values (Vue only) */
  getValues?: () => TSchema;
}