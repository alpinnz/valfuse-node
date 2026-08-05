import type {
  ValfuseSchema,
  SetErrorsInput,
  ValfuseFormErrors,
  ValfuseFormControl,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseWatchFunction,
} from "@valfuse-node/form";

/**
 * Vue-specific watch function with the additional legacy `watch(name, callback)`
 * form. Mirrors `ValfuseWatchFunction` 1:1 plus:
 *
 * ```ts
 * form.watch("email", (value) => { ... })   // → () => void  (unsubscribe)
 * ```
 *
 * The legacy form is kept for backward compat with pre-contract code; new code
 * should prefer `form.watch((values, info) => { ... })` so the callback
 * signature matches the form-domain `ValfuseWatchCallback`.
 */
export interface ValfuseVueWatchFunction<
  TFieldValues extends Record<string, unknown>,
> extends ValfuseWatchFunction<TFieldValues> {
  (name: keyof TFieldValues & string, callback: (value: unknown) => void): () => void;
}

/**
 * Validation trigger mode.
 *
 * Mirrors the React adapter and the form-domain contract exactly.
 * `onTouched` is supported by React; for Vue we currently support the same
 * three core modes. Extend when needed.
 */
export type ValfuseFormMode = "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all";

/**
 * Options for useValfuseForm.
 *
 * `TFieldValues` is the **values shape** (not the schema shape) — inferred
 * from `defaultValues`. This matches the React adapter and the form-domain
 * contract, so a consumer can swap frameworks without rewriting the call site.
 */
export interface UseValfuseFormProps<TFieldValues extends Record<string, unknown>> {
  schema: ValfuseSchema;
  defaultValues: TFieldValues;
  mode?: ValfuseFormMode;
  /** Mode used to re-validate a field after the first submit attempt. */
  reValidateMode?: ValfuseFormMode;
}

/**
 * Reactive form state exposed by useValfuseForm.
 *
 * Shape mirrors the form-domain `ValfuseFormState` exactly so a consumer can
 * swap adapters without re-learning the API. The `readonly` modifiers are
 * documentation — Vue cannot enforce them at runtime on a reactive proxy,
 * but consumers should treat the state as read-only.
 */
export interface ValfuseFormState<TFieldValues extends Record<string, unknown>> {
  readonly errors: ValfuseFormErrors<TFieldValues>;
  readonly isSubmitting: boolean;
  readonly isSubmitted: boolean;
  readonly isSubmitSuccessful: boolean;
  readonly submitCount: number;
  readonly isDirty: boolean;
  readonly isValid: boolean;
  readonly dirtyFields: ValfuseDirtyFields<TFieldValues>;
  readonly touchedFields: ValfuseTouchedFields<TFieldValues>;
  readonly defaultValues: Readonly<TFieldValues>;
}

/**
 * Props returned by `form.register(name)` for the Vue adapter.
 *
 * Shape is Vue-native (v-model): spread the result onto an element with
 * `v-bind` and `v-model` will work out of the box. This is intentionally
 * different from the React adapter's `ValfuseRegisterReturn` — Vue's
 * idiomatic binding shape uses `modelValue` + `onUpdate:modelValue`.
 */
export interface ValfuseRegisterReturn {
  name: string;
  modelValue: unknown;
  "onUpdate:modelValue": (value: unknown) => void;
  onBlur: () => void;
}

/**
 * Return type of useValfuseForm.
 *
 * Mirrors the form-domain `UseValfuseFormReturn` contract, with two
 * adapter-specific extensions:
 *  - `register` returns the Vue-native `ValfuseRegisterReturn` (v-model shape).
 *  - `getValue` and `getValues` are convenience getters not present in React.
 *
 * All other members match the React contract 1:1. In particular, `control`
 * is the same shape used by React's `<ValfuseController>` — a future
 * Vue equivalent component will accept it identically.
 */
export interface UseValfuseFormReturn<TFieldValues extends Record<string, unknown>> {
  formState: ValfuseFormState<TFieldValues>;
  control: ValfuseFormControl<TFieldValues>;
  register: (name: keyof TFieldValues & string) => ValfuseRegisterReturn;
  handleSubmit: (fn: (values: TFieldValues) => Promise<void> | void) => (e: Event) => Promise<void>;
  setErrors: (errors: SetErrorsInput) => void;
  clearErrors: (fields?: Array<keyof TFieldValues & string>) => void;
  setValue: (name: keyof TFieldValues & string, value: unknown) => void;
  trigger: (name?: (keyof TFieldValues & string) | Array<keyof TFieldValues & string>) => boolean;
  watch: ValfuseVueWatchFunction<TFieldValues>;
  reset: (values?: Partial<TFieldValues>) => void;
  /** Vue-specific extension: read a single field value. */
  getValue: (name: keyof TFieldValues & string) => unknown;
  /** Vue-specific extension: read all field values. */
  getValues: () => TFieldValues;
}
