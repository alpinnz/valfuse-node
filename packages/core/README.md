# @valfuse-node/core

> Framework-agnostic schema validation, transformation, and error normalization engine.

## Installation

```bash
npm install @valfuse-node/core
```

## Features

- 🔒 **Type-safe schema definition** — full TypeScript inference on field rules
- ✅ **Validation** — string, number, boolean, array, object, and custom/refine rules
- 🔄 **Transformation** — trim, lowercase, uppercase, custom transformers via `t()`
- 🚩 **Error normalization** — consistent `ValfuseError` shape across all rule types
- 📦 **Zero dependencies** — no external runtime dependencies

## Quick Start

```typescript
import { createSchema, validateSchema, normalizeError } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    rules: { required: true, email: true },
  },
  age: {
    type: "number",
    rules: { required: true, min: 18 },
  },
});

const result = validateSchema(schema, { email: "invalid", age: 15 });
// result.isValid → false
// result.errors  → { email: ValfuseError, age: ValfuseError }
```

## API

### `createSchema(schema)`

Defines a `ValfuseSchema` with per-field rules, transformers, and nested object/array support.

### `validateSchema(schema, values)`

Validates `values` against `schema`. Returns `{ isValid, errors }`.

### `transformValues(schema, values)`

Applies all configured `transformers` (e.g. trim, lowercase) and returns a new values object.

### `normalizeError(raw)`

Normalizes a raw validation error into the standard `ValfuseError` shape `{ message, type, code? }`.

### `t(...transformers)`

Utility for composing field transformers:

```typescript
import { t } from "@valfuse-node/core";

const schema = createSchema({
  username: {
    type: "string",
    transformers: t("trim", "lowercase"),
    rules: { required: true, minLength: 3 },
  },
});
```

## Built-in Rules

| Rule | Types | Description |
|---|---|---|
| `required` | all | Field must be present and non-empty |
| `minLength` / `maxLength` | string | Character length bounds |
| `pattern` | string | Regex validation |
| `email` | string | Email format |
| `url` | string | URL format |
| `min` / `max` | number | Numeric bounds |
| `integer` | number | Must be a whole number |
| `minItems` / `maxItems` | array | Array length bounds |
| `refine` | generic | Custom async/sync validator function |
| `custom` | generic | Inline validation with full context |
| `matchField` | generic | Cross-field equality check |
| `oneOf` / `notOneOf` | generic | Allowlist / denylist |

## License

[MIT](./LICENSE)

