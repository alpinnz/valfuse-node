# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

_No unreleased changes._

---

## [0.1.0] — 2026-05-28

### Added

- **`@valfuse-node/core@0.1.0`** — framework-agnostic validation engine
  - `createSchema()`, `validateSchema()`, `transformValues()`, `normalizeError()`
  - `t()` transformer composer utility
  - Built-in rules: `required`, `minLength`, `maxLength`, `pattern`, `email`, `url`, `min`, `max`, `integer`, `minItems`, `maxItems`, `refine`, `custom`, `matchField`, `oneOf`, `notOneOf`
  - Full TypeScript types: `ValfuseSchema`, `ValfuseError`, `ValfuseFieldErrors`, all rule types

- **`@valfuse-node/localization@0.1.0`** — localization compiler, CLI, and browser runtime
  - CLI: `init`, `generate`, `validate`, `coverage`, `clean`
  - YAML-based translation format with nested namespace support
  - Full TypeScript code generation for locale files
  - Browser-safe interpolation runtime (`/browser` and `/runtime` entry points)
  - Context, gender, plural, and structured variant interpolation
  - HTML and JSON coverage reports
  - Watch mode for development (`valfuse-localization generate --watch`)

- **`@valfuse-node/react@0.1.0`** — React 18 adapter
  - `useValfuseForm` hook — native React state, no external form library dependency
  - `ValfuseController` — controlled component bridge
  - `form.register()`, `form.watch()`, `form.handleSubmit()`, `form.setErrors()`, `form.reset()`, `form.getValues()`
  - `formState`: `errors`, `isValid`, `isDirty`, `isSubmitting`, `dirtyFields`, `touchedFields` — all `readonly`
  - `LocalizationProvider`, `useLocalization`, `useLocalizationTree`
  - `createLocalizationStore`, `createLazyLocaleLoader`, `createSsrLocalizationState`
  - Storage strategies: `localStorageStrategy`, `sessionStorageStrategy`, `cookieStrategy`, `memoryStrategy`, `composeStorage`

- **`@valfuse-node/vue@0.1.0`** — Vue 3 adapter
  - `useValfuseForm` composable — reactive `formState` with computed getters
  - `register()` returns native Vue v-model bindings (`modelValue`, `onUpdate:modelValue`, `onBlur`)
  - Full parity with React adapter API: `watch`, `setValue`, `getValue`, `setErrors`, `clearErrors`, `reset`, `getValues`, `handleSubmit`

- **`@valfuse-node/example-react`** (private) — reference React implementation
  - `UserObjectForm`, `UserIdForm`, API error mapping, mode selector, `ValfuseController` demo

- **`@valfuse-node/example-vue`** (private) — reference Vue 3 implementation
  - Mirror of React example using `useValfuseForm` composable and native v-model bindings

### Infrastructure

- Turbo monorepo pipeline with dependency-ordered builds
- Single root ESLint config (`typescript-eslint` flat config, `no-console: error`)
- `tsup` for all library builds (CJS + ESM + `.d.ts`)
- Vitest for unit tests across `core` and `react`

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/alpinnz/valfuse-node/releases/tag/v0.1.0
