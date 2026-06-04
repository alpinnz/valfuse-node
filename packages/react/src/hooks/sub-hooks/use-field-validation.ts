/**
 * useFieldValidation — the per-field validation diffing + the simple
 * single-field error clear.
 *
 * `validateField` re-runs the schema for ONE field and merges the result into
 * the `errors` state. It bails out (returns the same prev) when the new error
 * matches the prior one byte-for-byte (message + type + code), preventing a
 * re-render on every keystroke while the field stays invalid.
 *
 * `clearStaleFieldError` is the "API error was set, user is now editing, so
 * the error is stale — clear it without re-running validation" hook. It also
 * bails out when the field has no current error.
 *
 * Both callbacks are stable across renders (deps are only `schema` and
 * `setErrorsState`, both stable), so downstream sub-hooks (`register`,
 * `setValue`, `_updateField`, `_touchField`) can include them as deps
 * without churn.
 */
import { useCallback, type Dispatch, type SetStateAction } from "react";
import type { ValfuseSchema } from "@valfuse-node/form";
import { validateSchema } from "@valfuse-node/form";
import type { ValfuseFormErrors } from "../../types/index";
import { buildFieldError } from "../../helpers/index";

type SetErrorsState<TFieldValues extends Record<string, unknown>> = Dispatch<
  SetStateAction<ValfuseFormErrors<TFieldValues>>
>;

export function useFieldValidation<TFieldValues extends Record<string, unknown>>({
  schema,
  setErrorsState,
}: {
  schema: ValfuseSchema;
  setErrorsState: SetErrorsState<TFieldValues>;
}) {
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
    [schema, setErrorsState]
  );

  const clearStaleFieldError = useCallback(
    (name: keyof TFieldValues) => {
      setErrorsState((prev: ValfuseFormErrors<TFieldValues>) => {
        if (!(name in prev)) return prev; // bail out early — no re-render
        const next = { ...prev };
        delete next[name];
        return next;
      });
    },
    [setErrorsState]
  );

  return { validateField, clearStaleFieldError };
}
