// ============================================================================
// Form Submission State Management (Framework-Agnostic)
// ============================================================================
// Pure functions for managing submission state.

// ============================================================================
// State Types
// ============================================================================

/** Form submission state */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
}

// ============================================================================
// Factory
// ============================================================================

/** Create initial submission state */
export function createSubmissionState(): FormSubmissionState {
  return {
    isSubmitting: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    submitCount: 0,
  };
}

// ============================================================================
// Operations
// ============================================================================

/** Start submission */
export function startSubmit(state: FormSubmissionState): FormSubmissionState {
  return {
    ...state,
    isSubmitting: true,
  };
}

/** End submission successfully */
export function endSubmitSuccess(state: FormSubmissionState): FormSubmissionState {
  return {
    isSubmitting: false,
    isSubmitted: true,
    isSubmitSuccessful: true,
    submitCount: state.submitCount + 1,
  };
}

/** End submission with failure */
export function endSubmitFailure(state: FormSubmissionState): FormSubmissionState {
  return {
    ...state,
    isSubmitting: false,
    isSubmitted: true,
    isSubmitSuccessful: false,
    submitCount: state.submitCount + 1,
  };
}

/** Reset submission state */
export function resetSubmission(): FormSubmissionState {
  return {
    isSubmitting: false,
    isSubmitted: false,
    isSubmitSuccessful: false,
    submitCount: 0,
  };
}