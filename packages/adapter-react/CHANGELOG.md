# Changelog — @valfuse-node/adapter-react

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [0.0.1] — 2026-05-19

### Added

**`useValfuseForm(props)`**
- Wraps `react-hook-form`'s `useForm` with Valfuse native schema resolver
- Accepts `schema: ValfuseSchema` instead of `resolver`
- Returns all `UseFormReturn` properties plus `setErrors`
- Fully generic over `TFieldValues extends FieldValues`

**`form.setErrors(errors)`**
- Injects external errors into `form.formState.errors`
- Accepts `Record<string, string>` — simple string errors
- Accepts `Record<string, ValfuseError>` — detailed error objects with `message`, `type`, `code`, `metadata`
- Error type is forwarded to `formState.errors.fieldName.type`

**`createValfuseResolver(schema)`**
- Creates a `react-hook-form`-compatible async resolver from a `ValfuseSchema`
- Calls `validateSchema` from `@valfuse-node/core`
- Maps Valfuse errors to `react-hook-form` FieldErrors format
- Exposed for advanced use cases (e.g. custom `useForm` setup)

**TypeScript types**
- `UseValfuseFormReturn<TFieldValues>` — return type of `useValfuseForm`

### Dependencies

- `@valfuse-node/core@^0.0.1`
- peer: `react@>=18`, `react-dom@>=18`, `react-hook-form@>=7`

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/adapter-react-v0.0.1...HEAD
[0.0.1]: https://github.com/alpinnz/valfuse-node/releases/tag/adapter-react-v0.0.1

