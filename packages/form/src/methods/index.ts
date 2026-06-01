// ============================================================================
// Form Methods (Framework-Agnostic)
// ============================================================================
// Framework-agnostic form methods for registration, submission, and state management.

// Register
export {
  createFieldRegister,
  type RegisterOptions,
} from './register';

// handleSubmit
export {
  createSubmitHandler,
} from './handle-submit';

// setErrors
export {
  createSetErrors,
} from './set-errors';

// clearErrors
export {
  createClearErrors,
} from './clear-errors';

// setValue
export {
  createSetValue,
} from './set-value';

// trigger
export {
  createTrigger,
  validateFields,
} from './trigger';

// watch
export {
  createWatch,
} from './watch';

// reset
export {
  createReset,
} from './reset';

// control
export {
  createControl,
} from './control';