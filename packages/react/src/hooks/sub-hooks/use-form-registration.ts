/**
 * useFormRegistration — DOM-event handlers + the `control` bridge.
 *
 * Owns the four callbacks that share the same ref-read pattern and the same
 * `useCallback` deps profile:
 *   - `register(name)` — returns the React-input-style props for `register`
 *   - `_updateField` — used by ValfuseController for custom widgets
 *   - `_touchField` — used by ValfuseController for custom widgets
 *   - `control` — assembled `useMemo` exposed publicly for ValfuseController
 *
 * The reference-stability contract is critical: `_updateField` and `_touchField`
 * must stay stable across value/error renders so `ValfuseController`'s
 * `useCallback` deps at `valfuse-controller.tsx:74,79` don't churn and
 * trigger needless re-renders of React.memo'd child inputs.
 */
import { useCallback, useMemo, type ChangeEvent } from "react";
import { shouldValidateOnChange, shouldValidateOnBlur } from "../../helpers/index";
import type { FormCore } from "./form-core";
import type { ValfuseFormControl } from "../../types/index";

export function useFormRegistration<TFieldValues extends Record<string, unknown>>({
  core,
  validateField,
  clearStaleFieldError,
}: {
  core: FormCore<TFieldValues>;
  validateField: (name: string, currentValues: Record<string, unknown>) => void;
  clearStaleFieldError: (name: keyof TFieldValues) => void;
}) {
  const { values, refs, touchedFields, setValues, setTouchedFields } = core;

  // Ref aliases — declared BEFORE the useCallback bodies reference them.
  // The hook closure captures the local names; they all point to refs on
  // `core.refs`. This makes the body below easier to read without losing
  // the "read via refs, never put in deps" pattern.
  const valuesRef = refs.valuesRef;
  const modeRef = refs.modeRef;
  const schemaRef = refs.schemaRef;
  const touchedFieldsRef = refs.touchedFieldsRef;
  const lastChangedFieldRef = refs.lastChangedFieldRef;

  // ── register ─────────────────────────────────────────────────────────────
  const register = useCallback(
    <TName extends keyof TFieldValues & string>(name: TName) => ({
      name,
      value: valuesRef.current[name] as string | number | readonly string[] | undefined,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const rawValue = e.target.value as TFieldValues[TName];
        // Apply field-level transform before storing — read via schemaRef to avoid stale closure.
        const fieldTransform = schemaRef.current[name]?.transform;
        const newValue = fieldTransform
          ? (fieldTransform(rawValue) as TFieldValues[TName])
          : rawValue;
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

  // ── control (bridge to ValfuseController) ───────────────────────────────
  // Stable callbacks so `ValfuseController` (and any React.memo'd children
  // it passes them to) won't see new function references on every
  // value / error / touch change. They only recreate when the schema changes
  // (via validateField dep), which is rare in practice.
  const _updateField = useCallback(
    <TName extends keyof TFieldValues & string>(name: TName, value: TFieldValues[TName]) => {
      // Apply field-level transform — read via schemaRef to avoid stale closure.
      const fieldTransform = schemaRef.current[name]?.transform;
      const transformedValue = fieldTransform
        ? (fieldTransform(value) as TFieldValues[TName])
        : value;
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
      _errors: core.errors,
      _updateField,
      _touchField,
      _touchedFields: touchedFields,
    }),
    [values, core.errors, touchedFields, _updateField, _touchField]
  );

  return { register, control, _updateField, _touchField };
}
