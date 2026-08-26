/**
 * useFormActions — the 6 imperative action callbacks on the form handle.
 *
 * Each callback reads what it needs from `core` (refs and setters) and uses
 * specific `core.*` fields in its deps array so the identity is stable across
 * renders — same reference-stability contract as the pre-refactor inline code.
 *
 *   - `setErrors`, `clearErrors`     — external error injection
 *   - `setValue`, `trigger`          — programmatic value + validation
 *   - `handleSubmit`, `reset`        — submission lifecycle
 *
 * `setValue` takes a `clearStaleFieldError` from the validation sub-hook so
 * it can mirror `register.onChange`'s "no full validation → just clear stale
 * errors" behaviour when `shouldValidate` isn't requested.
 */
import { useCallback } from "react";
import type { FormEvent } from "react";
import { validateSchema, normalizeError, transformValues } from "@valfuse-node/form";
import type { ValfuseFieldErrors } from "@valfuse-node/form";
import type { ValfuseFormErrors } from "../../types/index";
import { buildFieldError, mapToFieldErrors } from "../../helpers/index";
import type { FormCore } from "./form-core";

export function useFormActions<TFieldValues extends Record<string, unknown>>(
  core: FormCore<TFieldValues>,
  clearStaleFieldError: (name: keyof TFieldValues) => void
) {
  // ── handleSubmit ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (onValid: (values: TFieldValues) => void | Promise<void>) =>
      async (e?: FormEvent | { preventDefault?: () => void }) => {
        e?.preventDefault?.();

        const { schema, refs } = core;
        const currentValues = refs.valuesRef.current;
        // Apply all field transforms before validation and before passing to onValid.
        const transformedValues = transformValues(
          schema,
          currentValues as Record<string, unknown>
        ) as TFieldValues;
        const schemaErrors = validateSchema(schema, transformedValues as Record<string, unknown>);

        core.setSubmitCount((c) => c + 1);
        core.setIsSubmitted(true);

        if (Object.keys(schemaErrors).length > 0) {
          core.setErrorsState(mapToFieldErrors<TFieldValues>(schemaErrors));
          core.setIsSubmitSuccessful(false);
          return;
        }

        // Only clear errors if any exist — avoids a needless re-render on valid submit.
        if (Object.keys(refs.errorsRef.current).length > 0) core.setErrorsState({});
        core.setIsSubmitting(true);
        try {
          await onValid(transformedValues);
          core.setIsSubmitSuccessful(true);
        } catch (err) {
          core.setIsSubmitSuccessful(false);
          throw err;
        } finally {
          core.setIsSubmitting(false);
        }
      },
    // All read via core.* — list each stable field explicitly.
    [
      core.schema,
      core.refs.valuesRef,
      core.refs.errorsRef,
      core.setSubmitCount,
      core.setIsSubmitted,
      core.setIsSubmitting,
      core.setIsSubmitSuccessful,
      core.setErrorsState,
    ]
  );

  // ── setErrors (external — e.g. API responses) ────────────────────────────
  const setErrors = useCallback(
    (fieldErrors: ValfuseFieldErrors<Extract<keyof TFieldValues, string>>) => {
      core.setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
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
            prevFieldError.type === (normalized.type ?? "manual") &&
            prevFieldError.code === normalized.code
          )
            continue;
          next[fieldName as keyof TFieldValues] = {
            message: normalized.message,
            type: normalized.type ?? "manual",
            ...(normalized.code !== undefined && { code: normalized.code }),
            ...(normalized.metadata !== undefined && {
              metadata: normalized.metadata,
            }),
          };
          changed = true;
        }
        return changed ? next : prev;
      });
    },
    [core.setErrorsState]
  );

  // ── clearErrors ──────────────────────────────────────────────────────────
  const clearErrors = useCallback(
    (name?: keyof TFieldValues | Array<keyof TFieldValues>) => {
      if (name === undefined) {
        // Bail out when errors is already empty — avoids a needless re-render.
        if (Object.keys(core.refs.errorsRef.current).length === 0) return;
        core.setErrorsState({});
        return;
      }
      const fields = Array.isArray(name) ? name : [name];
      core.setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        // Bail out early if none of the requested fields have an active error.
        const toDelete = fields.filter((k) => k in prev);
        if (toDelete.length === 0) return prev;
        const next = { ...prev };
        for (const n of toDelete) delete next[n];
        return next;
      });
    },
    [core.refs.errorsRef, core.setErrorsState]
  );

  // ── trigger ──────────────────────────────────────────────────────────────
  const trigger = useCallback(
    (name?: (keyof TFieldValues & string) | Array<keyof TFieldValues & string>): boolean => {
      const { schema, refs } = core;
      const current = refs.valuesRef.current as Record<string, unknown>;
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
      const prevErrors = refs.errorsRef.current;
      const nextErrors: ValfuseFormErrors<TFieldValues> = { ...prevErrors };

      for (const field of fieldsToValidate) {
        if (!schema[field]) continue;
        const raw = validateSchema({ [field]: schema[field] }, transformed);
        const error = buildFieldError(raw, field);
        if (error) {
          allValid = false;
          // Mark changed if this field had no prior error or the message/type/code changed.
          const prev = prevErrors[field as keyof TFieldValues];
          if (
            !prev ||
            prev.message !== error.message ||
            prev.type !== error.type ||
            prev.code !== error.code
          ) {
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
      if (changed) core.setErrorsState(nextErrors);
      return allValid;
    },
    [core.schema, core.refs.valuesRef, core.refs.errorsRef, core.setErrorsState]
  );

  // ── setValue ─────────────────────────────────────────────────────────────
  const setValue = useCallback(
    <TName extends keyof TFieldValues>(
      name: TName,
      value: TFieldValues[TName],
      options?: { shouldValidate?: boolean }
    ) => {
      const { schema, refs } = core;
      // Apply field-level transform before storing — read via schemaRef to avoid stale closure.
      const fieldTransform = refs.schemaRef.current[name as string]?.transform;
      const transformedValue = fieldTransform
        ? (fieldTransform(value) as TFieldValues[TName])
        : value;
      const updated = { ...refs.valuesRef.current, [name]: transformedValue };
      refs.valuesRef.current = updated as TFieldValues; // sync update so trigger() reads the new value immediately
      refs.lastChangedFieldRef.current = name as string;
      core.setValues(updated as TFieldValues);

      if (options?.shouldValidate) {
        const field = name as string;
        if (!schema[field]) return;
        const raw = validateSchema({ [field]: schema[field] }, updated as Record<string, unknown>);
        const error = buildFieldError(raw, field);
        core.setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
          if (!error && !(field in prev)) return prev;
          const prevError = prev[name as keyof TFieldValues];
          if (
            error &&
            prevError &&
            error.message === prevError.message &&
            error.type === prevError.type &&
            error.code === prevError.code
          )
            return prev;
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
    [
      core.schema,
      core.refs.schemaRef,
      core.refs.valuesRef,
      core.refs.lastChangedFieldRef,
      core.setValues,
      core.setErrorsState,
      clearStaleFieldError,
    ]
  );

  // ── reset ────────────────────────────────────────────────────────────────
  const reset = useCallback(
    (newValues?: Partial<TFieldValues>) => {
      core.setValues({ ...core.defaultValues, ...newValues } as TFieldValues);
      core.setErrorsState({});
      core.setTouchedFields(new Set());
      core.setIsSubmitted(false);
      core.setIsSubmitSuccessful(false);
      core.setSubmitCount(0);
    },
    [
      core.defaultValues,
      core.setValues,
      core.setErrorsState,
      core.setTouchedFields,
      core.setIsSubmitted,
      core.setIsSubmitSuccessful,
      core.setSubmitCount,
    ]
  );

  return { handleSubmit, setErrors, clearErrors, setValue, trigger, reset };
}
