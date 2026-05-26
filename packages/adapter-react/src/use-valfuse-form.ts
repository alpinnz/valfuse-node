import { useState, useRef, useCallback, type FormEvent } from "react";
import { validateSchema, normalizeError } from "@valfuse-node/core";
import type { ValfuseFieldErrors } from "@valfuse-node/core";

import type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFieldError,
  ValfuseFormErrors,
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
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set());

  // Keep latest values in a ref so event handlers never close over stale state
  const valuesRef = useRef(values);
  valuesRef.current = values;

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
        if (mode === "onChange") {
          validateField(name, updated as Record<string, unknown>);
        }
      },
      onBlur: () => {
        setTouchedFields((prev) => new Set([...prev, name]));
        if (mode === "onBlur") {
          validateField(name, valuesRef.current as Record<string, unknown>);
        }
      },
    }),
    [mode, validateField]
  );

  // ── handleSubmit ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (onValid: (values: TFieldValues) => void | Promise<void>) =>
      async (e?: FormEvent | { preventDefault?: () => void }) => {
        e?.preventDefault?.();

        const currentValues = valuesRef.current;
        const schemaErrors = validateSchema(schema, currentValues as Record<string, unknown>);

        if (Object.keys(schemaErrors).length > 0) {
          setErrorsState(mapToFieldErrors<TFieldValues>(schemaErrors));
          return;
        }

        setErrorsState({});
        setIsSubmitting(true);
        try {
          await onValid(currentValues);
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

  // ── setValue ───────────────────────────────────────────────────────────────
  const setValue = useCallback(
    <TName extends keyof TFieldValues>(name: TName, value: TFieldValues[TName]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // ── watch ──────────────────────────────────────────────────────────────────
  const watch = useCallback(() => values, [values]);

  // ── reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(
    (newValues?: Partial<TFieldValues>) => {
      setValues({ ...defaultValues, ...newValues } as TFieldValues);
      setErrorsState({});
      setTouchedFields(new Set());
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
      if (mode === "onChange") {
        validateField(name, updated as Record<string, unknown>);
      }
    },
    _touchField: (name: string) => {
      setTouchedFields((prev) => new Set([...prev, name]));
      if (mode === "onBlur") {
        validateField(name, valuesRef.current as Record<string, unknown>);
      }
    },
    _touchedFields: touchedFields,
  };

  return {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setErrors,
    clearErrors,
    setValue,
    watch,
    reset,
  };
}

// ─── Re-export public types ───────────────────────────────────────────────────
export type { ValfuseFieldError, UseValfuseFormReturn } from "./types";

