# Changelog — @valfuse-node/core

All notable changes to this package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

---

## [0.0.2] — 2026-05-26

### Changed

- Internal rule files renamed for naming consistency:
  - `rules/string.rules.ts` → `rules/string.rule.ts`
  - `rules/number.rules.ts` → `rules/number.rule.ts`
  - `rules/boolean.rules.ts` → `rules/boolean.rule.ts`
  - `rules/array.rules.ts` → `rules/array.rule.ts`
  - `rules/object.rules.ts` → `rules/object.rule.ts`
  - `rules/custom.rules.ts` → `rules/generic.rule.ts`
- `SetErrorsInput` type moved from `errors/set-errors.types.ts` into `types.ts` — no API change

> No breaking changes. Public API and dist output are identical to `0.0.1`.

---

## [0.0.1] — 2026-05-19

### Added

**Core functions**
- `createSchema(definition)` — config-first schema builder with TypeScript inference
- `validateSchema(schema, values)` — native schema validation engine; returns first failing rule per field
- `normalizeError(error)` — utility to normalize `string | ValfuseError` to `ValfuseError`

**String rules** (`type: "string"`)
- `required` — fails when empty or whitespace-only
- `min` — minimum string length
- `max` — maximum string length
- `length` — exact string length
- `email` — valid email format check
- `url` — valid HTTP/HTTPS URL check
- `uuid` — valid UUID format check
- `regex` — matches `RegExp` or `{ pattern, flags? }` config
- `includes` — must include substring
- `startsWith` — must start with string
- `endsWith` — must end with string

**Number rules** (`type: "number"`)
- `required`, `min`, `max`, `gt`, `gte`, `lt`, `lte`
- `int`, `positive`, `nonnegative`, `negative`, `nonpositive`, `multipleOf`

**Boolean rules** (`type: "boolean"`)
- `required`, `literal`, `accepted`

**Array rules** (`type: "array"`)
- `required`, `min`, `max`, `length`, `nonempty`

**Object rules** (`type: "object"`)
- `required`, `shape`

**Generic rules** (any field type)
- `custom` — custom `(value, allValues) => boolean` validation
- `refine` — alias for `custom`
- `matchField` — must match value of another field
- `oneOf` — value must be in allowed list
- `notOneOf` — value must not be in blocked list

**TypeScript types**
- `ValfuseSchema`, `ValfuseFieldSchema`, `ValfuseFieldType`
- `ValfuseError`, `ValfuseErrorType`, `ValfuseRuleError`, `ValfuseFieldErrors`
- `ValfuseRegexValue`
- All field-specific rule types (`ValfuseStringRule`, `ValfuseNumberRule`, etc.)
- All generic rule types (`ValfuseCustomRule`, `ValfuseMatchFieldRule`, etc.)

---

[Unreleased]: https://github.com/alpinnz/valfuse-node/compare/core-v0.0.2...HEAD
[0.0.2]: https://github.com/alpinnz/valfuse-node/compare/core-v0.0.1...core-v0.0.2
[0.0.1]: https://github.com/alpinnz/valfuse-node/releases/tag/core-v0.0.1

