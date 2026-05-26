import { useState, useRef, useCallback, useEffect, useMemo, type FormEvent } from "react";
import { validateSchema, normalizeError } from "@valfuse-node/core";
import type { ValfuseFieldErrors } from "@valfuse-node/core";

import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormErrors,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseFormControl,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
} from "./types";
import {
  shouldValidateOnChange,
  shouldValidateOnBlur,
  buildFieldError,
  mapToFieldErrors,
} from "./helpers";

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
  const validateField = useCallback(
    (name: string, currentValues: Record<string, unknown>) => {
      if (!schema[name]) return;
      const raw = validateSchema({ [name]: schema[name] }, currentValues);
      const error = buildFieldError(raw, name);
      setErrorsState((prev) => {
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
      setErrorsState((prev) => {
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
        const newValue = e.target.value as TFieldValues[TName];
        const updated = { ...valuesRef.current, [name]: newValue };
        lastChangedFieldRef.current = name;
        setValues(updated as TFieldValues);

        if (shouldValidateOnChange(mode, touchedFieldsRef.current.has(name))) {
          validateField(name, updated as Record<string, unknown>);
        } else {
          clearStaleFieldError(name);
        }
      },
      onBlur: () => {
        setTouchedFields((prev) => new Set([...prev, name]));
        if (shouldValidateOnBlur(mode)) {
          validateField(name, valuesRef.current as Record<string, unknown>);
        }
      },
    }),
    [mode, validateField, clearStaleFieldError]
  );

  // ── handleSubmit ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (onValid: (values: TFieldValues) => void | Promise<void>) =>
      async (e?: FormEvent | { preventDefault?: () => void }) => {
        e?.preventDefault?.();

        const currentValues = valuesRef.current;
        const schemaErrors = validateSchema(schema, currentValues as Record<string, unknown>);

        setSubmitCount((c) => c + 1);
        setIsSubmitted(true);

        if (Object.keys(schemaErrors).length > 0) {
          setErrorsState(mapToFieldErrors<TFieldValues>(schemaErrors));
          setIsSubmitSuccessful(false);
          return;
        }

        setErrorsState({});
        setIsSubmitting(true);
        try {
          await onValid(currentValues);
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
      setErrorsState((prev) => {
        const next = { ...prev };
        for (const [fieldName, rawError] of Object.entries(fieldErrors)) {
          if (rawError === undefined) continue;
          const normalized = normalizeError(rawError);
          next[fieldName as keyof TFieldValues] = {
            message: normalized.message,
            type: normalized.type ?? "manual",
            ...(normalized.code !== undefined && { code: normalized.code }),
            ...(normalized.metadata !== undefined && { metadata: normalized.metadata }),
          };
        }
        return next;
      });
    },
    []
  );

  // ── clearErrors ────────────────────────────────────────────────────────────
  const clearErrors = useCallback(
    (name?: keyof TFieldValues | Array<keyof TFieldValues>) => {
      if (name === undefined) {
        setErrorsState({});
        return;
      }
      const fields = Array.isArray(name) ? name : [name];
      setErrorsState((prev) => {
        const next = { ...prev };
        for (const n of fields) delete next[n];
        return next;
      });
    },
    []
  );

  // ── trigger ────────────────────────────────────────────────────────────────
  const trigger = useCallback(
    (name?: keyof TFieldValues & string | Array<keyof TFieldValues & string>): boolean => {
      const current = valuesRef.current as Record<string, unknown>;

      const fieldsToValidate: string[] =
        name === undefined
          ? Object.keys(schema)
          : Array.isArray(name)
          ? (name as string[])
          : [name as string];

      let allValid = true;
      const nextErrors: ValfuseFormErrors<TFieldValues> = { ...errorsRef.current };

      for (const field of fieldsToValidate) {
        if (!schema[field]) continue;
        const raw = validateSchema({ [field]: schema[field] }, current);
        const error = buildFieldError(raw, field);
        if (error) {
          allValid = false;
          nextErrors[field as keyof TFieldValues] = error;
        } else {
          delete nextErrors[field as keyof TFieldValues];
        }
      }

      setErrorsState(nextErrors);
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
      const updated = { ...valuesRef.current, [name]: value };
      lastChangedFieldRef.current = name as string;
      setValues(updated as TFieldValues);

      if (options?.shouldValidate) {
        const field = name as string;
        if (!schema[field]) return;
        const raw = validateSchema({ [field]: schema[field] }, updated as Record<string, unknown>);
        const error = buildFieldError(raw, field);
        setErrorsState((prev) => {
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
  // _updateField and _touchField read mode/touchedFields via refs so they don't
  // force control to be recreated on every blur or mode change.
  const control = useMemo<ValfuseFormControl<TFieldValues>>(
    () => ({
      _values: values,
      _errors: errors,
      _updateField: <TName extends keyof TFieldValues & string>(
        name: TName,
        value: TFieldValues[TName]
      ) => {
        const updated = { ...valuesRef.current, [name]: value };
        lastChangedFieldRef.current = name;
        setValues(updated as TFieldValues);
        if (shouldValidateOnChange(modeRef.current, touchedFieldsRef.current.has(name))) {
          validateField(name, updated as Record<string, unknown>);
        }
      },
      _touchField: (name: string) => {
        setTouchedFields((prev) => new Set([...prev, name]));
        if (shouldValidateOnBlur(modeRef.current)) {
          validateField(name, valuesRef.current as Record<string, unknown>);
        }
      },
      _touchedFields: touchedFields,
    }),
    // modeRef/touchedFieldsRef used inside so mode & touchedFields (for functions)
    // are NOT deps. Only data that ValfuseController reads needs to be deps.
    [values, errors, touchedFields, validateField]
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

  // isValid = schema passes for current values AND no errors in state
  // (catches both schema failures and external API errors from setErrors).
  const isSchemaValid = useMemo(
    () => Object.keys(validateSchema(schema, values as Record<string, unknown>)).length === 0,
    [schema, values]
  );
  const isValid = isSchemaValid && Object.keys(errors).length === 0;

  return {
    register,
    control,
    handleSubmit,
    formState: {
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
    },
    setErrors,
    clearErrors,
    setValue,
    trigger,
    watch,
    reset,
  };
}

// ─── Re-export public types ───────────────────────────────────────────────────
export type { ValfuseFieldError, UseValfuseFormReturn } from "./types";

