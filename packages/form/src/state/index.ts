// ============================================================================
// Form State Management (Framework-Agnostic)
// ============================================================================
// Framework-agnostic state management for form values, errors, touched, and submission.
// These pure functions can be used by React, Vue, or any adapter.

// Values state
export {
  createValuesState,
  updateValue,
  resetValues,
  computeIsDirty,
  computeDirtyFields,
  isFieldDirty,
  getValue,
  getValues,
  type FormValuesState,
} from "./values";

// Touched state
export {
  createTouchedState,
  markTouched,
  markUntouched,
  resetTouched,
  isTouched,
  toTouchedFieldsRecord,
  type FormTouchedState,
} from "./touched";

// Errors state
export {
  createErrorsState,
  setErrors,
  setFieldError,
  clearFieldErrors,
  resetErrors,
  hasErrors,
  getFieldError,
  toFormErrors,
  type FormErrorsState,
} from "./errors";

// Submission state
export {
  createSubmissionState,
  startSubmit,
  endSubmitSuccess,
  endSubmitFailure,
  resetSubmission,
  type FormSubmissionState,
} from "./submitting";
