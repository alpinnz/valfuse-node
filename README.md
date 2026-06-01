# valfuse-node

> **Config-first form validation and localization library for React and Vue.**  
> No Zod. No react-hook-form. No UI coupling. Just plain objects and framework hooks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Turbo](https://img.shields.io/badge/monorepo-turbo-blueviolet)](https://turbo.build/)

---

## Table of Contents

- [Why Valfuse?](#why-valfuse)
- [Packages](#packages)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [@valfuse-node/core](#valfuse-nodecore)
  - [@valfuse-node/react](#valfuse-nodereact)
  - [@valfuse-node/vue](#valfuse-nodevue)
  - [@valfuse-node/localization](#valfuse-nodelocalization)
- [Advanced Usage](#advanced-usage)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Why Valfuse?

Most form libraries require you to learn a heavy abstraction or lock you into a specific validation engine (Zod, Yup, etc.). Valfuse takes a different approach:

| Concern | Valfuse approach |
|---|---|
| Schema definition | Plain objects — readable, serializable, no runtime magic |
| Validation | Native rule engine, no Zod / Yup dependency |
| React integration | Only `useState`, `useRef`, `useCallback` — no hidden state machines |
| Vue integration | Native Vue composable with `reactive`, `ref` — no extra wrapper |
| Error model | Schema, manual, and server errors unified in `formState.errors` |
| Localization | YAML-configured CLI that compiles JSON locales into type-safe TypeScript |
| UI | Zero UI coupling — works with any component library or raw HTML |

---

## Packages

| Package | Description |
|---|---|
| [`@valfuse-node/core`](./packages/core/README.md) | Native schema validation engine (framework-agnostic) |
| [`@valfuse-node/react`](./packages/react/README.md) | React `useValfuseForm` hook + localization runtime |
| [`@valfuse-node/vue`](./packages/vue/README.md) | Vue `useValfuseForm` composable |
| [`@valfuse-node/localization`](./packages/localization/README.md) | CLI compiler: JSON → type-safe TypeScript localization |

> The `@valfuse-node/example-react` package (`packages/examples/react-example`) is a private playground — install it locally to explore all features.

---

## Installation

```bash
# Core validation only (Node.js or any framework)
npm install @valfuse-node/core

# React form hook (includes validation)
npm install @valfuse-node/react @valfuse-node/core

# Vue form composable (includes validation)
npm install @valfuse-node/vue @valfuse-node/core

# Localization CLI (i18n compiler + runtime)
npm install @valfuse-node/localization
```

---

## Quick Start

### Step 1 — Define a schema

```ts
// src/schemas/login.ts
import { createSchema } from "@valfuse-node/core";

export const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email is required", code: "email.required" } },
      { name: "email",    error: { message: "Invalid email format", code: "email.invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Password is required", code: "password.required" } },
      { name: "min", value: 8, error: { message: "Minimum 8 characters", code: "password.min" } },
    ],
  },
});
```

### Step 2a — Use in React

```tsx
import { useValfuseForm } from "@valfuse-node/react";
import { loginSchema } from "../../schemas/login";

export function LoginForm() {
  const form = useValfuseForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginApi(values);
    } catch (err) {
      form.setErrors({
        email: { message: "Account not found", type: "server", code: "auth.not_found" },
      });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("email")} />
      {form.formState.errors.email?.message}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password?.message}

      <button type="submit" :disabled="form.formState.isSubmitting">Sign In</button>
    </form>
  );
}
```

### Step 2b — Use in Vue

```vue
<script setup lang="ts">
import { useValfuseForm } from "@valfuse-node/vue";
import { loginSchema } from "../../schemas/login";

const form = useValfuseForm({
  schema: loginSchema,
  defaultValues: { email: "", password: "" },
});

const onSubmit = form.handleSubmit(async (values) => {
  await loginApi(values);
});
</script>

<template>
  <form @submit="onSubmit">
    <input v-bind="form.register('email')" />
    <p v-if="form.formState.errors.email">{{ form.formState.errors.email.message }}</p>

    <input type="password" v-bind="form.register('password')" />
    <p v-if="form.formState.errors.password">{{ form.formState.errors.password.message }}</p>

    <button type="submit" :disabled="form.formState.isSubmitting">Sign In</button>
  </form>
</template>
```

### Step 3 — (Optional) Add localization

```bash
npx valfuse-localization init        # creates valfuse-localization.yaml
npx valfuse-localization generate    # compiles JSON locale files → TypeScript
```

```tsx
import { LocalizationProvider, localStorageStrategy } from "@valfuse-node/react";
import localization from "./assets/localizations/localization";

<LocalizationProvider
  manifest={localization}
  storage={localStorageStrategy({ key: "locale" })}
  initialLocale="en"
>
  <App />
</LocalizationProvider>
```

---

## API Reference

### `@valfuse-node/core`

#### `createSchema(fields)`

Defines your field structure and validation rules. Returns a plain schema object.

```ts
import { createSchema } from "@valfuse-node/core";

const schema = createSchema({
  name: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required", code: "name.required" } },
      { name: "max", value: 50, error: { message: "Max 50 chars", code: "name.max" } },
    ],
  },
  age: {
    type: "number",
    rules: [
      { name: "min", value: 18, error: { message: "Must be 18+", code: "age.min" } },
    ],
  },
  active: { type: "boolean" },
});
```

**Supported field types:** `"string"` | `"number"` | `"boolean"` | `"array"` | `"object"`

**Supported rules per type:**

| Type | Available rules |
|---|---|
| `string` | `required`, `min`, `max`, `email`, `url`, `regex`, `enum` |
| `number` | `required`, `min`, `max`, `integer`, `positive`, `negative` |
| `boolean` | `required`, `isTrue`, `isFalse` |
| `array` | `required`, `min`, `max`, `nonempty` |
| `object` | `required` |
| all | `custom` (async-safe custom validation function) |

---

#### `validateSchema(schema, values)`

Run validation imperatively — outside of React/Vue, e.g. in server actions or Node.js.

```ts
import { validateSchema } from "@valfuse-node/core";

const errors = validateSchema(loginSchema, { email: "bad", password: "123" });
// → { email: { message: "Invalid email format", code: "email.invalid", type: "rule" } }
```

---

#### `transformValues(schema, rawValues)`

Coerces raw form string input into properly typed values based on schema field types.

```ts
import { transformValues } from "@valfuse-node/core";

const typed = transformValues(schema, { age: "25", active: "true" });
// → { age: 25, active: true }
```

---

#### `normalizeError(error)`

Normalizes a string or error object into a `ValfuseError`.

```ts
import { normalizeError } from "@valfuse-node/core";

normalizeError("Something went wrong");
// → { message: "Something went wrong" }
```

---

### `@valfuse-node/react`

#### `useValfuseForm(options)`

The primary React hook for form state management.

```ts
const form = useValfuseForm({
  schema,                         // Required: ValfuseSchema
  defaultValues,                  // Required: { [fieldName]: initialValue }
  mode?: "onSubmit",              // "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all"
});
```

**Complete API surface:**

| Method / Property | Description |
|---|---|
| `form.register(name)` | Spread `{ name, value, onChange, onBlur, ref }` onto an `<input>` |
| `form.handleSubmit(fn)` | Returns `onSubmit` handler; only calls `fn(values)` when validation passes |
| `form.formState.errors` | `{ [field]: ValfuseFieldError }` — all active errors |
| `form.formState.isSubmitting` | `true` while the submit function is awaiting |
| `form.formState.isSubmitted` | `true` after first submit attempt |
| `form.formState.isValid` | `true` when no validation errors exist |
| `form.formState.isDirty` | `true` when any field differs from `defaultValues` |
| `form.formState.dirtyFields` | Map of fields modified from `defaultValues` |
| `form.formState.touchedFields` | Map of fields that received and lost focus |
| `form.setErrors(errors)` | Inject errors manually (e.g. from API response) |
| `form.clearErrors(fields?)` | Clear one, many, or all errors |
| `form.setValue(name, value)` | Programmatically set a field value |
| `form.trigger(name?)` | Manually trigger validation |
| `form.watch(...)` | Subscribe to field changes |
| `form.reset(values?)` | Reset to `defaultValues` or provided values |
| `form.control` | Pass to `ValfuseController` for custom inputs |

---

#### `ValfuseController`

For controlled inputs that don't work with a plain `register` spread — custom select, date picker, checkbox group.

```tsx
import { ValfuseController, useValfuseForm } from "@valfuse-node/react";

<ValfuseController
  name="role"
  control={form.control}
  render={({ field, fieldState }) => (
    <div>
      <MySelectComponent value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
      {fieldState.error && <p>{fieldState.error.message}</p>}
    </div>
  )}
/>
```

---

#### Localization Runtime

```tsx
import {
  LocalizationProvider,
  useLocalization,
  localStorageStrategy,
} from "@valfuse-node/react";
import localization from "./assets/localizations/localization";

<LocalizationProvider
  manifest={localization}
  storage={localStorageStrategy({ key: "locale" })}
  initialLocale="en"
>
  <App />
</LocalizationProvider>

function Header() {
  const { t, locale, setLocale } = useLocalization("common.header");
  return <h1>{t("app_name")}</h1>;
}
```

**Storage strategies:** `localStorageStrategy` | `sessionStorageStrategy` | `cookieStrategy` | `memoryStrategy` | `composeStorage`

---

### `@valfuse-node/vue`

#### `useValfuseForm(options)`

The primary Vue composable for form state management — same API contract as the React hook.

```vue
<script setup lang="ts">
import { useValfuseForm } from "@valfuse-node/vue";

const form = useValfuseForm({ schema, defaultValues: { email: "", password: "" } });
const onSubmit = form.handleSubmit(async (values) => { /* ... */ });
</script>

<template>
  <form @submit="onSubmit">
    <input v-bind="form.register('email')" />
    <p v-if="form.formState.errors.email">{{ form.formState.errors.email.message }}</p>
    <button :disabled="form.formState.isSubmitting">Submit</button>
  </form>
</template>
```

The Vue `register()` returns `{ name, modelValue, "onUpdate:modelValue", onBlur }` — compatible with Vue's `v-bind` and `v-model`.

---

### `@valfuse-node/localization`

A CLI + compiler that turns JSON locale files into fully type-safe TypeScript.

#### Configure — `valfuse-localization.yaml`

```yaml
input_dir: assets/localizations        # folder with your JSON locale files
output_dir: src/assets/localizations   # where generated files are written

framework: react
class_name: Localization

base_locale: en
fallback_locale: en
strict: true

namespace_prefix: module   # keys look like "auth.login.page_title"

generated:
  runtime_entry_file: localization.ts
  runtime_types_file: localization.types.ts
  runtime_manifest_file: localization.manifest.json

validation:
  max_depth: 10
  require_key_parity: true
  require_placeholder_parity: true
  require_structured_parity: true
```

#### CLI commands

```bash
npx valfuse-localization generate          # Compile JSON → TypeScript
npx valfuse-localization generate --watch  # Watch mode
npx valfuse-localization validate          # Validate key/placeholder parity
npx valfuse-localization coverage          # Per-locale coverage report
npx valfuse-localization init              # Scaffold valfuse-localization.yaml
npx valfuse-localization clean             # Remove generated output
```

#### Interpolation & Gender variants

```ts
t("greeting", { name: "Alice" });        // "Hello, Alice!"
t("user_status", {}, "female");          // "She is online"
```

---

## Advanced Usage

### Change validation trigger

```ts
const form = useValfuseForm({
  schema, defaultValues,
  mode: "onChange",         // validate on every keystroke
});
```

### Inject server-side errors

```ts
form.setErrors({
  email: { message: "Email already in use", type: "server", code: "email.duplicate" },
});
```

### Custom validation rule

```ts
const schema = createSchema({
  username: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required", code: "username.required" } },
      {
        name: "custom",
        validate: async (value) => {
          const taken = await api.isUsernameTaken(value);
          return taken ? { message: "Username already taken", code: "username.taken" } : null;
        },
      },
    ],
  },
});
```

### SSR-safe localization

```ts
import { createSsrLocalizationState } from "@valfuse-node/react";
const ssrState = createSsrLocalizationState(manifest, "en");
```

### Lazy locale loading

```ts
import { createLazyLocaleLoader } from "@valfuse-node/react";
const loader = createLazyLocaleLoader({
  en: () => import("./locales/en"),
  id: () => import("./locales/id"),
});
```

---

## Architecture

```
packages/
  core/                    → @valfuse-node/core
    src/
      schema/              → createSchema()
      validation/          → validateSchema()
      transformation/      → transformValues()
      errors/              → normalizeError()
      rules/               → rule runners per type
      types/               → TypeScript types
      shared/              → transformers (t.trim, t.toNumber, etc.)
      public-api.ts        → single export gate
      index.ts             → export * from "./public-api"

  react/                   → @valfuse-node/react
    src/
      hooks/               → useValfuseForm()
      components/          → ValfuseController
      helpers/             → field-error, validation-mode
      types/               → form types
      localization/        → provider, hooks, bridge, storage, ssr, lazy

  vue/                     → @valfuse-node/vue
    src/
      composables/         → useValfuseForm() (Vue composable)
      types/               → form types

  localization/            → @valfuse-node/localization
    src/
      cli/                 → generate, validate, coverage, init, clean
      compiler/            → JSON → TypeScript compilation pipeline
      parser/              → locale file parser
      validator/           → key/placeholder parity checker
      runtime/             → interpolation engine (browser-safe)

  examples/
    react-example/         → @valfuse-node/example-react (private playground)
```

**Package dependency graph:**

```
examples/react-example
  ├── @valfuse-node/react  →  @valfuse-node/core
  └── @valfuse-node/localization

examples/vue-example (future)
  ├── @valfuse-node/vue    →  @valfuse-node/core
  └── @valfuse-node/localization
```

- **`@valfuse-node/core`** — zero React/Vue dependency, runs in Node
- **`@valfuse-node/react`** — zero external form-library dependency
- **`@valfuse-node/vue`** — zero external form-library dependency
- **`@valfuse-node/localization`** — used at build/compile time only

---

## Development

### Prerequisites

- Node.js ≥ 18
- npm ≥ 11

### Setup

```bash
git clone <repo-url>
cd valfuse-node
npm install
```

### Common scripts

```bash
npm run dev           # Start the example playground with hot reload
npm run build         # Build all packages
npm run test          # Run all unit tests
npm run typecheck     # TypeScript type-check all packages
npm run lint          # Lint all packages
npm run clean         # Remove all build artifacts
```

### Localization example scripts

```bash
npm run example:localization:generate   # Compile locale files for the example
npm run example:localization:watch      # Watch mode compilation
npm run example:localization:validate   # Validate locale file parity
```

### Publish

```bash
npm run publish:core              # Publish @valfuse-node/core
npm run publish:localization      # Publish @valfuse-node/localization
npm run publish:react             # Publish @valfuse-node/react
npm run publish:vue               # Publish @valfuse-node/vue
npm run publish:all               # Publish all four packages
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on:
- Branch naming
- Commit message conventions
- Writing and running tests
- Adding new validation rules

---

## License

MIT — see [LICENSE](./LICENSE)
