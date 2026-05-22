# @valfuse-node/core

Native config-first schema validation engine.

No Zod. No localization dependency. No UI framework coupling.

---

## Installation

```bash
npm install @valfuse-node/core
```

---

## Overview

`@valfuse-node/core` provides two main functions:

| Function | Description |
|---|---|
| `createSchema(definition)` | Defines a validation schema |
| `validateSchema(schema, values)` | Validates form values against a schema |

---

## Quick Start

```ts
import { createSchema, validateSchema } from "@valfuse-node/core";

const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      {
        name: "required",
        error: { message: "Email wajib diisi", code: "login.email.required" },
      },
      {
        name: "email",
        error: { message: "Format email tidak valid", code: "login.email.invalid" },
      },
    ],
  },
  password: {
    type: "string",
    rules: [
      {
        name: "required",
        error: { message: "Password wajib diisi", code: "login.password.required" },
      },
      {
        name: "min",
        value: 8,
        error: { message: "Password minimal 8 karakter", code: "login.password.min" },
      },
    ],
  },
});

const errors = validateSchema(loginSchema, { email: "", password: "abc" });
// errors.email?.message    → "Email wajib diisi"
// errors.password?.message → "Password minimal 8 karakter"
```

---

## API Reference

### `createSchema(definition)`

Defines a typed validation schema. Returns the definition as-is — primarily used for TypeScript inference and readability.

```ts
const schema = createSchema({
  fieldName: {
    type: "string" | "number" | "boolean" | "array" | "object",
    rules: [/* rule objects */],
  },
});
```

### `validateSchema(schema, values)`

Validates form values against the schema. Returns an object of field errors — only the **first failing rule** per field is returned.

```ts
const errors = validateSchema(schema, values);
// Returns: Record<string, ValfuseError>

errors.fieldName?.message   // string  — always present on error
errors.fieldName?.code      // string? — optional error code
errors.fieldName?.type      // string? — error type
errors.fieldName?.metadata  // Record<string, unknown>? — extra data
```

Returns an empty object `{}` when all values are valid.

### `normalizeError(error)`

Normalizes a `string | ValfuseError` to a `ValfuseError` object. Used internally in adapters.

```ts
normalizeError("Email salah")
// → { message: "Email salah" }

normalizeError({ message: "Email salah", type: "server", code: "email.invalid" })
// → { message: "Email salah", type: "server", code: "email.invalid" }
```

---

## Field Types

| Type | Value | Description |
|---|---|---|
| `"string"` | `string` | Text input values |
| `"number"` | `number` | Numeric input values |
| `"boolean"` | `boolean` | Checkbox / toggle values |
| `"array"` | `unknown[]` | Multi-select / tag list values |
| `"object"` | `object \| null` | Dropdown with full object value |

---

## Rules Reference

Rules validate the value of a single field. The **first** failing rule per field stops the chain and returns its error.

### String Rules

Apply to fields with `type: "string"`.

| Rule | `value` | Fails when |
|---|---|---|
| `required` | — | Empty string or whitespace-only |
| `min` | `number` | String length is less than `value` |
| `max` | `number` | String length is greater than `value` |
| `length` | `number` | String length is not exactly `value` |
| `email` | — | Not a valid email format |
| `url` | — | Not a valid HTTP/HTTPS URL |
| `uuid` | — | Not a valid UUID format |
| `regex` | `RegExp \| { pattern, flags? }` | Does not match the pattern |
| `includes` | `string` | Does not include the substring |
| `startsWith` | `string` | Does not start with the string |
| `endsWith` | `string` | Does not end with the string |

```ts
{ name: "required", error: { message: "Wajib diisi" } }
{ name: "min", value: 3, error: { message: "Minimal 3 karakter" } }
{ name: "max", value: 100, error: { message: "Maksimal 100 karakter" } }
{ name: "email", error: { message: "Format email tidak valid" } }
{ name: "url", error: { message: "Format URL tidak valid" } }
{ name: "regex", value: /^[a-z]+$/, error: { message: "Hanya huruf kecil" } }
{ name: "includes", value: "@", error: { message: "Harus mengandung @" } }
{ name: "startsWith", value: "+62", error: { message: "Harus diawali +62" } }
{ name: "endsWith", value: ".com", error: { message: "Harus diakhiri .com" } }
```

### Number Rules

Apply to fields with `type: "number"`.

| Rule | `value` | Fails when |
|---|---|---|
| `required` | — | Null, undefined, empty, or NaN |
| `min` | `number` | Less than `value` |
| `max` | `number` | Greater than `value` |
| `gt` | `number` | Not greater than `value` |
| `gte` | `number` | Not greater than or equal to `value` |
| `lt` | `number` | Not less than `value` |
| `lte` | `number` | Not less than or equal to `value` |
| `int` | — | Not an integer |
| `positive` | — | Less than or equal to 0 |
| `nonnegative` | — | Less than 0 |
| `negative` | — | Greater than or equal to 0 |
| `nonpositive` | — | Greater than 0 |
| `multipleOf` | `number` | Not a multiple of `value` |

