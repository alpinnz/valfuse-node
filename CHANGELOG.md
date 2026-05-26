# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Per-package changelogs:
- [`packages/core/CHANGELOG.md`](./packages/core/CHANGELOG.md)
- [`packages/adapter-react/CHANGELOG.md`](./packages/adapter-react/CHANGELOG.md)

---

## [Unreleased]

---

## [0.0.4] — 2026-05-26

### Changed

- `@valfuse-node/adapter-react@0.0.4` — complete rewrite
  - Removed `react-hook-form` dependency; form state is now native React (`useState` + `useRef` + `useCallback`)
  - `ValfuseController` is now a native Valfuse component (no longer wraps RHF's `Controller`)
  - Rule files renamed: `*.rules.ts` → `*.rule.ts`, `custom.rules.ts` → `generic.rule.ts`
  - `form.formState.errors.fieldName?.code` fully type-safe on both `register()` and `ValfuseController`

---

## [0.0.1] — 2026-05-19

### Added

- `@valfuse-node/core@0.0.1` — native schema validation engine
  - `createSchema()`, `validateSchema()`, `normalizeError()`
  - String, number, boolean, array, object, and generic rules
  - Full TypeScript types
- `@valfuse-node/adapter-react-example` — reference implementation (private)
  - `UserObjectForm`, `UserIdForm`
  - `TextInput`, `RoleDropdownObject`, `RoleDropdownId`
  - API error mapping example

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/v0.0.4...HEAD
[0.0.4]: https://github.com/alpinnz/valfuse-node/compare/v0.0.1...v0.0.4
[0.0.1]: https://github.com/alpinnz/valfuse-node/releases/tag/v0.0.1
