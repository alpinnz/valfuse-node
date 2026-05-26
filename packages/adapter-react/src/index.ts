// ─── Hook ─────────────────────────────────────────────────────────────────────
export { useValfuseForm } from "./use-valfuse-form";

// ─── Component ────────────────────────────────────────────────────────────────
export { ValfuseController } from "./valfuse-controller";

// ─── Types: form ──────────────────────────────────────────────────────────────
export type {
  UseValfuseFormProps,
  UseValfuseFormReturn,
  ValfuseFormMode,
  ValfuseFormState,
  ValfuseFormErrors,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseFormControl,
  ValfuseFieldError,
  ValfuseRegisterReturn,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
} from "./types";

// ─── Types: controller ────────────────────────────────────────────────────────
export type {
  ValfuseControllerProps,
  ValfuseControllerField,
  ValfuseControllerFieldState,
  ValfuseControllerRenderProps,
} from "./valfuse-controller";
