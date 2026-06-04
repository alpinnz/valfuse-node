/**
 * Internal barrel for the form-hook sub-hooks.
 *
 * These modules are not re-exported from `public-api.ts` — they are an
 * internal decomposition of `useValfuseForm` and are not part of the
 * library's public surface. The main `use-valfuse-form.ts` composes them.
 *
 * Each sub-hook owns a single concern:
 *   - `useFormCore`           — state + refs (the FormCore bundle)
 *   - `useFieldValidation`    — per-field validation diffing
 *   - `useFormRegistration`   — register + control bridge
 *   - `useFormWatch`          — watch + subscriber notification
 *   - `useFormActions`        — handleSubmit, setValue, trigger, reset, …
 *   - `useFormDerivedState`   — isDirty, dirtyFields, touchedFields, isValid
 *
 * `form-core.ts` is a shared types module (the `FormCore` interface itself),
 * not a hook — it lives here so sub-hooks can import the bundle type.
 */
export { useFormCore } from "./use-form-core";
export { useFieldValidation } from "./use-field-validation";
export { useFormRegistration } from "./use-form-registration";
export { useFormWatch } from "./use-form-watch";
export { useFormActions } from "./use-form-actions";
export { useFormDerivedState } from "./use-form-derived-state";
export type { FormCore } from "./form-core";
