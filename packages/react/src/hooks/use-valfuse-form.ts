/**
 * useValfuseForm — the public form hook.
 *
 * Composition only. All state ownership lives in `useFormCore`; all
 * sub-hooks read from the `FormCore` bundle and produce one slice of the
 * public API. The final `formState` `useMemo` (this file's closing block)
 * assembles outputs from `useFormCore` and `useFormDerivedState` into
 * the public read-only shape.
 *
 *   useFormCore           → state + refs (the FormCore bundle)
 *   useFieldValidation    → per-field diffing + clear-stale-error
 *   useFormRegistration   → register + control bridge
 *   useFormWatch          → watch + subscriber notification
 *   useFormActions        → handleSubmit, setErrors, clearErrors, setValue, trigger, reset
 *   useFormDerivedState   → isDirty, dirtyFields, touchedFields, isValid
 */
import { useMemo } from "react";

import type { UseValfuseFormProps, UseValfuseFormReturn } from "../types/index";

import { useFormCore } from "./sub-hooks/use-form-core";
import { useFieldValidation } from "./sub-hooks/use-field-validation";
import { useFormRegistration } from "./sub-hooks/use-form-registration";
import { useFormWatch } from "./sub-hooks/use-form-watch";
import { useFormActions } from "./sub-hooks/use-form-actions";
import { useFormDerivedState } from "./sub-hooks/use-form-derived-state";

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useValfuseForm<TFieldValues extends Record<string, unknown>>(
  props: UseValfuseFormProps<TFieldValues>
): UseValfuseFormReturn<TFieldValues> {
  const { defaultValues } = props;

  const core = useFormCore(props);
  const { validateField, clearStaleFieldError } = useFieldValidation({
    schema: core.schema,
    setErrorsState: core.setErrorsState,
  });
  const { register, control } = useFormRegistration({
    core,
    validateField,
    clearStaleFieldError,
  });
  const { watch } = useFormWatch(core);
  const { handleSubmit, setErrors, clearErrors, setValue, trigger, reset } = useFormActions(
    core,
    clearStaleFieldError
  );
  const { isDirty, dirtyFields, touchedFieldsRecord, isValid } = useFormDerivedState(core);

  // formState is memoized so consumers who spread it into props or use it in
  // useEffect deps get a stable reference — only changes when a field inside changes.
  const formState = useMemo(
    () => ({
      errors: core.errors,
      isSubmitting: core.isSubmitting,
      isSubmitted: core.isSubmitted,
      isSubmitSuccessful: core.isSubmitSuccessful,
      submitCount: core.submitCount,
      isDirty,
      isValid,
      dirtyFields,
      touchedFields: touchedFieldsRecord,
      defaultValues,
    }),
    [
      core.errors,
      core.isSubmitting,
      core.isSubmitted,
      core.isSubmitSuccessful,
      core.submitCount,
      isDirty,
      isValid,
      dirtyFields,
      touchedFieldsRecord,
      defaultValues,
    ]
  );

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
