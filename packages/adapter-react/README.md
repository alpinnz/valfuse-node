# @valfuse-node/adapter-react

Native React form adapter for `valfuse-node`.

Connect native schema validation from `@valfuse-node/core` to your React forms — with full support for `register()`, `ValfuseController`, and server-side error injection via `form.setErrors()`.

Zero dependency on `react-hook-form` or any external form library.

---

## Installation

```bash
npm install @valfuse-node/adapter-react @valfuse-node/core
```

### Peer Dependencies

| Package | Version |
|---|---|
| `react` | `>=18` |
| `react-dom` | `>=18` |

---

## Overview

| Export | Description |
|---|---|
| `useValfuseForm(props)` | Native React hook — form state, validation, and error management |
| `ValfuseController` | Controlled field wrapper for complex inputs (dropdowns, date-pickers, etc.) |

---

## Quick Start

```tsx
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/adapter-react";

const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email wajib diisi", code: "email.required" } },
      { name: "email",    error: { message: "Format email tidak valid", code: "email.invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Password wajib diisi", code: "password.required" } },
      { name: "min", value: 8, error: { message: "Password minimal 8 karakter", code: "password.min" } },
    ],
  },
});

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const form = useValfuseForm<LoginFormValues>({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await submitLoginApi(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("email")} placeholder="Email" />
      <p>{form.formState.errors.email?.message}</p>

      <input type="password" {...form.register("password")} placeholder="Password" />
      <p>{form.formState.errors.password?.message}</p>

      <button type="submit" disabled={form.formState.isSubmitting}>
        Login
      </button>
    </form>
  );
}
```

---

## API Reference

### `useValfuseForm(props)`

```ts
const form = useValfuseForm<TFieldValues>({
  schema,        // ValfuseSchema — required
  defaultValues, // TFieldValues  — required
  mode,          // ValfuseFormMode — default: "onSubmit"
});
```

#### `mode` — Validation Mode

Controls **when** validation is triggered. Mirrors react-hook-form's `mode` option:

| Mode | Validation runs when… |
|---|---|
| `"onSubmit"` *(default)* | Form is submitted |
| `"onBlur"` | A field loses focus |
| `"onChange"` | A field value changes (every keystroke) |
| `"onTouched"` | First blur → validates; then every change after that |
| `"all"` | Both `onChange` and `onBlur` |

```tsx
// Validate once blurred, keep validating on every change after that
const form = useValfuseForm({ schema, defaultValues, mode: "onTouched" });

// Validate on every keystroke AND every blur
const form = useValfuseForm({ schema, defaultValues, mode: "all" });
```

#### Return Value

| Property / Method | Type | Description |
|---|---|---|
| `form.register(name)` | `ValfuseRegisterReturn` | Register native inputs or `forwardRef` components |
| `form.control` | `ValfuseFormControl` | Pass to `<ValfuseController control={...} />` |
| `form.handleSubmit(onValid)` | `function` | Validates with schema, calls `onValid(values)` on success |
| `form.setErrors(errors)` | `void` | Inject external/server errors per field |
| `form.clearErrors(name?)` | `void` | Clear one, many, or all field errors |
| `form.setValue(name, value, options?)` | `void` | Set a field value; pass `{ shouldValidate: true }` to validate immediately |
| `form.trigger(name?)` | `boolean` | Manually trigger validation; returns `true` if all triggered fields are valid |
| `form.watch()` | `TFieldValues` | Returns all current field values |
| `form.watch(name)` | `TFieldValues[name]` | Returns the current value of a single field |
| `form.watch(names[])` | `Array` | Returns an array of values in the same order as `names` |
| `form.watch(callback)` | `() => void` | Subscribe to value changes; returns an unsubscribe function |
| `form.reset(values?)` | `void` | Reset to default values (or provided partial values) |

#### `form.formState`

| Property | Type | Description |
|---|---|---|
| `errors` | `ValfuseFormErrors<TFieldValues>` | Typed field errors — `.message`, `.code`, `.type`, `.metadata` |
| `isSubmitting` | `boolean` | `true` while async `onValid` handler is running |
| `isSubmitted` | `boolean` | `true` after the form has been submitted at least once |
| `isSubmitSuccessful` | `boolean` | `true` if the most recent submission passed validation and `onValid` resolved |
| `submitCount` | `number` | Total submit attempts — resets to `0` on `reset()` |
| `isDirty` | `boolean` | `true` if any field value differs from its `defaultValue` |
| `isValid` | `boolean` | `true` if there are currently no validation errors |
| `dirtyFields` | `{ [K]?: boolean }` | Map of fields whose value has changed from the default |
| `touchedFields` | `{ [K]?: boolean }` | Map of fields the user has interacted with (focused + blurred) |
| `defaultValues` | `TFieldValues` | The `defaultValues` passed to `useValfuseForm` |

```tsx
// Submission state
{form.formState.isSubmitting && <Spinner />}
{form.formState.isSubmitted && !form.formState.isSubmitSuccessful && (
  <p>Submit gagal, periksa kembali form.</p>
)}
<span>Submit ke-{form.formState.submitCount}</span>

// Dirty & touched
{form.formState.isDirty && <p>Ada perubahan yang belum disimpan.</p>}
{form.formState.dirtyFields.email && <Badge>Diubah</Badge>}

// Validity
<button type="submit" disabled={form.formState.isSubmitting}>
  {form.formState.isValid ? "Simpan" : "Perbaiki Form"}
</button>
```

---

### `form.setValue(name, value, options?)`

