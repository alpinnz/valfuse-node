import { ref, reactive, shallowRef } from "vue";
import { validateSchema, transformValues, normalizeError } from "@valfuse-node/form";
import type { ValfuseSchema, ValfuseError, ValfuseFieldErrors, SetErrorsInput } from "@valfuse-node/form";
import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormState,
  ValfuseRegisterReturn,
} from "../types/index";

/**
 * useValfuseForm — Vue composable.
 * Same public API contract as the React adapter.
 *
 * Usage:
 *   const form = useValfuseForm({ schema, defaultValues })
 *   <input v-bind="form.register('email')" />
 */
export function useValfuseForm<TSchema extends ValfuseSchema>(
  options: UseValfuseFormProps<TSchema>
): UseValfuseFormReturn<TSchema> {
  const { schema, defaultValues, mode = "onSubmit", reValidateMode = "onChange" } = options;

  // ─── Internal state ────────────────────────────────────────────────────────
  const values = reactive<Record<string, unknown>>(
    { ...(defaultValues as Record<string, unknown>) }
  );
  // errors is always stored as ValfuseError — normalized in setErrors and runValidation
  const errors = ref<Partial<Record<string, ValfuseError>>>({});
  const isSubmitting = ref(false);
  const isSubmitted = ref(false);
  // shallowRef<Set<string>> avoids Vue's UnwrapRefSimple<keyof TSchema> issues
  const dirtySet = shallowRef(new Set<string>());
  const touchedSet = shallowRef(new Set<string>());
  const watchers = new Map<string, Set<(v: unknown) => void>>();

  // ─── Helpers ───────────────────────────────────────────────────────────────
  function isValid(): boolean {
    return Object.keys(errors.value).length === 0;
  }

  function runValidation(): Partial<Record<string, ValfuseError>> {
    const typed = transformValues(schema, values as Record<string, unknown>);
    return validateSchema(schema, typed);
  }

  function notifyWatchers(name: string, value: unknown): void {
    watchers.get(name)?.forEach((cb) => cb(value));
  }

  // ─── Public API ────────────────────────────────────────────────────────────
  function register(name: keyof TSchema): ValfuseRegisterReturn {
    const key = String(name);
    return {
      name: key,
      modelValue: values[key],
      "onUpdate:modelValue": (value: unknown) => {
        values[key] = value;
        const dirty = new Set(dirtySet.value);
        if (value !== (defaultValues as Record<string, unknown>)[key]) {
          dirty.add(key);
        } else {
          dirty.delete(key);
        }
        dirtySet.value = dirty;
        notifyWatchers(key, value);
        if (mode === "onChange" || (isSubmitted.value && reValidateMode === "onChange")) {
          errors.value = runValidation();
        }
      },
      onBlur: () => {
        const touched = new Set(touchedSet.value);
        touched.add(key);
        touchedSet.value = touched;
        if (mode === "onBlur" || (isSubmitted.value && reValidateMode === "onBlur")) {
          errors.value = runValidation();
        }
      },
    };
  }

  function handleSubmit(fn: (values: Record<string, unknown>) => Promise<void> | void) {
    return async (e: Event) => {
      e.preventDefault();
      isSubmitted.value = true;
      const validationErrors = runValidation();
      if (Object.keys(validationErrors).length > 0) {
        errors.value = validationErrors;
        return;
      }
      errors.value = {};
      isSubmitting.value = true;
      try {
        const typed = transformValues(schema, values as Record<string, unknown>);
        await fn(typed as Record<string, unknown>);
      } finally {
        isSubmitting.value = false;
      }
    };
  }

  function setErrors(input: SetErrorsInput): void {
    // Normalize any string errors to ValfuseError so formState.errors is always consistent
    const normalized: Partial<Record<string, ValfuseError>> = {};
    for (const [k, v] of Object.entries(input as ValfuseFieldErrors)) {
      if (v !== undefined) normalized[k] = normalizeError(v);
    }
    errors.value = { ...errors.value, ...normalized };
  }

  function clearErrors(fields?: (keyof TSchema)[]): void {
    if (!fields) { errors.value = {}; return; }
    const next = { ...errors.value };
    for (const f of fields) delete next[String(f)];
    errors.value = next;
  }

  function setValue(name: keyof TSchema, value: unknown): void {
    values[String(name)] = value;
    notifyWatchers(String(name), value);
  }

  function getValue(name: keyof TSchema): unknown {
    return values[String(name)];
  }

  function getValues(): Record<string, unknown> {
    return { ...values };
  }

  function reset(overrides?: Partial<Record<keyof TSchema, unknown>>): void {
    const next = (overrides ?? defaultValues) as Record<string, unknown>;
    for (const k of Object.keys(values)) values[k] = next[k] ?? undefined;
    errors.value = {};
    isSubmitted.value = false;
    dirtySet.value = new Set();
    touchedSet.value = new Set();
  }

  function watch(name: keyof TSchema, cb: (value: unknown) => void): () => void {
    const key = String(name);
    if (!watchers.has(key)) watchers.set(key, new Set());
    watchers.get(key)!.add(cb);
    return () => watchers.get(key)?.delete(cb);
  }

  return {
    formState: reactive({
      get errors() { return errors.value; },
      get isSubmitting() { return isSubmitting.value; },
      get isSubmitted() { return isSubmitted.value; },
      get isValid() { return isValid(); },
      get dirtyFields() { return dirtySet.value as unknown as Set<keyof TSchema>; },
      get touchedFields() { return touchedSet.value as unknown as Set<keyof TSchema>; },
    }) as ValfuseFormState<TSchema>,
    register,
    handleSubmit,
    setErrors,
    clearErrors,
    setValue,
    getValue,
    getValues,
    reset,
    watch,
  };
}
