/**
 * useFormCore — the state+refs substrate.
 *
 * Single source of truth for form state and refs. Every other sub-hook reads
 * from the returned `FormCore` bundle; only this hook calls `useState` or
 * `useRef`.
 *
 * The `xRef.current = x` mirror assignments run on every render so that
 * stable callbacks (in `useFormRegistration`, `useFormActions`, etc.) can
 * read the latest state without declaring it as a `useCallback` dep.
 */
import { useState, useRef } from "react";
import type { FormCore } from "./form-core";
import type { UseValfuseFormProps } from "../../types/index";

export function useFormCore<TFieldValues extends Record<string, unknown>>(
  props: UseValfuseFormProps<TFieldValues>
): FormCore<TFieldValues> {
  const { schema, defaultValues, mode = "onSubmit" } = props;

  // ── Reactive state ──────────────────────────────────────────────────────
  const [values, setValues] = useState<TFieldValues>(
    () => ({ ...defaultValues }) as TFieldValues
  );
  const [errors, setErrorsState] = useState<
    FormCore<TFieldValues>["errors"]
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set()
  );

  // ── Stale-read refs (callbacks read .current instead of closing over state) ─
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

  // ── Watch subscription set (initialised here so useFormWatch can read it) ─
  const watchSubscribersRef = useRef<
    FormCore<TFieldValues>["refs"]["watchSubscribersRef"]["current"]
  >(new Set());
  const lastChangedFieldRef = useRef<string | undefined>(undefined);

  return {
    schema,
    defaultValues,
    mode,
    values,
    errors,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    submitCount,
    touchedFields,
    setValues,
    setErrorsState,
    setTouchedFields,
    setIsSubmitting,
    setIsSubmitted,
    setIsSubmitSuccessful,
    setSubmitCount,
    refs: {
      valuesRef,
      errorsRef,
      touchedFieldsRef,
      modeRef,
      schemaRef,
      lastChangedFieldRef,
      watchSubscribersRef,
    },
  };
}
