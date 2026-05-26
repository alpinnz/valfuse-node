# Changelog — @valfuse-node/adapter-react

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [0.0.11] — 2026-05-26

### Added

- **Field-level `transform` support** — `schema` fields can now specify a `transform` function (e.g. `t.pipe(t.trim, t.toLowerCase)`).
  Transforms are applied automatically in:
  - `register.onChange` — stores the transformed value; validation runs on the transformed value
  - `register.onBlur` — transforms the current value (including raw `defaultValues`) before validating
  - `control._updateField` (used by `ValfuseController`) — same as `register.onChange`
  - `control._touchField` — same as `register.onBlur`
  - `setValue` — transformed value is stored before validation
  - `trigger` — all field transforms applied via `transformValues` before validation
  - `handleSubmit` — `onValid` receives fully-transformed values
  - `isValid` — computed against transformed values on every render
- **`ValfuseDirtyFields<T>`** and **`ValfuseTouchedFields<T>`** are now correctly exported from the package root
  (they were declared and documented since `0.0.7` but omitted from `index.ts`).

### Fixed

- **Double-transform bug** — `validateField` was re-applying a field's `transform` on top of an already-transformed
  value (callers had already applied it). Transform is now strictly a caller responsibility:
  `register.onChange` / `control._updateField` apply it once before storing; `register.onBlur` /
  `control._touchField` apply it to `valuesRef.current` before calling `validateField`.

### Performance

All changes below exclusively prevent unnecessary React re-renders — zero behaviour change.

- **`validateField` — dual bail-out in `setErrorsState` updater**
  ① No error + field was already clean → return `prev` (no re-render)
  ② Same error (message/type/code identical) → return `prev` — prevents a re-render on every
     keystroke while the field stays invalid (e.g. `"hel"` → `"hell"` → `"hello"` all produce
     the same `"Invalid email"` error)

- **`setErrors` — same-error bail-out** — compares incoming error (message/type/code) against
  `prev[field]` before marking `changed = true`; calling `setErrors` with an identical API error
  twice is now a true no-op.

- **`setValue + shouldValidate` — same bail-outs as `validateField`** applied inline.

- **`handleSubmit` success path** — `setErrorsState({})` guarded by `errorsRef` check; skipped
  when errors are already empty.

- **`trigger` — `changed` flag** — `setErrorsState` only called when at least one error actually
  changed; repeated `trigger()` on an already-valid form is now free.

- **`clearErrors()` no-arg bail-out** — returns immediately when `errorsRef.current` is already empty.

- **`clearErrors(fields[])` bail-out** — `toDelete.length === 0 → return prev`.

- **`clearStaleFieldError` bail-out** — `!(name in prev) → return prev`.

- **`setErrors` bail-out** — returns `prev` when all entries were `undefined`.

- **`_updateField` / `_touchField` as stable `useCallback`s** — extracted from `control` useMemo
  with their own stable deps (`[validateField, clearStaleFieldError]` / `[validateField]`), so
  `ValfuseController` and any `React.memo`-wrapped children never see new function references
  when unrelated fields change.

- **`ValfuseController` — fine-grained deps** — extracts per-field scalars (`fieldValue`,
  `fieldError`, `isTouched`) before `useMemo`; unrelated field changes no longer invalidate
  this field's `field` / `fieldState` memos.

- **`formState` memoized** — wrapped in `useMemo`; consumers who spread `formState` into props
  or add it to `useEffect` deps get a stable reference.

- **`new Set(prev) + .add()` instead of `new Set([...prev, name])`** — avoids an O(n)
  intermediate array when marking a field as touched (applies to both `register.onBlur` and
  `control._touchField`).

---

## [0.0.10] — 2026-05-26

### Fixed

- **`isValid`** now correctly returns `false` on initial render (before any validation has run)
  - Previously: `isValid` was `true` on init because `errors` was empty `{}`
  - Now: `isValid` is `false` until at least one validation has been triggered (via `handleSubmit`, `trigger`, `setValue({ shouldValidate: true })`, or mode-based auto-validation on `onChange`/`onBlur`)
  - `isValid` also resets back to `false` after `reset()` is called

---

## [0.0.9] — 2026-05-26

### Changed

- All `ValfuseFormState` properties are now explicitly marked as `readonly` in TypeScript for better immutability
  - `errors`, `isSubmitting`, `isSubmitted`, `isSubmitSuccessful`, `submitCount`, `isDirty`, `isValid`, `dirtyFields`, `touchedFields`, `defaultValues`

---

## [0.0.8] — 2026-05-26

### Added

- **`form.watch()`** — reactive watch for field values; mirrors react-hook-form overloads:
  - `form.watch()` → all current values (`TFieldValues`)
  - `form.watch("email")` → single field value
  - `form.watch(["email", "name"])` → array of values in order
  - `form.watch((values, info) => void)` → subscribe to changes; returns `unsubscribe` function
- New exported types: `ValfuseWatchCallback<T>`, `ValfuseWatchFunction<T>`

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

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.11...HEAD
[0.0.11]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.10...adapter-react-v0.0.11
[0.0.10]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.9...adapter-react-v0.0.10
[0.0.9]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.8...adapter-react-v0.0.9
[0.0.8]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.7...adapter-react-v0.0.8
[0.0.7]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.6...adapter-react-v0.0.7
[0.0.6]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.5...adapter-react-v0.0.6
[0.0.5]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.4...adapter-react-v0.0.5
[0.0.4]: https://github.com/alpinnz/valfuse-node/releases/tag/adapter-react-v0.0.4
