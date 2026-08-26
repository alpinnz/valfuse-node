import { computed, reactive, ref, shallowRef } from "vue";
import type { ComputedRef } from "vue";
import { validateSchema, transformValues, normalizeError } from "@valfuse-node/form";
import type {
  ValfuseFieldErrors,
  SetErrorsInput,
  ValfuseFormErrors,
  ValfuseFormControl,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseWatchCallback,
} from "@valfuse-node/form";
import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormState,
  ValfuseRegisterReturn,
} from "../types/index";

/**
 * useValfuseForm — Vue composable.
 *
 * Public API contract matches the React adapter and the form-domain
 * `UseValfuseFormReturn` interface. The two adapter-specific differences:
 *   1. `register()` returns Vue-native v-model props
 *      (`modelValue` + `onUpdate:modelValue`).
 *   2. `getValue(name)` and `getValues()` are convenience getters that
 *      the React adapter does not expose.
 *
 * Internal state uses Sets for O(1) add/delete on dirty/touched tracking,
 * but the public `formState` exposes them as Record-shaped
 * `{ [K]?: true }` to match the form contract.
 *
 * Usage:
 *   const form = useValfuseForm({ schema, defaultValues })
 *   <input v-bind="form.register('email')" />
 */
export function useValfuseForm<TFieldValues extends Record<string, unknown>>(
  options: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues> {
  const { schema, defaultValues, mode = "onSubmit", reValidateMode = "onChange" } = options;

  // ─── Internal state ────────────────────────────────────────────────────────
  const values = reactive<Record<string, unknown>>({
    ...(defaultValues as Record<string, unknown>),
  });
  // Errors are kept in a `ref` so we can replace the whole object atomically
  // on each validation run — cheaper than diffing on a reactive proxy.
  const errors = ref<ValfuseFormErrors<TFieldValues>>({});
  const isSubmitting = ref(false);
  const isSubmitted = ref(false);
  const isSubmitSuccessful = ref(false);
  const submitCount = ref(0);
  // shallowRef avoids Vue's UnwrapRefSimple<keyof TSchema> quirks for Set/Map.
  // We replace the whole Set on each add/delete so the ref triggers reactivity.
  const dirtySet = shallowRef(new Set<string>());
  const touchedSet = shallowRef(new Set<string>());

  // ─── Watch subscriptions ──────────────────────────────────────────────────
  // Per-field subscriptions (form.watch("email", cb)) and global subscriptions
  // (form.watch(cb)) are tracked separately so the multi-overload dispatch
  // can fire the right set on each change.
  const fieldWatchers = new Map<string, Set<(v: unknown) => void>>();
  const globalWatchers = new Set<ValfuseWatchCallback<TFieldValues>>();

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function runValidation(): ValfuseFormErrors<TFieldValues> {
    const typed = transformValues(schema, values as Record<string, unknown>);
    return validateSchema(schema, typed) as ValfuseFormErrors<TFieldValues>;
  }

  function setToRecord<T>(set: Set<string>): T {
    const out: Record<string, true> = {};
    for (const k of set) out[k] = true;
    return out as T;
  }

  function markDirty(key: string, newValue: unknown): void {
    const dirty = new Set(dirtySet.value);
    if (newValue !== (defaultValues as Record<string, unknown>)[key]) {
      dirty.add(key);
    } else {
      dirty.delete(key);
    }
    dirtySet.value = dirty;
  }

  function markTouched(key: string): void {
    const touched = new Set(touchedSet.value);
    touched.add(key);
    touchedSet.value = touched;
  }

  function notifyWatchers(name: string, value: unknown): void {
    fieldWatchers.get(name)?.forEach((cb) => cb(value));
    if (globalWatchers.size > 0) {
      const info = { name, type: "change" as const };
      globalWatchers.forEach((cb) => cb(values as TFieldValues, info));
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  function register(name: keyof TFieldValues & string): ValfuseRegisterReturn {
    const key = String(name);
    return {
      name: key,
      modelValue: values[key],
      "onUpdate:modelValue": (value: unknown) => {
        values[key] = value;
        markDirty(key, value);
        notifyWatchers(key, value);
        if (mode === "onChange" || (isSubmitted.value && reValidateMode === "onChange")) {
          errors.value = runValidation();
        }
      },
      onBlur: () => {
        markTouched(key);
        if (mode === "onBlur" || (isSubmitted.value && reValidateMode === "onBlur")) {
          errors.value = runValidation();
        }
      },
    };
  }

  async function runSubmit(fn: (values: TFieldValues) => Promise<void> | void): Promise<void> {
    isSubmitted.value = true;
    submitCount.value += 1;
    const validationErrors = runValidation();
    if (Object.keys(validationErrors).length > 0) {
      errors.value = validationErrors;
      isSubmitSuccessful.value = false;
      return;
    }
    errors.value = {};
    isSubmitting.value = true;
    try {
      const typed = transformValues(schema, values as Record<string, unknown>) as TFieldValues;
      await fn(typed);
      isSubmitSuccessful.value = true;
    } catch {
      isSubmitSuccessful.value = false;
      throw new Error("Submit handler failed");
    } finally {
      isSubmitting.value = false;
    }
  }

  // The form's contract signature returns `(e?: unknown) => Promise<void>`,
  // but the Vue adapter takes a real DOM Event so it can preventDefault.
  function handleSubmit(
    fn: (values: TFieldValues) => Promise<void> | void
  ): (e: Event) => Promise<void> {
    return async (e: Event) => {
      e.preventDefault?.();
      await runSubmit(fn);
    };
  }

  function setErrors(input: SetErrorsInput): void {
    // Normalize any string errors to ValfuseError so formState.errors is consistent
    const normalized: ValfuseFormErrors<TFieldValues> = {};
    for (const [k, v] of Object.entries(input as ValfuseFieldErrors)) {
      if (v !== undefined) normalized[k as keyof TFieldValues] = normalizeError(v);
    }
    errors.value = { ...errors.value, ...normalized };
  }

  function clearErrors(fields?: Array<keyof TFieldValues & string>): void {
    if (!fields) {
      errors.value = {};
      return;
    }
    const next = { ...errors.value };
    for (const f of fields) delete next[f];
    errors.value = next;
  }

  function setValue(name: keyof TFieldValues & string, value: unknown): void {
    const key = String(name);
    values[key] = value;
    markDirty(key, value);
    notifyWatchers(key, value);
  }

  function getValue(name: keyof TFieldValues & string): unknown {
    return values[String(name)];
  }

  function getValues(): TFieldValues {
    return { ...values } as TFieldValues;
  }

  function trigger(
    name?: (keyof TFieldValues & string) | Array<keyof TFieldValues & string>
  ): boolean {
    const validationErrors = runValidation();
    const fieldsToValidate: string[] =
      name === undefined
        ? Object.keys(schema)
        : Array.isArray(name)
          ? (name as string[])
          : [name as string];

    let allValid = true;
    const next: ValfuseFormErrors<TFieldValues> = { ...errors.value };
    let changed = false;

    for (const f of fieldsToValidate) {
      const err = validationErrors[f as keyof TFieldValues];
      if (err) {
        allValid = false;
        const prev = next[f as keyof TFieldValues];
        if (
          !prev ||
          prev.message !== err.message ||
          prev.type !== err.type ||
          prev.code !== err.code
        ) {
          next[f as keyof TFieldValues] = err;
          changed = true;
        }
      } else {
        if (f in next) {
          delete next[f as keyof TFieldValues];
          changed = true;
        }
      }
    }

    if (changed) errors.value = next;
    return allValid;
  }

  function reset(overrides?: Partial<TFieldValues>): void {
    const next = (overrides ?? defaultValues) as Record<string, unknown>;
    for (const k of Object.keys(values)) values[k] = next[k] ?? undefined;
    errors.value = {};
    isSubmitted.value = false;
    isSubmitSuccessful.value = false;
    submitCount.value = 0;
    dirtySet.value = new Set();
    touchedSet.value = new Set();
  }

  // ─── Multi-overload watch ────────────────────────────────────────────────
  // The function dispatches on the runtime type of its argument:
  //   watch()                            → all current values (snapshot)
  //   watch("email")                     → single value
  //   watch(["email", "name"])           → array of values
  //   watch((values, info) => { ... })   → subscribe to all changes, returns unsubscribe
  //   watch("email", cb)                 → subscribe to one field, returns unsubscribe
  //         (legacy form — kept for backward compat; prefer the callback form)
  type WatchArg =
    | undefined
    | (keyof TFieldValues & string)
    | Array<keyof TFieldValues & string>
    | ValfuseWatchCallback<TFieldValues>
    | ((value: unknown) => void);

  function watch(arg: WatchArg, legacyCb?: (value: unknown) => void): unknown {
    // Legacy: watch(name, cb) — per-field subscription
    if (legacyCb !== undefined) {
      if (typeof arg !== "string" && !Array.isArray(arg)) {
        throw new TypeError("watch(name, cb): name must be a field name string");
      }
      const name = String(arg);
      let bucket = fieldWatchers.get(name);
      if (!bucket) {
        bucket = new Set();
        fieldWatchers.set(name, bucket);
      }
      bucket.add(legacyCb);
      return () => bucket!.delete(legacyCb);
    }

    // watch(callback) — global subscription
    if (typeof arg === "function") {
      const cb = arg as ValfuseWatchCallback<TFieldValues>;
      globalWatchers.add(cb);
      return () => {
        globalWatchers.delete(cb);
      };
    }

    // watch([names...]) — array of current values
    if (Array.isArray(arg)) {
      return (arg as Array<keyof TFieldValues & string>).map((n) => values[String(n)]);
    }

    // watch("email") — single value
    if (typeof arg === "string") {
      return values[arg];
    }

    // watch() — all values (snapshot)
    return { ...values } as TFieldValues;
  }

  // ─── Control (for ValfuseController / Vue equivalent) ─────────────────────
  // Same shape as the React adapter's control object so a future
  // <ValfuseController> Vue component can accept it identically.
  //
  // We use `reactive` with getters for the snapshot-like fields so consumers
  // always read the latest value. `_values` is the same reactive proxy used
  // internally, so deep mutations are tracked.
  const control = reactive<ValfuseFormControl<TFieldValues>>({
    _values: values as TFieldValues,
    get _errors(): ValfuseFormErrors<TFieldValues> {
      return errors.value;
    },
    get _touchedFields(): ReadonlySet<keyof TFieldValues> {
      return touchedSet.value as ReadonlySet<keyof TFieldValues>;
    },
    _updateField: (name, value) => {
      const key = String(name);
      values[key] = value;
      markDirty(key, value);
      notifyWatchers(key, value);
    },
    _touchField: (name) => {
      markTouched(String(name));
    },
  }) as ValfuseFormControl<TFieldValues>;

  // ─── Computed projections for the public formState ───────────────────────
  // Computed refs are used for the Set→Record conversions — they memoize
  // until the underlying Set ref changes.
  const dirtyFieldsRecord: ComputedRef<ValfuseDirtyFields<TFieldValues>> = computed(() =>
    setToRecord<ValfuseDirtyFields<TFieldValues>>(dirtySet.value)
  );
  const touchedFieldsRecord: ComputedRef<ValfuseTouchedFields<TFieldValues>> = computed(() =>
    setToRecord<ValfuseTouchedFields<TFieldValues>>(touchedSet.value)
  );
  const isDirtyComputed: ComputedRef<boolean> = computed(() => dirtySet.value.size > 0);
  const isValidComputed: ComputedRef<boolean> = computed(
    () => Object.keys(errors.value).length === 0
  );

  // ─── Reactive formState ──────────────────────────────────────────────────
  // Getters expose the latest values; Vue tracks each read and re-renders
  // consumers when the underlying refs change.
  const formState = reactive({
    get errors() {
      return errors.value;
    },
    get isSubmitting() {
      return isSubmitting.value;
    },
    get isSubmitted() {
      return isSubmitted.value;
    },
    get isSubmitSuccessful() {
      return isSubmitSuccessful.value;
    },
    get submitCount() {
      return submitCount.value;
    },
    get isDirty() {
      return isDirtyComputed.value;
    },
    get isValid() {
      return isValidComputed.value;
    },
    get dirtyFields() {
      return dirtyFieldsRecord.value;
    },
    get touchedFields() {
      return touchedFieldsRecord.value;
    },
    get defaultValues() {
      return { ...(defaultValues as Record<string, unknown>) } as TFieldValues;
    },
  }) as ValfuseFormState<TFieldValues>;

  return {
    formState,
    control,
    register,
    handleSubmit,
    setErrors,
    clearErrors,
    setValue,
    trigger,
    getValue,
    getValues,
    reset,
    watch: watch as UseValfuseFormReturn<TFieldValues>["watch"],
  };
}
