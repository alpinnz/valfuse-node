# Changelog — @valfuse-node/adapter-react

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [0.0.7] — 2026-05-26

### Added

- **`form.formState.isSubmitted`** — `true` after the form has been submitted at least once
- **`form.formState.isSubmitSuccessful`** — `true` if the most recent submission passed validation and `onValid` resolved without throwing
- **`form.formState.submitCount`** — increments on every submit attempt; resets to `0` on `form.reset()`
- **`form.formState.isDirty`** — `true` if any field value differs from its default value
- **`form.formState.isValid`** — `true` if there are currently no validation errors
- **`form.formState.dirtyFields`** — `{ [fieldName]?: boolean }` map of fields whose value has changed from the default
- **`form.formState.touchedFields`** — `{ [fieldName]?: boolean }` map of fields the user has focused and blurred
- **`form.formState.defaultValues`** — exposes the `defaultValues` passed to `useValfuseForm`
- New exported types: `ValfuseDirtyFields<T>`, `ValfuseTouchedFields<T>`

### Changed

- `ValfuseFormState` updated — new properties are non-breaking additions
- `form.handleSubmit` now sets `isSubmitted`, `isSubmitSuccessful`, and `submitCount` on every call
- `form.reset()` now resets `isSubmitted`, `isSubmitSuccessful`, and `submitCount` to their initial values

---

## [0.0.6] — 2026-05-26

### Added

- **`mode: "onTouched"`** — validate on first blur; then validate on every subsequent change once the field has been touched
- **`mode: "all"`** — validate on both `onChange` and `onBlur`

### Changed

- `ValfuseFormMode` updated: `"onSubmit" | "onBlur" | "onChange" | "onTouched" | "all"` (was `"onSubmit" | "onChange" | "onBlur"`)

---

## [0.0.5] — 2026-05-26

### Added

- **`form.trigger(name?)`** — manually trigger validation for one field, an array of fields, or all fields; returns `true` if all triggered fields are valid
- **`form.setValue(name, value, options?)`** — now accepts optional `{ shouldValidate: boolean }`; when `true`, validation runs immediately after the value is set

### Changed

- `form.setValue` signature updated: `setValue(name, value, options?: { shouldValidate?: boolean })`
- `UseValfuseFormReturn` updated with `trigger` method

---

## [0.0.4] — 2026-05-26

### Added

- `useValfuseForm()` — native React hook built on `useState` + `useRef` + `useCallback`; zero dependency on any external form library
- `ValfuseController` — controlled field wrapper for complex inputs (dropdowns, date-pickers, etc.)
- `types.ts` — all public form types as a dedicated module
- `ValfuseFormControl` — typed bridge object passed to `ValfuseController`
- `ValfuseFormMode` — `"onSubmit" | "onChange" | "onBlur"` validation trigger
- `ValfuseRegisterReturn` — explicit return type of `form.register(name)`
- `ValfuseFieldError` — `{ message, type, code?, metadata? }` — consistent error shape across schema validation and `setErrors`
- `ValfuseControllerField`, `ValfuseControllerFieldState`, `ValfuseControllerRenderProps` — controller render prop types

### API

**`form.register(name)`** — spread onto native inputs or `forwardRef` components  
**`form.control`** — pass to `<ValfuseController control={...} />`  
**`form.handleSubmit(onValid)`** — validates with schema, calls `onValid(values)` on success  
**`form.formState.errors`** — typed field errors; `error?.message` and `error?.code` both available  
**`form.formState.isSubmitting`** — boolean submission state  
**`form.setErrors(errors)`** — inject server/manual errors; accepts `string` or `ValfuseError` per field  
**`form.clearErrors(name?)`** — clear one, many, or all field errors  
**`form.setValue(name, value, options?)`** — programmatically set a field value; pass `{ shouldValidate: true }` to validate immediately  
**`form.trigger(name?)`** — manually trigger validation; returns `true` if all triggered fields are valid  
**`form.watch()`** — returns current form values  
**`form.reset(values?)`** — reset to default values

### Dependencies

- `@valfuse-node/core@^0.0.1`
- peer: `react@>=18`, `react-dom@>=18`

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.7...HEAD
[0.0.7]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.6...adapter-react-v0.0.7
[0.0.6]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.5...adapter-react-v0.0.6
[0.0.5]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.4...adapter-react-v0.0.5
[0.0.4]: https://github.com/alpinnz/valfuse-node/releases/tag/adapter-react-v0.0.4
