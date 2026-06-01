# @valfuse-node/react

> React adapter for `@valfuse-node` — `useValfuseForm` hook, `ValfuseController`, and localization runtime.

## Installation

```bash
npm install @valfuse-node/react @valfuse-node/core
```

**Peer dependencies:** `react >= 18`, `react-dom >= 18`

## Features

- ⚛️ **`useValfuseForm`** — native React form hook with zero dependencies on external form libraries
- 🎛️ **`ValfuseController`** — controlled component bridge for custom UI inputs
- 🌐 **Localization** — `LocalizationProvider`, `useLocalization`, lazy loading, SSR, storage strategies
- 🔒 **Fully type-safe** — all field names, errors, and values are TypeScript-inferred
- 🔁 **Reactive** — `form.watch()` subscribe to any field change with a teardown callback

## Quick Start

```tsx
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/react";

const schema = createSchema({
  email: { type: "string", rules: { required: true, email: true } },
  password: { type: "string", rules: { required: true, minLength: 8 } },
});

export function LoginForm() {
  const form = useValfuseForm({ schema, mode: "onSubmit" });

  const handleSubmit = form.handleSubmit(async (values) => {
    await loginApi(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <input {...form.register("email")} />
      {form.formState.errors.email && (
        <span>{form.formState.errors.email.message}</span>
      )}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password && (
        <span>{form.formState.errors.password.message}</span>
      )}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Log in
      </button>
    </form>
  );
}
```

## API

### `useValfuseForm(props)`

| Prop | Type | Description |
|---|---|---|
| `schema` | `ValfuseSchema` | Validation schema from `@valfuse-node/core` |
| `mode` | `"onSubmit" \| "onChange" \| "onBlur"` | When validation triggers |
| `defaultValues` | `Record<string, unknown>` | Initial field values |

**Returns:**

| Property | Description |
|---|---|
| `register(name)` | Returns `{ name, value, onChange, onBlur }` props |
| `formState` | `{ errors, isValid, isDirty, isSubmitting, dirtyFields, touchedFields }` |
| `handleSubmit(fn)` | Returns a submit handler; calls `fn(values)` on success |
| `watch(name?, cb)` | Subscribe to field changes; returns unsubscribe function |
| `getValue(name)` | Read current field value |
| `setValue(name, value)` | Imperatively set a field value |
| `setErrors(errors)` | Set server-side errors |
| `clearErrors(name?)` | Clear one or all errors |
| `reset(values?)` | Reset form to default or provided values |
| `getValues()` | Return a snapshot of all current values |

### `ValfuseController`

```tsx
import { ValfuseController } from "@valfuse-node/react";

<ValfuseController
  name="role"
  control={form.control}
  render={({ field, fieldState }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      isInvalid={fieldState.invalid}
    />
  )}
/>
```

### Localization

```tsx
import { LocalizationProvider, useLocalization } from "@valfuse-node/react";

<LocalizationProvider locale={locale} translations={translations}>
  <App />
</LocalizationProvider>
```

```tsx
const { t } = useLocalization("auth");
// t("login.title") → "Sign In"
```

## License

[MIT](./LICENSE)

