/**
 * FormCore — the state+refs substrate shared by every other sub-hook.
 *
 * Centralising state ownership here eliminates "who declared this?" lookups
 * when reading the rest of the code. The mirror assignments (`xRef.current = x`)
 * stay co-located with the state they mirror to prevent mirror drift.
 */
import type {
  Dispatch,
  MutableRefObject,
  SetStateAction,
} from "react";
import type { ValfuseSchema } from "@valfuse-node/form";
import type {
  ValfuseFormErrors,
  ValfuseFormMode,
  ValfuseWatchCallback,
  UseValfuseFormProps,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
} from "../../types/index";

/**
 * The FormCore bundle is the single source of truth for form state and refs.
 *
 * - **State values** are read by the derived-state sub-hook and assembled into
 *   the public `formState`.
 * - **Setters** are exposed only to the sub-hooks that need to write.
 * - **Refs** are read across multiple sub-hooks; we pass them as a single
 *   bundle so signatures stay clean. React's exhaustive-deps lint does not
 *   flag ref reads, so the identity stability of the bundle does not matter.
 */
export interface FormCore<TFieldValues extends Record<string, unknown>> {
  /** props (sub-hooks re-use them; avoid re-passing through arg lists) */
  schema: ValfuseSchema;
  defaultValues: TFieldValues;
  mode: ValfuseFormMode;

  // ── Reactive state ──────────────────────────────────────────────────────
  values: TFieldValues;
  errors: ValfuseFormErrors<TFieldValues>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  touchedFields: Set<string>;

  // ── Setters (only sub-hooks that mutate) ─────────────────────────────────
  setValues: Dispatch<SetStateAction<TFieldValues>>;
  setErrorsState: Dispatch<SetStateAction<ValfuseFormErrors<TFieldValues>>>;
  setTouchedFields: Dispatch<SetStateAction<Set<string>>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  setIsSubmitted: Dispatch<SetStateAction<boolean>>;
  setIsSubmitSuccessful: Dispatch<SetStateAction<boolean>>;
  setSubmitCount: Dispatch<SetStateAction<number>>;

  // ── Stale-read refs (sub-hooks read .current; never put in deps) ────────
  refs: {
    valuesRef: MutableRefObject<TFieldValues>;
    errorsRef: MutableRefObject<ValfuseFormErrors<TFieldValues>>;
    touchedFieldsRef: MutableRefObject<Set<string>>;
    modeRef: MutableRefObject<ValfuseFormMode>;
    schemaRef: MutableRefObject<ValfuseSchema>;
    lastChangedFieldRef: MutableRefObject<string | undefined>;
    watchSubscribersRef: MutableRefObject<Set<ValfuseWatchCallback<TFieldValues>>>;
  };
}

/** Re-export types so consumers can `import type { ... } from "./form-core"`. */
export type {
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  UseValfuseFormProps,
};
