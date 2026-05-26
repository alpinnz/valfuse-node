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
  mode,          // "onSubmit" | "onChange" | "onBlur" — default: "onSubmit"
});
```

#### Return Value

| Property | Description |
|---|---|
| `form.register(name)` | Register native inputs or `forwardRef` components |
| `form.control` | Pass to `<ValfuseController control={...} />` |
| `form.handleSubmit(onValid)` | Validates then calls `onValid(values)` |
| `form.formState.errors` | `ValfuseFormErrors<TFieldValues>` — typed field errors |
| `form.formState.isSubmitting` | `boolean` — true while `onValid` is running |
| `form.setErrors(errors)` | Inject external/server errors |
| `form.clearErrors(name?)` | Clear one, many, or all errors |
| `form.setValue(name, value)` | Programmatically set a field value |
| `form.watch()` | Returns current form values |
| `form.reset(values?)` | Reset to default values |

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

All errors — schema validation, manual, and server — flow into the same place:

```
Schema errors (onSubmit/onChange/onBlur)  ──┐
                                             ├──→ form.formState.errors.fieldName
Server errors (form.setErrors)            ──┘
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
  ValfuseFormControl,
  ValfuseControllerProps,
} from "@valfuse-node/adapter-react";

import type { ValfuseFieldErrors } from "@valfuse-node/core";
```

The hook is fully generic:

```ts
const form = useValfuseForm<MyFormValues>({ schema, defaultValues });
//    ^— typed as UseValfuseFormReturn<MyFormValues>
```

---

## License

MIT
