import { useState, useRef, useCallback, type FormEvent } from "react";
import { validateSchema, normalizeError } from "@valfuse-node/core";
import type { ValfuseFieldErrors } from "@valfuse-node/core";

import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFieldError,
  ValfuseFormErrors,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseFormControl,
} from "./types";

// ─── Internal helpers ─────────────────────────────────────────────────────────

function mapToFieldErrors<TFieldValues extends Record<string, unknown>>(
  schemaErrors: Record<string, { message: string; type?: string; code?: string; metadata?: Record<string, unknown> }>
): ValfuseFormErrors<TFieldValues> {
  return Object.fromEntries(
    Object.entries(schemaErrors).map(([key, err]) => {
      const fieldError: ValfuseFieldError = {
        message: err.message,
        type: err.type ?? "validation",
        ...(err.code !== undefined && { code: err.code }),
        ...(err.metadata !== undefined && { metadata: err.metadata }),
      };
      return [key, fieldError];
    })
  ) as ValfuseFormErrors<TFieldValues>;
}

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

  // Keep latest values in a ref so event handlers never close over stale state
  const valuesRef = useRef(values);
  valuesRef.current = values;

  // Keep latest errors in a ref for trigger()
  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  // ── Internal: per-field validation ────────────────────────────────────────
  const validateField = useCallback(
    (name: string, currentValues: Record<string, unknown>) => {
      if (!schema[name]) return;
      const fieldErrors = validateSchema({ [name]: schema[name] }, currentValues);
      setErrorsState((prev) => {
        const next = { ...prev };
        if (fieldErrors[name]) {
          next[name as keyof TFieldValues] = {
            message: fieldErrors[name].message,
            type: fieldErrors[name].type ?? "validation",
            ...(fieldErrors[name].code !== undefined && { code: fieldErrors[name].code }),
          };
        } else {
          delete next[name as keyof TFieldValues];
        }
        return next;
      });
    },
    [schema]
  );

  // ── register ───────────────────────────────────────────────────────────────
  const register = useCallback(
    <TName extends keyof TFieldValues & string>(name: TName) => ({
      name,
      value: valuesRef.current[name] as string | number | readonly string[] | undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = e.target.value as TFieldValues[TName];
        const updated = { ...valuesRef.current, [name]: newValue };
        setValues(updated as TFieldValues);

        const isTouched = touchedFields.has(name);

        if (
          mode === "onChange" ||
          mode === "all" ||
          (mode === "onTouched" && isTouched)
        ) {
          validateField(name, updated as Record<string, unknown>);
        }
      },
      onBlur: () => {
        setTouchedFields((prev) => new Set([...prev, name]));
        if (
          mode === "onBlur" ||
          mode === "all" ||
          mode === "onTouched"
        ) {
          validateField(name, valuesRef.current as Record<string, unknown>);
        }
      },
    }),
    [mode, touchedFields, validateField]
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
      } else if (Array.isArray(name)) {
        setErrorsState((prev) => {
          const next = { ...prev };
          for (const n of name) delete next[n];
          return next;
        });
      } else {
        setErrorsState((prev) => {
          const next = { ...prev };
          delete next[name];
          return next;
        });
      }
    },
    []
  );

  // ── trigger ────────────────────────────────────────────────────────────────
  const trigger = useCallback(
    (name?: keyof TFieldValues & string | Array<keyof TFieldValues & string>): boolean => {
      const current = valuesRef.current as Record<string, unknown>;

      let fieldsToValidate: string[];
      if (name === undefined) {
        fieldsToValidate = Object.keys(schema);
      } else if (Array.isArray(name)) {
        fieldsToValidate = name as string[];
      } else {
        fieldsToValidate = [name as string];
      }

      let allValid = true;
      const nextErrors: ValfuseFormErrors<TFieldValues> = { ...errorsRef.current };

      for (const field of fieldsToValidate) {
        if (!schema[field]) continue;
        const fieldErrors = validateSchema({ [field]: schema[field] }, current);
        if (fieldErrors[field]) {
          allValid = false;
          nextErrors[field as keyof TFieldValues] = {
            message: fieldErrors[field].message,
            type: fieldErrors[field].type ?? "validation",
            ...(fieldErrors[field].code !== undefined && { code: fieldErrors[field].code }),
          };
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
      setValues(updated as TFieldValues);
      if (options?.shouldValidate) {
        // validateField reads valuesRef which hasn't updated yet — use updated directly
        const field = name as string;
        if (!schema[field]) return;
        const fieldErrors = validateSchema({ [field]: schema[field] }, updated as Record<string, unknown>);
        setErrorsState((prev) => {
          const next = { ...prev };
          if (fieldErrors[field]) {
            next[name as keyof TFieldValues] = {
              message: fieldErrors[field].message,
              type: fieldErrors[field].type ?? "validation",
              ...(fieldErrors[field].code !== undefined && { code: fieldErrors[field].code }),
            };
          } else {
            delete next[name as keyof TFieldValues];
          }
          return next;
        });
      }
    },
    [schema]
  );

  // ── watch ──────────────────────────────────────────────────────────────────
  const watch = useCallback(() => values, [values]);

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
  const control: ValfuseFormControl<TFieldValues> = {
    _values: values,
    _errors: errors,
    _updateField: <TName extends keyof TFieldValues & string>(
      name: TName,
      value: TFieldValues[TName]
    ) => {
      const updated = { ...valuesRef.current, [name]: value };
      setValues(updated as TFieldValues);
      const isTouched = touchedFields.has(name);
      if (
        mode === "onChange" ||
        mode === "all" ||
        (mode === "onTouched" && isTouched)
      ) {
        validateField(name, updated as Record<string, unknown>);
      }
    },
    _touchField: (name: string) => {
      setTouchedFields((prev) => new Set([...prev, name]));
      if (
        mode === "onBlur" ||
        mode === "all" ||
        mode === "onTouched"
      ) {
        validateField(name, valuesRef.current as Record<string, unknown>);
      }
    },
    _touchedFields: touchedFields,
  };

  // ── Derived formState ──────────────────────────────────────────────────────
  const isDirty = Object.keys(defaultValues).some(
    (key) => values[key as keyof TFieldValues] !== defaultValues[key as keyof TFieldValues]
  );

  const dirtyFields = Object.keys(defaultValues).reduce<ValfuseDirtyFields<TFieldValues>>(
    (acc, key) => {
      const k = key as keyof TFieldValues;
      if (values[k] !== defaultValues[k]) acc[k] = true;
      return acc;
    },
    {}
  );

  const touchedFieldsRecord = Array.from(touchedFields).reduce<ValfuseTouchedFields<TFieldValues>>(
    (acc, key) => {
      acc[key as keyof TFieldValues] = true;
      return acc;
    },
    {}
  );

  const isValid = Object.keys(errors).length === 0;

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