```ts
{ name: "required", error: { message: "Wajib diisi" } }
{ name: "min", value: 0, error: { message: "Tidak boleh negatif" } }
{ name: "max", value: 100, error: { message: "Maksimal 100" } }
{ name: "int", error: { message: "Harus bilangan bulat" } }
{ name: "positive", error: { message: "Harus bernilai positif" } }
```

### Boolean Rules

Apply to fields with `type: "boolean"`.

| Rule | `value` | Fails when |
|---|---|---|
| `required` | — | Null or undefined |
| `literal` | `boolean` | Not exactly equal to `value` |
| `accepted` | — | Falsy |

```ts
{ name: "accepted", error: { message: "Harus disetujui" } }
{ name: "literal", value: true, error: { message: "Harus bernilai true" } }
```

### Array Rules

Apply to fields with `type: "array"`.

| Rule | `value` | Fails when |
|---|---|---|
| `required` | — | Not an array |
| `min` | `number` | Array length is less than `value` |
| `max` | `number` | Array length is greater than `value` |
| `length` | `number` | Array length is not exactly `value` |
| `nonempty` | — | Array is empty |

```ts
{ name: "nonempty", error: { message: "Pilih minimal satu" } }
{ name: "min", value: 2, error: { message: "Pilih minimal 2 item" } }
```

### Object Rules

Apply to fields with `type: "object"`.

| Rule | `value` | Fails when |
|---|---|---|
| `required` | — | Null or undefined |
| `shape` | `object` | Not an object type |

```ts
{ name: "required", error: { message: "Wajib dipilih" } }
```

### Generic Rules

Can be used with **any field type** for cross-field validation or custom logic.

| Rule | Description |
|---|---|
| `custom` | Custom validation function `(value, allValues) => boolean` |
| `refine` | Alias for `custom` |
| `matchField` | Must match the value of another field (by field name) |
| `oneOf` | Must be one of the given values |
| `notOneOf` | Must not be one of the given values |

```ts
// matchField — confirm password
{
  name: "matchField",
  value: "password",
  error: { message: "Konfirmasi password tidak sesuai" },
}

// custom — cross-field conditional validation
{
  name: "custom",
  validate: (value, allValues) => {
    if (allValues.role === "admin") return value !== "";
    return true;
  },
  error: { message: "Admin wajib mengisi field ini" },
}

// oneOf — whitelist
{
  name: "oneOf",
  value: ["admin", "staff", "viewer"],
  error: { message: "Role tidak valid" },
}

// notOneOf — blacklist
{
  name: "notOneOf",
  value: ["root", "superadmin"],
  error: { message: "Role tidak diizinkan" },
}
```

---

## Regex Rule

Supports two formats:

```ts
// RegExp object
{
  name: "regex",
  value: /^[a-zA-Z0-9_]+$/,
  error: { message: "Hanya alfanumerik dan underscore" },
}

// Pattern config (useful for configs that cannot carry RegExp objects)
{
  name: "regex",
  value: { pattern: "^[a-zA-Z0-9_]+$", flags: "i" },
  error: { message: "Hanya alfanumerik dan underscore" },
}
```

---

## Error Model

Each rule defines its error using `ValfuseRuleError`:

```ts
type ValfuseRuleError = {
  message: string;                     // required — displayed in UI
  code?: string;                       // optional — for programmatic handling
  type?: string;                       // optional — error category
  metadata?: Record<string, unknown>;  // optional — extra context
};
```

`validateSchema` returns `Record<string, ValfuseError>`:

```ts
type ValfuseErrorType = "validation" | "server" | "manual" | "custom";

type ValfuseError = {
  message: string;
  type?: ValfuseErrorType | string;
  code?: string;
  metadata?: Record<string, unknown>;
};
```

---

## Validation Behavior

- Rules are evaluated **in order** per field.
- Validation **stops at the first failing rule** per field.
- All fields are validated **independently** — errors from multiple fields are returned together.
- Generic rules (`custom`, `matchField`, etc.) receive all form values as the second argument.

---

## TypeScript

All public types are exported from the package entry point:

```ts
import type {
  ValfuseSchema,
  ValfuseFieldSchema,
  ValfuseError,
  ValfuseErrorType,
  ValfuseFieldErrors,
  ValfuseRuleError,
  ValfuseRegexValue,
  // Field schemas
  ValfuseStringFieldSchema,
  ValfuseNumberFieldSchema,
  ValfuseBooleanFieldSchema,
  ValfuseArrayFieldSchema,
  ValfuseObjectFieldSchema,
  // String rules
  ValfuseStringRule,
  ValfuseStringRequiredRule,
  ValfuseStringMinRule,
  ValfuseStringEmailRule,
  ValfuseStringRegexRule,
  // Number rules
  ValfuseNumberRule,
  // Boolean rules
  ValfuseBooleanRule,
  // Array rules
  ValfuseArrayRule,
  // Object rules
  ValfuseObjectRule,
  // Generic rules
  ValfuseGenericRule,
  ValfuseCustomRule,
  ValfuseRefineRule,
  ValfuseMatchFieldRule,
  ValfuseOneOfRule,
  ValfuseNotOneOfRule,
} from "@valfuse-node/core";
```

---

## License

MIT
