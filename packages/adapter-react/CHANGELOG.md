# Changelog — @valfuse-node/adapter-react

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.5...HEAD
[0.0.5]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.4...adapter-react-v0.0.5
[0.0.4]: https://github.com/alpinnz/valfuse-node/releases/tag/adapter-react-v0.0.4
