/**
 * useFormDerivedState — the 4 `useMemo`s that compose `formState`'s derived
 * fields: `isDirty`, `dirtyFields`, `touchedFieldsRecord`, and `isValid`.
 *
 * `isValid` has a fast path: if `core.errors` already has entries, skip the
 * full schema re-validation. The slow path runs `transformValues` +
 * `validateSchema` so that any field-level transforms are applied before
 * validation — consistent with `handleSubmit` and `trigger`.
 */
import { useMemo } from "react";
import { validateSchema, transformValues } from "@valfuse-node/form";
import type { ValfuseDirtyFields, ValfuseTouchedFields } from "../../types/index";
import type { FormCore } from "./form-core";

export function useFormDerivedState<TFieldValues extends Record<string, unknown>>(
  core: FormCore<TFieldValues>
) {
  const { schema, defaultValues, values, errors, touchedFields } = core;

  const isDirty = useMemo(
    () =>
      Object.keys(defaultValues).some(
        (key) => values[key as keyof TFieldValues] !== defaultValues[key as keyof TFieldValues]
      ),
    [values, defaultValues]
  );

  const dirtyFields = useMemo(
    () =>
      Object.keys(defaultValues).reduce<ValfuseDirtyFields<TFieldValues>>((acc, key) => {
        const k = key as keyof TFieldValues;
        if (values[k] !== defaultValues[k]) acc[k] = true;
        return acc;
      }, {}),
    [values, defaultValues]
  );

  const touchedFieldsRecord = useMemo(
    () =>
      Array.from(touchedFields).reduce<ValfuseTouchedFields<TFieldValues>>((acc, key) => {
        acc[key as keyof TFieldValues] = true;
        return acc;
      }, {}),
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

  return { isDirty, dirtyFields, touchedFieldsRecord, isValid };
}
