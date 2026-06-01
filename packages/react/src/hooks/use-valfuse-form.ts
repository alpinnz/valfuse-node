import { useState, useRef, useCallback, useEffect, useMemo, type FormEvent } from "react";
import { validateSchema, normalizeError, transformValues } from "@valfuse-node/form";
import type { ValfuseFieldErrors } from "@valfuse-node/form";

import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormErrors,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseFormControl,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
} from "../types/index";
import {
  shouldValidateOnChange,
  shouldValidateOnBlur,
  buildFieldError,
  mapToFieldErrors,
} from "../helpers/index";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useValfuseForm<TFieldValues extends Record<string, unknown>>(
  props: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues> {
  const { schema, defaultValues, mode = "onSubmit" } = props;

  // ── State ──────────────────────────────────────────────────────────────────
  const [values, setValues] = useState<TFieldValues>(() => ({ ...defaultValues }));
  const [errors, setErrorsState] = useState<ValfuseFormErrors<TFieldValues>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set());

  // ── Refs (for stable callbacks that read latest state without closing over it) ─
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // Allows register/control handlers to read the latest touchedFields without
  // declaring it as a useCallback dependency (which would recreate on every blur).
  const touchedFieldsRef = useRef(touchedFields);
  touchedFieldsRef.current = touchedFields;

  // Allows control handlers to read the latest mode without being in useMemo deps.
  const modeRef = useRef(mode);
  modeRef.current = mode;

  // Allows register/control onChange handlers to always read the latest schema
  // (including transform functions) without being in useCallback deps.
  const schemaRef = useRef(schema);
  schemaRef.current = schema;

  // ── Watch subscriptions ───────────────────────────────────────────────────
  const watchSubscribersRef = useRef<Set<ValfuseWatchCallback<TFieldValues>>>(new Set());
  const lastChangedFieldRef = useRef<string | undefined>(undefined);

  // Notify watch subscribers whenever values change.
  useEffect(() => {
    if (watchSubscribersRef.current.size > 0) {
      const info: { name?: string; type?: string } = {
        name: lastChangedFieldRef.current,
        type: lastChangedFieldRef.current ? "change" : undefined,
      };
      watchSubscribersRef.current.forEach((cb) => cb(values, info));
    }
    lastChangedFieldRef.current = undefined;
  }, [values]);

  // ── Internal: per-field validation ────────────────────────────────────────
  // Callers are responsible for applying transforms BEFORE calling this —
  // i.e. register.onChange and control._updateField pass an already-transformed
  // `updated` object; register.onBlur and control._touchField apply the field
  // transform themselves via schemaRef before invoking this.
  const validateField = useCallback(
    (name: string, currentValues: Record<string, unknown>) => {
      if (!schema[name]) return;
      const raw = validateSchema({ [name]: schema[name] }, currentValues);
      const error = buildFieldError(raw, name);
      setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        // ① No error + field was clean before → nothing to do.
        if (!error && !(name in prev)) return prev;
        // ② Same error as before (message/type/code unchanged) → nothing to do.
        //    Prevents a re-render on every keystroke while the field stays invalid
        //    (e.g. "hel" → "hell" → "hello" all produce the same "Invalid email" error).
        const prevError = prev[name as keyof TFieldValues];
        if (
          error && prevError &&
          error.message === prevError.message &&
          error.type    === prevError.type &&
          error.code    === prevError.code
        ) return prev;
        const next = { ...prev };
        if (error) {
          next[name as keyof TFieldValues] = error;
        } else {
          delete next[name as keyof TFieldValues];
        }
        return next;
      });
    },
    [schema]
  );

  // ── Internal: clear a single stale field error (e.g. API error on user edit) ─
  const clearStaleFieldError = useCallback(
    (name: keyof TFieldValues) => {
      setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        if (!(name in prev)) return prev; // bail out early — no re-render
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    []
  );

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    <TName extends keyof TFieldValues & string>(name: TName) => ({
      name,
      value: valuesRef.current[name] as string | number | readonly string[] | undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const rawValue = e.target.value as TFieldValues[TName];
        // Apply field-level transform before storing — read via schemaRef to avoid stale closure.
        const fieldTransform = schemaRef.current[name]?.transform;
        const newValue = fieldTransform ? (fieldTransform(rawValue) as TFieldValues[TName]) : rawValue;
        const updated = { ...valuesRef.current, [name]: newValue };
        lastChangedFieldRef.current = name;
        setValues(updated as TFieldValues);

        if (shouldValidateOnChange(modeRef.current, touchedFieldsRef.current.has(name))) {
          validateField(name, updated as Record<string, unknown>);
        } else {
          clearStaleFieldError(name);
        }
      },
      onBlur: () => {
        // Guard: bail out early if already touched — avoids a pointless re-render.
        // new Set(prev) copies without an intermediate array (avoids O(n) spread).
        setTouchedFields((prev) => {
          if (prev.has(name)) return prev;
          const next = new Set(prev);
          next.add(name);
          return next;
        });
        if (shouldValidateOnBlur(modeRef.current)) {
          // valuesRef.current may hold untransformed defaultValues if the user
          // hasn't typed yet — apply the field transform here so validation is
          // consistent with handleSubmit / isValid.
          const current = valuesRef.current as Record<string, unknown>;
          const fieldTransform = schemaRef.current[name]?.transform;
          const forValidation = fieldTransform
            ? { ...current, [name]: fieldTransform(current[name]) }
            : current;
          validateField(name, forValidation);
        }
      },
    }),
    // mode/touchedFields/schema read via refs — only stable deps here.
    [validateField, clearStaleFieldError]
  );

  // ── handleSubmit ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (onValid: (values: TFieldValues) => void | Promise<void>) =>
      async (e?: FormEvent | { preventDefault?: () => void }) => {
        e?.preventDefault?.();

        const currentValues = valuesRef.current;
        // Apply all field transforms before validation and before passing to onValid.
        const transformedValues = transformValues(schema, currentValues as Record<string, unknown>) as TFieldValues;
        const schemaErrors = validateSchema(schema, transformedValues as Record<string, unknown>);

        setSubmitCount((c) => c + 1);
        setIsSubmitted(true);

        if (Object.keys(schemaErrors).length > 0) {
          setErrorsState(mapToFieldErrors<TFieldValues>(schemaErrors));
          setIsSubmitSuccessful(false);
          return;
        }

        // Only clear errors if any exist — avoids a needless re-render on valid submit.
        if (Object.keys(errorsRef.current).length > 0) setErrorsState({});
        setIsSubmitting(true);
        try {
          await onValid(transformedValues);
          setIsSubmitSuccessful(true);
        } catch (err) {
          setIsSubmitSuccessful(false);
          throw err;
        } finally {
          setIsSubmitting(false);
        }
      },
    [schema]
  );

  // ── setErrors (external — e.g. API responses) ─────────────────────────────
  const setErrors = useCallback(
    (fieldErrors: ValfuseFieldErrors<Extract<keyof TFieldValues, string>>) => {
      setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        const next = { ...prev };
        let changed = false;
        for (const [fieldName, rawError] of Object.entries(fieldErrors)) {
          if (rawError === undefined) continue;
          const normalized = normalizeError(rawError);
          // Bail out if the error is already identical — avoids a needless
          // re-render when the same API error is set twice in a row.
          const prevFieldError = prev[fieldName as keyof TFieldValues];
          if (
            prevFieldError &&
            prevFieldError.message === normalized.message &&
            prevFieldError.type    === (normalized.type ?? "manual") &&
            prevFieldError.code    === normalized.code
          ) continue;
          next[fieldName as keyof TFieldValues] = {
            message: normalized.message,
            type: normalized.type ?? "manual",
            ...(normalized.code !== undefined && { code: normalized.code }),
            ...(normalized.metadata !== undefined && { metadata: normalized.metadata }),
          };
          changed = true;
        }
        return changed ? next : prev;
      });
    },
    []
  );

  // ── clearErrors ────────────────────────────────────────────────────────────
  const clearErrors = useCallback(
    (name?: keyof TFieldValues | Array<keyof TFieldValues>) => {
      if (name === undefined) {
        // Bail out when errors is already empty — avoids a needless re-render.
        if (Object.keys(errorsRef.current).length === 0) return;
        setErrorsState({});
        return;
      }
      const fields = Array.isArray(name) ? name : [name];
      setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        // Bail out early if none of the requested fields have an active error.
        const toDelete = fields.filter((k) => k in prev);
        if (toDelete.length === 0) return prev;
        const next = { ...prev };
        for (const n of toDelete) delete next[n];
        return next;
      });
    },
    []
  );

  // ── trigger ────────────────────────────────────────────────────────────────
  const trigger = useCallback(
    (name?: keyof TFieldValues & string | Array<keyof TFieldValues & string>): boolean => {
      const current = valuesRef.current as Record<string, unknown>;
      // Apply all transforms so every rule operates on clean values — consistent
      // with handleSubmit. Safe to call even if no transforms are defined.
      const transformed = transformValues(schema, current);

      const fieldsToValidate: string[] =
        name === undefined
          ? Object.keys(schema)
          : Array.isArray(name)
          ? (name as string[])
          : [name as string];

      let allValid = true;
      let changed = false;
      const prevErrors = errorsRef.current;
      const nextErrors: ValfuseFormErrors<TFieldValues> = { ...prevErrors };

      for (const field of fieldsToValidate) {
        if (!schema[field]) continue;
        const raw = validateSchema({ [field]: schema[field] }, transformed);
        const error = buildFieldError(raw, field);
        if (error) {
          allValid = false;
          // Mark changed if this field had no prior error or the message/type/code changed.
          const prev = prevErrors[field as keyof TFieldValues];
          if (!prev || prev.message !== error.message || prev.type !== error.type || prev.code !== error.code) {
            changed = true;
          }
          nextErrors[field as keyof TFieldValues] = error;
        } else {
          if (field in nextErrors) {
            changed = true;
            delete nextErrors[field as keyof TFieldValues];
          }
        }
      }

      // Only update state if errors actually changed — avoids a needless re-render
      // when trigger() is called on an already-valid form.
      if (changed) setErrorsState(nextErrors);
      return allValid;
    },
    [schema]
  );

  // ── setValue ───────────────────────────────────────────────────────────────
  const setValue = useCallback(
    <TName extends keyof TFieldValues>(
      name: TName,
      value: TFieldValues[TName],
      options?: { shouldValidate?: boolean }
    ) => {
      // Apply field-level transform before storing — read via schemaRef to avoid stale closure.
      const fieldTransform = schemaRef.current[name as string]?.transform;
      const transformedValue = fieldTransform ? (fieldTransform(value) as TFieldValues[TName]) : value;
      const updated = { ...valuesRef.current, [name]: transformedValue };
      valuesRef.current = updated as TFieldValues; // sync update so trigger() reads the new value immediately
      lastChangedFieldRef.current = name as string;
      setValues(updated as TFieldValues);

      if (options?.shouldValidate) {
        const field = name as string;
        if (!schema[field]) return;
        const raw = validateSchema({ [field]: schema[field] }, updated as Record<string, unknown>);
        const error = buildFieldError(raw, field);
        setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
          if (!error && !(field in prev)) return prev;
          const prevError = prev[name as keyof TFieldValues];
          if (
            error && prevError &&
            error.message === prevError.message &&
            error.type    === prevError.type &&
            error.code    === prevError.code
          ) return prev;
          const next = { ...prev };
          if (error) {
            next[name as keyof TFieldValues] = error;
          } else {
            delete next[name as keyof TFieldValues];
          }
          return next;
        });
      } else {
        // Auto-clear any stale error (e.g. API error) so isValid reflects the edit immediately.
        clearStaleFieldError(name);
      }
    },
    [schema, clearStaleFieldError]
  );

  // ── watch ──────────────────────────────────────────────────────────────────
  const watch = useCallback(
    (nameOrNamesOrCallback?: unknown) => {
      if (typeof nameOrNamesOrCallback === "function") {
        const cb = nameOrNamesOrCallback as ValfuseWatchCallback<TFieldValues>;
        watchSubscribersRef.current.add(cb);
        return () => watchSubscribersRef.current.delete(cb);
      }
      if (Array.isArray(nameOrNamesOrCallback)) {
        return nameOrNamesOrCallback.map((n) => valuesRef.current[n as keyof TFieldValues]);
      }
      if (typeof nameOrNamesOrCallback === "string") {
        return valuesRef.current[nameOrNamesOrCallback as keyof TFieldValues];
      }
      return valuesRef.current;
    },
    []
  ) as ValfuseWatchFunction<TFieldValues>;

  // ── reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(
    (newValues?: Partial<TFieldValues>) => {
      setValues({ ...defaultValues, ...newValues } as TFieldValues);
      setErrorsState({});
      setTouchedFields(new Set());
      setIsSubmitted(false);
      setIsSubmitSuccessful(false);
      setSubmitCount(0);
    },
    [defaultValues]
  );

  // ── control (bridge to ValfuseController) ─────────────────────────────────
  // Extracted as stable useCallbacks so ValfuseController (and any React.memo'd
  // children it passes them to) won't see new function references on every
  // value / error / touch change. They only recreate when the schema changes
  // (via validateField dep), which is rare in practice.
  const _updateField = useCallback(
    <TName extends keyof TFieldValues & string>(name: TName, value: TFieldValues[TName]) => {
      // Apply field-level transform — read via schemaRef to avoid stale closure.
      const fieldTransform = schemaRef.current[name]?.transform;
      const transformedValue = fieldTransform ? (fieldTransform(value) as TFieldValues[TName]) : value;
      const updated = { ...valuesRef.current, [name]: transformedValue };
      lastChangedFieldRef.current = name;
      setValues(updated as TFieldValues);
      if (shouldValidateOnChange(modeRef.current, touchedFieldsRef.current.has(name))) {
        validateField(name, updated as Record<string, unknown>);
      } else {
        // Mirror register.onChange: clear any stale API error when not running
        // full validation, so isValid stays accurate after a programmatic update.
        clearStaleFieldError(name);
      }
    },
    // schema/mode/touchedFields/values read via refs.
    [validateField, clearStaleFieldError]
  );

  const _touchField = useCallback(
    (name: string) => {
      // Guard: bail out early if already touched — avoids a pointless re-render.
      // new Set(prev) copies without an intermediate array (avoids O(n) spread).
      setTouchedFields((prev) => {
        if (prev.has(name)) return prev;
        const next = new Set(prev);
        next.add(name);
        return next;
      });
      if (shouldValidateOnBlur(modeRef.current)) {
        // Apply field transform in case defaultValues haven't been through onChange yet.
        const current = valuesRef.current as Record<string, unknown>;
        const fieldTransform = schemaRef.current[name]?.transform;
        const forValidation = fieldTransform
          ? { ...current, [name]: fieldTransform(current[name]) }
          : current;
        validateField(name, forValidation);
      }
    },
    // schema/mode/values read via refs — only validateField is a dep.
    [validateField]
  );

  // control exposes reactive data (_values, _errors, _touchedFields) plus the
  // stable callbacks above. Deps are limited to what ValfuseController reads reactively.
  const control = useMemo<ValfuseFormControl<TFieldValues>>(
    () => ({
      _values: values,
      _errors: errors,
      _updateField,
      _touchField,
      _touchedFields: touchedFields,
    }),
    [values, errors, touchedFields, _updateField, _touchField]
  );

  // ── Derived formState ──────────────────────────────────────────────────────
  const isDirty = useMemo(
    () => Object.keys(defaultValues).some(
      (key) => values[key as keyof TFieldValues] !== defaultValues[key as keyof TFieldValues]
    ),
    [values, defaultValues]
  );

  const dirtyFields = useMemo(
    () => Object.keys(defaultValues).reduce<ValfuseDirtyFields<TFieldValues>>(
      (acc, key) => {
        const k = key as keyof TFieldValues;
        if (values[k] !== defaultValues[k]) acc[k] = true;
        return acc;
      },
      {}
    ),
    [values, defaultValues]
  );

  const touchedFieldsRecord = useMemo(
    () => Array.from(touchedFields).reduce<ValfuseTouchedFields<TFieldValues>>(
      (acc, key) => {
        acc[key as keyof TFieldValues] = true;
        return acc;
      },
      {}
    ),
    [touchedFields]
  );

  // isValid = no active errors in state AND schema passes for current (transformed) values.
  //
  // Fast path: if errors state already has entries (e.g. from validateField or setErrors)
  // skip the full schema re-validation to avoid running transformValues + validateSchema twice
  // in the same render cycle as validateField already did the work.
  //
  // ⚠️ Performance note: schema and defaultValues should be defined outside the component
  // (or wrapped in useMemo) to keep these deps stable across renders.
  const isValid = useMemo(() => {
    if (Object.keys(errors).length > 0) return false;
    const transformed = transformValues(schema, values as Record<string, unknown>);
    return Object.keys(validateSchema(schema, transformed)).length === 0;
  }, [schema, values, errors]);

  // formState is memoized so consumers who spread it into props or use it in
  // useEffect deps get a stable reference — only changes when a field inside changes.
  const formState = useMemo(() => ({
    errors,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    submitCount,
    isDirty,
    isValid,
    dirtyFields,
    touchedFields: touchedFieldsRecord,
    defaultValues,
  }), [errors, isSubmitting, isSubmitted, isSubmitSuccessful, submitCount, isDirty, isValid, dirtyFields, touchedFieldsRecord, defaultValues]);

  return {
    register,
    control,
    handleSubmit,
    formState,
    setErrors,
    clearErrors,
    setValue,
    trigger,
    watch,
    reset,
  };
}

// ─── Re-export public types ───────────────────────────────────────────────────
export type { ValfuseFieldError, UseValfuseFormReturn } from "../types/index";

