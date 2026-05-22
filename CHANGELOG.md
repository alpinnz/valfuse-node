# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Per-package changelogs:
- [`packages/core/CHANGELOG.md`](./packages/core/CHANGELOG.md)
- [`packages/adapter-react/CHANGELOG.md`](./packages/adapter-react/CHANGELOG.md)

---

## [Unreleased]

---

## [0.0.2] — 2026-05-23

### Fixed

- `@valfuse-node/adapter-react@0.0.2`
  - `code` field now correctly forwarded from schema errors and `setErrors` to `formState.errors`
  - `formState.errors.fieldName?.code` is now fully type-safe via new `ValfuseFieldError` type

---

## [0.0.1] — 2026-05-19

### Added

- `@valfuse-node/core@0.0.1` — native schema validation engine
  - `createSchema()`, `validateSchema()`, `normalizeError()`
  - String, number, boolean, array, object, and generic rules
  - Full TypeScript types
- `@valfuse-node/adapter-react@0.0.1` — React Hook Form adapter
  - `useValfuseForm()` with `setErrors()` support
  - `createValfuseResolver()` for advanced use
  - Compatible with `register()` and `Controller`
- `@valfuse-node/adapter-react-example` — reference implementation (private)
  - `UserObjectForm` — role as `Role | null` with `Controller`
  - `UserIdForm` — roleId as `string` with `Controller`
  - `TextInput`, `RoleDropdownObject`, `RoleDropdownId` components
  - API error mapping example

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/v0.0.2...HEAD
[0.0.2]: https://github.com/alpinnz/valfuse-node/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/alpinnz/valfuse-node/releases/tag/v0.0.1
