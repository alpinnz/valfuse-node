# @valfuse-node/adapter-react

React Hook Form adapter for `valfuse-node`.

Connect native schema validation from `@valfuse-node/core` to your React forms with full support for `register()`, `Controller`, and server-side error injection via `form.setErrors()`.

---

## Installation

```bash
npm install @valfuse-node/adapter-react @valfuse-node/core react-hook-form
```

### Peer Dependencies

| Package | Version |
|---|---|
| `react` | `>=18` |
| `react-dom` | `>=18` |
| `react-hook-form` | `>=7` |

---

## Overview

`@valfuse-node/adapter-react` provides:

| Export | Description |
|---|---|
| `useValfuseForm(props)` | `useForm` wrapper with schema validation and `setErrors` |
| `createValfuseResolver(schema)` | Low-level resolver for `react-hook-form` |

---

## Quick Start

```tsx
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/adapter-react";

const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email wajib diisi" } },
      { name: "email", error: { message: "Format email tidak valid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Password wajib diisi" } },
      { name: "min", value: 8, error: { message: "Password minimal 8 karakter" } },
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
    // values is fully typed as LoginFormValues
    await submitLoginApi(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <input
        {...form.register("email")}
        placeholder="Email"
      />
      {form.formState.errors.email?.message}

      <input
        type="password"
        {...form.register("password")}
        placeholder="Password"
      />
      {form.formState.errors.password?.message}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## API Reference

### `useValfuseForm(props)`

A wrapper around `react-hook-form`'s `useForm` that integrates native Valfuse schema validation and adds `setErrors`.

```ts
const form = useValfuseForm<TFieldValues>({
  schema,           // ValfuseSchema — required
  defaultValues,    // TFieldValues  — recommended
  mode,             // ValidationMode — default: "onSubmit"
  // ...all other useForm options except `resolver`
});
```

#### Return Value

All properties from `react-hook-form`'s `UseFormReturn`, plus:

| Property | Type | Description |
|---|---|---|
| `form.register` | `UseFormRegister` | Register native inputs or `forwardRef` components |
| `form.control` | `Control` | For use with `Controller` from `react-hook-form` |
| `form.handleSubmit` | `UseFormHandleSubmit` | Wrap your submit handler |
| `form.formState` | `FormState` | Access `errors`, `isSubmitting`, `isDirty`, etc. |
| `form.setValue` | `UseFormSetValue` | Programmatically set a field value |
| `form.watch` | `UseFormWatch` | Watch field value changes |
| `form.reset` | `UseFormReset` | Reset form to default values |
| `form.clearErrors` | `UseFormClearErrors` | Clear all or specific field errors |
| `form.setErrors` | `(errors) => void` | Inject external/server errors |

### `form.setErrors(errors)`

Injects external errors (e.g. from API responses) into `form.formState.errors`.

Accepts both simple and detailed formats:

```ts
// Simple string errors
form.setErrors({
  email: "Email tidak terdaftar",
  password: "Password salah",
});

// Detailed ValfuseError objects
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
form.formState.errors.email?.message
form.formState.errors.password?.message
```

### `createValfuseResolver(schema)`

Low-level function that creates a `react-hook-form`-compatible resolver from a Valfuse schema. Used internally by `useValfuseForm`. Exposed for advanced use cases.

```ts
import { useForm } from "react-hook-form";
import { createValfuseResolver } from "@valfuse-node/adapter-react";

const form = useForm({
  resolver: createValfuseResolver(mySchema),
});
```

---

## Patterns

### When to use `register()`

Use `register()` for **native HTML inputs** or components that use `React.forwardRef`:

```tsx
// TextInput must use forwardRef to forward the ref
<TextInput
  id="email"
  label="Email"
  placeholder="Masukkan email"
  error={form.formState.errors.email?.message}
  {...form.register("email")}
/>
```

The spread `{...form.register("email")}` provides `name`, `ref`, `onChange`, and `onBlur` to the input.

### When to use `Controller`

Use `Controller` from `react-hook-form` for **custom controlled components** that do not accept `ref`:

```tsx
import { Controller } from "react-hook-form";

<Controller
  control={form.control}
  name="role"
  render={({ field, fieldState }) => (
    <CustomDropdown
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>
```

### When to use `roleId: string` vs `role: Role | null`

#### Use `roleId: string` when:

- The API only needs the selected item's ID
- The UI does not need the full object after selection

```ts
type FormValues = {
  name: string;
  roleId: string;  // stores "admin" | "staff" | "viewer"
};
```

```ts
// Schema field
roleId: {
  type: "string",
  rules: [
    { name: "required", error: { message: "Role wajib dipilih" } },
  ],
}
```

#### Use `role: Role | null` when:

- The UI needs to display the full selected object (e.g. dropdown label)
- The form submit handler needs to extract data from the object

```ts
type Role = { id: string; name: string };

type FormValues = {
  name: string;
  role: Role | null;  // stores the full selected object
};
```

```ts
// Schema field
role: {
  type: "object",
  rules: [
    { name: "required", error: { message: "Role wajib dipilih" } },
  ],
}
```

---

## Error Flow

All errors — whether from schema validation or `setErrors()` — flow into the same place:

```
Schema errors (onSubmit)  ──┐
                             ├──→ form.formState.errors.fieldName?.message
Server errors (setErrors) ──┘
```

UI only needs to read:

```tsx
{form.formState.errors.email?.message}
```

---

## API Error Mapping Example

```ts
// Map API validation response to setErrors format
function mapApiValidationErrors(response: ApiValidationErrorResponse) {
  return Object.fromEntries(
    response.errors?.map((apiValidationError) => [
      apiValidationError.field,
      {
        message: apiValidationError.message,
        type: "server",
        code: apiValidationError.code,
      },
    ]) ?? []
  );
}

// Usage in form submit handler
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
import type { UseValfuseFormReturn } from "@valfuse-node/adapter-react";
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
