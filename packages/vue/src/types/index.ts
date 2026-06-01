import type { ValfuseSchema, ValfuseError, SetErrorsInput } from "@valfuse-node/form";

/**
 * Validation trigger mode — same contract as React adapter.
 */
export type ValfuseFormMode = "onSubmit" | "onChange" | "onBlur" | "all";

/**
 * Options for useValfuseForm.
 * Mirror of React adapter — same public contract, Vue-native implementation.
 */
export interface UseValfuseFormProps<TSchema extends ValfuseSchema> {
  schema: TSchema;
  defaultValues: { [K in keyof TSchema]?: unknown };
  mode?: ValfuseFormMode;
  reValidateMode?: ValfuseFormMode;
}

/**
 * State exposed by useValfuseForm.
 * errors is always a normalized ValfuseError object — never a raw string.
 */
export interface ValfuseFormState<TSchema extends ValfuseSchema> {
  errors: Partial<Record<string, ValfuseError>>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  dirtyFields: Set<keyof TSchema>;
  touchedFields: Set<keyof TSchema>;
}

/**
 * Return type of useValfuseForm.
 */
export interface UseValfuseFormReturn<TSchema extends ValfuseSchema> {
  formState: ValfuseFormState<TSchema>;
  register: (name: keyof TSchema) => ValfuseRegisterReturn;
  handleSubmit: (fn: (values: Record<string, unknown>) => Promise<void> | void) => (e: Event) => void;
  setErrors: (errors: SetErrorsInput) => void;
  clearErrors: (fields?: (keyof TSchema)[]) => void;
  setValue: (name: keyof TSchema, value: unknown) => void;
  getValue: (name: keyof TSchema) => unknown;
  getValues: () => Record<string, unknown>;
  reset: (values?: Partial<Record<keyof TSchema, unknown>>) => void;
  watch: (name: keyof TSchema, cb: (value: unknown) => void) => () => void;
}

export interface ValfuseRegisterReturn {
  name: string;
  modelValue: unknown;
  "onUpdate:modelValue": (value: unknown) => void;
  onBlur: () => void;
}


