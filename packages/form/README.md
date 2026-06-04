# @valfuse-node/form

> Framework-agnostic form domain: schema definition, rule-based validation, value transformation, error normalization, and pure state-management primitives. Zero React/Vue dependencies — usable in Node.js, server actions, CLI tools, or any framework.

```bash
npm install @valfuse-node/form
```

---

## Table of Contents

- [Why `@valfuse-node/form`?](#why-valfuse-nodeform)
- [Quick Start](#quick-start)
- [Schema Definition](#schema-definition)
- [Built-in Rules](#built-in-rules)
- [Value Transformation](#value-transformation)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Framework-Agnostic State](#framework-agnostic-state)
- [Type Reference](#type-reference)
- [Development Usage](#development-usage)
- [License](#license)

---

## Why `@valfuse-node/form`?

The form package is the **shared contract** for the entire `@valfuse-node` ecosystem:

- **Use directly in Node.js / server actions** — no React or Vue required.
- **Use as the validation engine** for `useReactValfuseForm` / `useVueValfuseForm` — the adapters read the same `ValfuseSchema` and `ValfuseFormState` interfaces.
- **Type-safe end-to-end** — `defaultValues` infers the value type; `setErrors` is typed by your field names; `formState.errors` is a `Record<keyof TFieldValues, ValfuseFieldError>`.

```ts
import { createSchema, validateSchema, transformValues, t } from "@valfuse-node/form";
```

---

## Quick Start

```ts
import {
  createSchema,
  validateSchema,
  transformValues,
  t,
} from "@valfuse-node/form";

const schema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Email is required", code: "email.required" } },
      { name: "email",    error: { message: "Invalid email",    code: "email.invalid" } },
    ],
  },
  age: {
    type: "number",
    transform: t.toInteger,
    rules: [
      { name: "required", error: { message: "Required",  code: "age.required" } },
      { name: "min", value: 18, error: { message: "Must be 18+", code: "age.min" } },
    ],
  },
});

// 1. Coerce raw input (e.g. strings from <input>) to typed values
const typed = transformValues(schema, { email: "  ALICE@EXAMPLE.COM  ", age: "25" });
// → { email: "alice@example.com", age: 25 }

// 2. Validate the typed values
const errors = validateSchema(schema, typed);
// → {}  (passes)

// 3. Inject server errors if any
// form.setErrors({ email: { message: "Already registered", code: "auth.duplicate" } });
```

---

## Schema Definition

`createSchema(definition)` is an identity function whose only job is to give you **autocomplete and type inference** for the schema.

```ts
import { createSchema } from "@valfuse-node/form";

const schema = createSchema({
  // ─── string fields ──────────────────────────────────────────────────────────
  name: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "minLength", value: 2, error: { message: "Min 2 chars" } },
      { name: "maxLength", value: 50, error: { message: "Max 50 chars" } },
    ],
  },

  // ─── number fields ──────────────────────────────────────────────────────────
  age: {
    type: "number",
    transform: t.toInteger,            // optional pre-validation coercion
    rules: [
      { name: "min", value: 0, error: { message: "Must be ≥ 0" } },
      { name: "max", value: 120, error: { message: "Must be ≤ 120" } },
      { name: "int", error: { message: "Whole numbers only" } },
    ],
  },

  // ─── boolean fields ─────────────────────────────────────────────────────────
  agreed: {
    type: "boolean",
    rules: [
      { name: "accepted", error: { message: "You must accept the terms" } },
    ],
  },

  // ─── array fields ───────────────────────────────────────────────────────────
  tags: {
    type: "array",
    rules: [
      { name: "minItems", value: 1, error: { message: "Add at least 1 tag" } },
      { name: "maxItems", value: 10, error: { message: "Max 10 tags" } },
    ],
  },

  // ─── object fields (nested) ─────────────────────────────────────────────────
  address: {
    type: "object",
    rules: [
      { name: "required", error: { message: "Address is required" } },
    ],
  },
});
```

### Supported field types

| Type | Description |
|---|---|
| `"string"` | Free text, validated by string rules |
| `"number"` | Coerced numeric value (use `transform: t.toNumber` to coerce raw strings) |
| `"boolean"` | `true` / `false` |
| `"array"` | Any array (length-based rules only — element validation is a `custom` rule) |
| `"object"` | Any object (shape and presence rules only) |

---

## Built-in Rules

### String rules

| Rule | Value | Example |
|---|---|---|
| `required` | — | `{ name: "required", error: { message: "Required" } }` |
| `min` | `number` (length) | `{ name: "min", value: 3, error: … }` |
| `max` | `number` (length) | `{ name: "max", value: 100, error: … }` |
| `length` | `number` (exact length) | `{ name: "length", value: 10, error: … }` |
| `email` | — | `{ name: "email", error: … }` |
| `url` | — | `{ name: "url", error: … }` |
| `uuid` | — | `{ name: "uuid", error: … }` |
| `regex` | `RegExp` or `{ pattern, flags }` | `{ name: "regex", value: /^[a-z]+$/, error: … }` |
| `includes` | `string` | `{ name: "includes", value: "@", error: … }` |
| `startsWith` | `string` | `{ name: "startsWith", value: "https://", error: … }` |
| `endsWith` | `string` | `{ name: "endsWith", value: ".com", error: … }` |

### Number rules

| Rule | Value | Notes |
|---|---|---|
| `required` | — | Rejects `null`, `undefined`, `NaN` |
| `min` | `number` | Inclusive lower bound |
| `max` | `number` | Inclusive upper bound |
| `gt` | `number` | Strictly greater than |
| `gte` | `number` | Greater than or equal |
| `lt` | `number` | Strictly less than |
| `lte` | `number` | Less than or equal |
| `int` | — | Rejects non-integers |
| `positive` | — | `> 0` |
| `nonnegative` | — | `≥ 0` |
| `negative` | — | `< 0` |
| `nonpositive` | — | `≤ 0` |
| `multipleOf` | `number` | `value % multipleOf === 0` |

### Boolean rules

| Rule | Value | Notes |
|---|---|---|
| `required` | — | Rejects `null`, `undefined`, `false` |
| `literal` | `boolean` | Must match exactly |
| `accepted` | — | Sugar for `literal: true` (terms-of-service pattern) |

### Array rules

| Rule | Value |
|---|---|
| `required` | — |
| `min` | `number` (min length) |
| `max` | `number` (max length) |
| `length` | `number` (exact length) |
| `nonempty` | — (length ≥ 1) |

### Object rules

| Rule | Value |
|---|---|
| `required` | — (rejects `null` / `undefined`) |
| `shape` | `Record<string, unknown>` (key set must match) |

### Generic (all types)

| Rule | Shape | Use |
|---|---|---|
| `custom` | `{ name: "custom", validate: (v, all) => boolean, error }` | Ad-hoc validator with access to all values |
| `refine` | Same as `custom` | Alias — same implementation, different intent name |
| `matchField` | `{ name: "matchField", value: "<other-field-name>", error }` | Cross-field equality (e.g. password confirmation) |
| `oneOf` | `{ name: "oneOf", value: unknown[], error }` | Value must be in the list |
| `notOneOf` | `{ name: "notOneOf", value: unknown[], error }` | Value must NOT be in the list |

**Example — cross-field password match:**

```ts
const schema = createSchema({
  password:        { type: "string", rules: [{ name: "required", error: { message: "Required" } }] },
  confirmPassword: { type: "string", rules: [{ name: "matchField", value: "password", error: { message: "Passwords do not match" } }] },
});
```

**Example — custom rule with access to sibling values:**

```ts
const schema = createSchema({
  startDate: { type: "string", rules: [{ name: "required", error: { message: "Required" } }] },
  endDate: {
    type: "string",
    rules: [
      {
        name: "custom",
        validate: (value, all) => new Date(value as string) > new Date(all.startDate as string),
        error: { message: "End date must be after start date" },
      },
    ],
  },
});
```

---

## Value Transformation

`transform` runs **before validation and before submission**. It is a single function or a `t.pipe(...)` composition.

### Built-in transformers (`t`)

```ts
import { t } from "@valfuse-node/form";

// ─── String transformers ──────────────────────────────────────────────────────
t.trim             // "  hi  " → "hi"
t.trimStart        // "  hi  " → "hi  "
t.trimEnd          // "  hi  " → "  hi"
t.toLowerCase      // "Hi" → "hi"
t.toUpperCase      // "hi" → "HI"
t.toTitleCase      // "hello world" → "Hello World"
t.toSentenceCase   // "HELLO" → "Hello"
t.collapseSpaces   // "a   b" → "a b"

// ─── Coercion transformers ───────────────────────────────────────────────────
t.toNumber         // "42" → 42   (returns original if NaN)
t.toInteger        // "42.7" → 42
t.toFloat          // "3.14" → 3.14
t.toBoolean        // "true"/"1"/1/true → true; everything else → false

// ─── Composition ──────────────────────────────────────────────────────────────
t.pipe(t.trim, t.toLowerCase)   // compose left-to-right
```

### Custom transformers

Any function `(value: unknown) => unknown` is a valid transformer:

```ts
const slugify = (v: unknown) =>
  typeof v === "string" ? v.toLowerCase().replace(/\s+/g, "-") : v;

const schema = createSchema({
  slug: {
    type: "string",
    transform: slugify,
    rules: [{ name: "required", error: { message: "Required" } }],
  },
});
```

### `transformValues(schema, values)`

Apply all per-field transforms in one call — the canonical pre-submit pipeline:

```ts
import { transformValues } from "@valfuse-node/form";

const typed = transformValues(schema, { email: "  Alice@Example.com  ", age: "25" });
// → { email: "alice@example.com", age: 25 }
```

Fields without a `transform` are passed through unchanged. The original `values` object is **never mutated**.

---

## Validation

```ts
import { validateSchema } from "@valfuse-node/form";

const errors = validateSchema(loginSchema, {
  email: "bad",
  password: "123",
});
// → {
//   email:    { message: "Invalid email format", type: "validation", code: "email.invalid" },
//   password: { message: "Min 8 chars",          type: "validation", code: "password.min" },
// }
```

**Returns:** `Record<string, ValfuseError>`. Empty object `{}` means valid.

**Error shape:**

```ts
interface ValfuseError {
  message: string;                           // user-facing message
  type?: "validation" | "server" | "manual" | "custom";
  code?: string;                             // semantic code (e.g. "email.required")
  metadata?: Record<string, unknown>;        // extra context
}
```

> **Note:** `validateSchema` returns the first error per field (rules are evaluated in order, and validation short-circuits on the first error). Order your rules from cheapest → most expensive.

---

## Error Handling

### `normalizeError(error)`

```ts
import { normalizeError } from "@valfuse-node/form";

normalizeError("Something went wrong");
// → { message: "Something went wrong" }

normalizeError({ message: "Boom", code: "boom.explode" });
// → { message: "Boom", code: "boom.explode" }
```

Useful when you need to merge API errors (which may be strings or objects) into the same shape your form expects.

### `ValfuseFieldError` (the shape used by adapters)

```ts
interface ValfuseFieldError {
  message: string;
  type?: string;                              // "validation" | "server" | "manual" | "custom"
  code?: string;                              // e.g. "email.required", "auth.not_found"
  metadata?: Record<string, unknown>;
}
```

### Error types by origin

| `type` | Origin | Typical use |
|---|---|---|
| `"validation"` | A schema rule failed | Automatic — emitted by `validateSchema` |
| `"server"` | Injected via `form.setErrors` after a failed API call | Manual |
| `"manual"` | Injected via `form.setErrors` for client-only logic | Manual |
| `"custom"` | Returned by a `custom` / `refine` rule | Automatic — but tagged "custom" so consumers can distinguish |

---

## Framework-Agnostic State

If you want the same form-state primitives the React/Vue adapters use internally, you can import them directly. **Most consumers will not need this** — use `useReactValfuseForm` or `useVueValfuseForm` instead. This is exposed for adapter authors and for non-framework usage (e.g. CLI tools, server actions).

### Values

```ts
import { createValuesState, updateValue, resetValues, computeIsDirty, computeDirtyFields } from "@valfuse-node/form";

const state = createValuesState({ email: "", age: 0 });
updateValue(state, "email", "alice@example.com");
const isDirty = computeIsDirty(state, { email: "", age: 0 });
// → true
const dirty = computeDirtyFields(state, { email: "", age: 0 });
// → { email: true }
resetValues(state, { email: "", age: 0 });
```

### Touched

```ts
import { createTouchedState, markTouched, isTouched, toTouchedFieldsRecord } from "@valfuse-node/form";

const touched = createTouchedState();
markTouched(touched, "email");
isTouched(touched, "email");              // true
toTouchedFieldsRecord(touched);            // { email: true }
```

### Errors

```ts
import { createErrorsState, setFieldError, clearFieldErrors, hasErrors, getFieldError, toFormErrors } from "@valfuse-node/form";

const errors = createErrorsState();
setFieldError(errors, "email", { message: "Taken", code: "auth.duplicate" });
hasErrors(errors);                          // true
getFieldError(errors, "email");             // { message: "Taken", code: "auth.duplicate" }
clearFieldErrors(errors);
toFormErrors(errors);                       // {} (object form)
```

### Submission

```ts
import { createSubmissionState, startSubmit, endSubmitSuccess, endSubmitFailure, resetSubmission } from "@valfuse-node/form";

const sub = createSubmissionState();
startSubmit(sub);
try {
  await api.call();
  endSubmitSuccess(sub);
} catch (err) {
  endSubmitFailure(sub);
} finally {
  // sub.isSubmitting === false
}
```

---

## Type Reference

### `ValfuseSchema`

```ts
type ValfuseSchema = Record<string, ValfuseFieldSchema>;

type ValfuseFieldSchema =
  | ValfuseStringFieldSchema
  | ValfuseNumberFieldSchema
  | ValfuseBooleanFieldSchema
  | ValfuseArrayFieldSchema
  | ValfuseObjectFieldSchema;

interface ValfuseStringFieldSchema {
  type: "string";
  rules: (ValfuseStringRule | ValfuseGenericRule)[];
  transform?: ValfuseTransformer;
}
// (same shape for the other four types)
```

### Rule types

Every rule is a discriminated union member with a discriminator field. The TypeScript type for each field's `rules` array is the union of type-specific rules plus the generic ones.

```ts
// Generic (work on any field type)
type ValfuseGenericRule =
  | { name: "custom";     validate: (v, all) => boolean; error: ValfuseRuleError }
  | { name: "refine";     validate: (v, all) => boolean; error: ValfuseRuleError }
  | { name: "matchField"; value: string;                 error: ValfuseRuleError }
  | { name: "oneOf";      value: unknown[];              error: ValfuseRuleError }
  | { name: "notOneOf";   value: unknown[];              error: ValfuseRuleError };
```

### Error types

```ts
type ValfuseErrorType = "validation" | "server" | "manual" | "custom";

interface ValfuseError {
  message: string;
  type?: ValfuseErrorType | string;
  code?: string;
  metadata?: Record<string, unknown>;
}

type ValfuseFieldErrors<TFieldName extends string = string> = Partial<
  Record<TFieldName, string | ValfuseError>
>;
```

---

## Development Usage

### Use it in a Node.js script

```ts
// scripts/validate-signup.ts
import { createSchema, validateSchema, transformValues } from "@valfuse-node/form";

const schema = createSchema({
  email: { type: "string", transform: (v) => String(v).toLowerCase(), rules: [{ name: "required", error: { message: "Required" } }] },
});

const input = process.argv[2] ?? "";
const errors = validateSchema(schema, transformValues(schema, { email: input }));

if (Object.keys(errors).length) {
  console.error("Invalid:", errors);
  process.exit(1);
}
console.log("OK");
```

```bash
npx tsx scripts/validate-signup.ts "alice@example.com"
```

### Use it in a server action

```ts
// app/actions/signup.ts
"use server";
import { createSchema, validateSchema, transformValues, normalizeError } from "@valfuse-node/form";

const schema = createSchema({
  email:    { type: "string", rules: [{ name: "required", error: { message: "Email required" } }, { name: "email", error: { message: "Invalid" } }] },
  password: { type: "string", rules: [{ name: "required", error: { message: "Password required" } }, { name: "minLength", value: 8, error: { message: "Min 8" } }] },
});

export async function signupAction(formData: FormData) {
  const typed = transformValues(schema, {
    email:    String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  const errors = validateSchema(schema, typed);

  if (Object.keys(errors).length) {
    return { ok: false, errors };
  }
  // … DB insert
  return { ok: true };
}
```

### Use it as the source-of-truth schema for React/Vue adapters

```ts
// schemas/user.ts  (shared by web + mobile)
import { createSchema } from "@valfuse-node/form";
export const userSchema = createSchema({ /* … */ });
```

```tsx
// web (React)
import { useReactValfuseForm } from "@valfuse-node/core";
const form = useReactValfuseForm({ schema: userSchema, defaultValues: { … } });
```

```vue
<!-- mobile (Vue) -->
<script setup>
import { useVueValfuseForm } from "@valfuse-node/core";
const form = useVueValfuseForm({ schema: userSchema, defaultValues: { … } });
</script>
```

---

## License

[MIT](../../LICENSE)