Programmatically set a field value.

```ts
// Set value only — no validation
form.setValue("email", "user@example.com");

// Set value and validate immediately
form.setValue("email", "user@example.com", { shouldValidate: true });
```

---

### `form.watch`

Watch field values reactively — mirrors react-hook-form's `watch` API.

#### Watch all fields

```ts
const values = form.watch();
// → { email: "...", password: "..." }
```

#### Watch a single field

```ts
const email = form.watch("email");
// → string (current value of the email field)
```

#### Watch multiple fields

```ts
const [email, password] = form.watch(["email", "password"]);
// → values in the same order as the names array
```

#### Subscribe to changes (callback)

```ts
// Subscribe — callback is called on every value change
const unsubscribe = form.watch((values, info) => {
  console.log("changed field:", info.name);
  console.log("all values:", values);
});

// Stop receiving notifications
unsubscribe();
```

> The callback variant is useful for **side-effects** (e.g. fetching dependent data when a field changes) without causing extra re-renders.

---

### `form.trigger(name?)`

Manually trigger validation without submitting. Returns `true` if all triggered fields are valid.

```ts
// Validate all fields
const isValid = form.trigger();

// Validate a single field
form.trigger("email");

// Validate multiple specific fields
form.trigger(["email", "password"]);
```

---

### `form.setErrors(errors)`

Injects external errors (e.g. from API responses) into `form.formState.errors`.

```ts
// Simple string errors
form.setErrors({
  email: "Email tidak terdaftar",
});

// Detailed errors with code
form.setErrors({
  email: {
    message: "Email tidak terdaftar",
    type: "server",
    code: "auth.email.not_found",
  },
  password: {
    message: "Password salah",
    type: "server",
    code: "auth.password.mismatch",
  },
});
```

UI reads errors the same way regardless of source:

```tsx
form.formState.errors.email?.message  // → string | undefined
form.formState.errors.email?.code     // → string | undefined
```

---

### `ValfuseController`

Use `ValfuseController` for **complex inputs** (dropdowns, date-pickers, etc.) that cannot be registered with `form.register(name)`.

The `fieldState.error` render prop is typed as `ValfuseFieldError | undefined` — both `.message` and `.code` are available without any cast.

```tsx
import { useValfuseForm, ValfuseController } from "@valfuse-node/adapter-react";

<ValfuseController
  control={form.control}
  name="roleId"
  render={({ field, fieldState }) => (
    <RoleDropdown
      value={field.value}
      onChange={field.onChange}   // receives raw value, not a DOM event
      onBlur={field.onBlur}
      error={fieldState.error?.code}
    />
  )}
/>
```

---

## Patterns

### When to use `register()`

Use `register()` for **native HTML inputs** or components that use `React.forwardRef`:

```tsx
<TextInput
  label="Email"
  error={form.formState.errors.email?.code}
  {...form.register("email")}
/>
```

### When to use `ValfuseController`

Use `ValfuseController` for **custom controlled components** that manage their own internal state:

```tsx
<ValfuseController
  control={form.control}
  name="role"
  render={({ field, fieldState }) => (
    <RoleDropdownObject
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.code}
    />
  )}
/>
```

### When to use `roleId: string` vs `role: Role | null`

#### `roleId: string` — when the API only needs an ID

```ts
type FormValues = { roleId: string };
// Schema field: type: "string", rules: [{ name: "required", ... }]
```

#### `role: Role | null` — when the UI needs the full object

```ts
type Role = { id: string; name: string };
type FormValues = { role: Role | null };
// Schema field: type: "object", rules: [{ name: "required", ... }]
```

---

## Error Flow

All errors — schema validation, manual trigger, and server — flow into the same place:

```
Schema errors (mode: onSubmit / onChange / onBlur / onTouched / all)  ──┐
Manual trigger (form.trigger())                                         ├──→ form.formState.errors.fieldName
Server errors  (form.setErrors())                                       ──┘
```

UI reads:

```tsx
{form.formState.errors.email?.message}
{form.formState.errors.email?.code}
```

---

## API Error Mapping Example

```ts
function mapApiValidationErrors(response: ApiValidationErrorResponse) {
  return Object.fromEntries(
    response.errors?.map((err) => [
      err.field,
      { message: err.message, type: "server", code: err.code },
    ]) ?? []
  );
}

const onSubmit = form.handleSubmit(async (values) => {
  try {
    await submitApi(values);
  } catch (err) {
    const apiError = err as { response: { data: ApiValidationErrorResponse } };
    form.setErrors(mapApiValidationErrors(apiError.response.data));
  }
});
```

---

## TypeScript

```ts
import type {
  UseValfuseFormReturn,
  ValfuseFieldError,
  ValfuseFormErrors,
  ValfuseDirtyFields,
  ValfuseTouchedFields,
  ValfuseFormState,
  ValfuseFormControl,
  ValfuseControllerProps,
  ValfuseWatchCallback,
  ValfuseWatchFunction,
} from "@valfuse-node/adapter-react";

import type { ValfuseFieldErrors } from "@valfuse-node/core";
```

The hook is fully generic:

```ts
const form = useValfuseForm<MyFormValues>({ schema, defaultValues });
//    ^— typed as UseValfuseFormReturn<MyFormValues>

// formState is fully typed — all properties are inferred from MyFormValues
form.formState.dirtyFields.email    // boolean | undefined
form.formState.touchedFields.email  // boolean | undefined
form.formState.errors.email?.code   // string | undefined
```

---

## License

MIT
