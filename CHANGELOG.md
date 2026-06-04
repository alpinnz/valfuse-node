# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- **`@valfuse-node/react@0.2.0`** — `ValfuseController` test coverage
  - 10 new tests covering: render-prop output, initial field value, `field.onChange` propagation, `field.onBlur` touched state, `fieldState.error` rendering with code/message, error clearing on fix, stable `field` object reference across unrelated field updates, and a real-world custom widget (date-picker) integration test.
  - Brings react test count from 85 → 95; the component is now first-class tested instead of being public-API-with-zero-coverage.

- **`@valfuse-node/localization@0.2.0`** — first test coverage
  - 175 tests across 21 test files for the four highest-value, runtime-critical subsystems:
    - **Runtime interpolation engine** (61 tests): `interpolate`, `lookupMessage`, `pickContextVariant`, `pickGenderVariant`, `pickPluralVariant`, `parseStructuredVariants`, and the three `pickStructured*` helpers. Covers edge cases like missing params, Unicode in surrounding text, structured-payload null fallthrough, and `count` auto-injection in plural variants.
    - **Parser** (44 tests): `parseStructuredNode`, `parseInlineMetadata`, `parseLocalizationFile`, `extractPlaceholders`. Verifies `@plural`/`@gender`/`@context` priority, reserved-key filtering, and identifier grammar (`[a-zA-Z_][a-zA-Z0-9_]*`).
    - **Validators** (42 tests): `validateKeyParity`, `validatePlaceholderParity`, `validateStructuredParity`, `validateMetadataUsage`, `validatePathConsistency`, `validateFlattenCollision`, `validateMaxDepth`. Each validator has its own `_fixtures.ts` helper that builds `NormalizedProject` instances from typed primitives — no filesystem or config dependencies.
    - **Normalizer** (28 tests): `flattenKeys`, `normalizeKeyNode`, `normalizeMetadata`, `normalizeStructuredNode`. Verifies sort-by-key for deterministic output, leaf wrapping, and metadata/structured preservation.
  - Brings localization test count from 0 → 175. The package previously had no test coverage at all despite being a 60-file, 11-directory system with a public CLI, a code generator, a validator pipeline, and a browser runtime.

- **`@valfuse-node/vue@0.2.0`** — full contract alignment with React adapter
  - **Generic type renamed**: `TSchema extends ValfuseSchema` → `TFieldValues extends Record<string, unknown>`. Matches React and form contract — the generic now represents the **values shape** (inferred from `defaultValues`), not the schema. Fixes a long-standing bug where `useValfuseForm<TestValues>` failed because `TestValues` is the values type, not the schema type.
  - **`formState` new fields**: `isDirty`, `isSubmitSuccessful`, `submitCount`, `defaultValues` — bringing it 1:1 with React's `ValfuseFormState`.
  - **`dirtyFields` and `touchedFields`**: now exposed as `Record<keyof TFieldValues, true>` (matching form contract) instead of `Set<string>`. Internal tracking still uses `Set` for O(1) add/delete; computed projections convert on read.
  - **`control` object**: new — exposes `_values`, `_errors`, `_touchedFields`, `_updateField`, `_touchField` for the (future) `ValfuseController` Vue equivalent. Shape mirrors the React control object so a future component accepts both adapters identically.
  - **`trigger` method**: new — `trigger()` validates all fields, `trigger(name)` validates one, `trigger([names])` validates an array. Returns `boolean` (valid?). Diff-merges results into `errors` without clobbering unrelated field errors.
  - **`watch` multi-overload**: new — `watch()` (snapshot), `watch(name)` (single value), `watch([names])` (array), `watch((values, info) => void)` (subscribe). The pre-existing legacy `watch(name, callback)` is preserved for backward compat via the new `ValfuseVueWatchFunction<TFieldValues>` type.
  - **`reset` now also resets submit state** (`submitCount`, `isSubmitted`, `isSubmitSuccessful`) — matches React behavior.
  - **25 new tests** across 6 describe blocks (existing contract, formState parity, control object, trigger, watch overloads, reset). Vue test count: 0 → 25.

### Removed

- **`@valfuse-node/form@0.2.0`** — dead factory methods
  - Removed the `methods/` directory and its 9 factory functions: `createFieldRegister`, `createSubmitHandler`, `createSetErrors`, `createClearErrors`, `createSetValue`, `createTrigger`, `createWatch`, `createReset`, `createControl`, plus the `validateFields` helper.
  - **Why removed:** these were intended as an extension API for adapter authors, but no adapter (`@valfuse-node/react`, `@valfuse-node/vue`, or any consumer) imported them — React and Vue re-implement all the logic inline. Several had broken implementations: `createSubmitHandler` validated `{} as TSchema` (a stub), `createWatch` returned `undefined` for name/array modes.
  - Bundle size: form's `dist/index.mjs` shrunk from 16.7 KB to 14.6 KB (~13% smaller), `dist/index.js` from 19.3 KB to 16.8 KB.
  - **Breaking change** for any consumer that imported these by name from `@valfuse-node/form` (or `@valfuse-node/core`'s flat re-export). The audit confirmed no such consumers exist in the monorepo, but downstream packages should be aware.

### Changed

- **`@valfuse-node/core@0.2.0`** — umbrella restructure
  - **Before:** `core` was a placeholder package exporting an empty interface; `localization` carried an unused `core` dependency.
  - **After:** `core` is the **umbrella entry point** for the entire valfuse-node ecosystem. A single `npm install @valfuse-node/core` gives you form, localization, and the React/Vue adapters.
  - Re-exports:
    - `form` and `localization` are **flattened to top level** (no name collisions).
    - `react` and `vue` are **namespaced** as `ReactAdapter` and `VueAdapter` to disambiguate the identically-named `useValfuseForm` hooks.
  - New `tsup.config.ts` marks all four sub-packages and `react`/`vue` as external — output is a ~270 B ESM facade that resolves sub-packages at runtime, enabling tree-shaking and zero duplication.
  - Added `peerDependencies` for `react >= 18` and `vue >= 3`, both marked **optional** in `peerDependenciesMeta` (you only need the peer you actually use).
  - Removed unused `@valfuse-node/core` dependency from `@valfuse-node/localization` (broke the build-time circular dependency).
  - **Breaking:** `core` no longer exports the empty `CoreOrchestrationConfig` interface from `0.1.0`. The previous `core` build produced 0-byte ESM output and failed lint, so no real consumer could have been using it.

- **Architecture:** the documented role of `core` flipped from "orchestration placeholder" to "umbrella facade". See `docs/adr/ADR-001-core-orchestration.md` addendum and `docs/adr/ADR-002-shared-utilities.md` for context.

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
