# @valfuse-node/core

> **Umbrella entry point for valfuse-node** — one install, one import path, the full library: form domain, localization, and React/Vue adapters.

```bash
npm install @valfuse-node/core
```

That single command gives you:

- 📦 **Form domain** (`@valfuse-node/form`) — schema, rules, validation, transformation, state
- 🌐 **Localization** (`@valfuse-node/localization`) — CLI compiler, runtime interpolation
- ⚛️ **React adapter** (`@valfuse-node/react`) — `useValfuseForm` hook, `ValfuseController`
- 💚 **Vue adapter** (`@valfuse-node/vue`) — `useValfuseForm` composable

**Peer dependencies (optional):** `react >= 18` (for the React adapter), `vue >= 3` (for the Vue adapter). Both are listed as optional peer deps, so you can install `@valfuse-node/core` and use only the form/localization pieces without React or Vue.

---

## Table of Contents

- [Quick Start by Adapter](#quick-start-by-adapter)
- [Import Map](#import-map)
- [API Reference](#api-reference)
  - [Form Domain](#form-domain-flattened-to-top-level)
  - [Localization](#localization-flattened-to-top-level)
  - [React Adapter](#react-adapter-namespaced)
  - [Vue Adapter](#vue-adapter-namespaced)
- [End-to-End Example](#end-to-end-example)
- [Architecture](#architecture)
- [License](#license)

---

## Quick Start by Adapter

### 🧩 Form-only (Node.js, server actions, any framework)

```ts
import { createSchema, validateSchema, transformValues, t } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    transformers: t("trim", "lowercase"),
    rules: { required: true, email: true },
  },
  age: {
    type: "number",
    rules: { required: true, min: 18 },
  },
});

const cleaned = transformValues(schema, { email: "  Alice@Example.com  ", age: "25" });
// → { email: "alice@example.com", age: 25 }

const result = validateSchema(schema, cleaned);
// result.isValid → true  |  result.errors → {}
```

### ⚛️ React

```tsx
import { createSchema, ReactAdapter } from "@valfuse-node/core";

const { useValfuseForm } = ReactAdapter;

const schema = createSchema({
  email:    { type: "string", rules: { required: true, email: true } },
  password: { type: "string", rules: { required: true, minLength: 8 } },
});

export function LoginForm() {
  const form = useValfuseForm({
    schema,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await loginApi(values);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("email")} />
      {form.formState.errors.email?.message}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password?.message}

      <button type="submit" disabled={form.formState.isSubmitting}>
        Log in
      </button>
    </form>
  );
}
```

### 💚 Vue

```vue
<script setup lang="ts">
import { createSchema, VueAdapter } from "@valfuse-node/core";

const { useValfuseForm } = VueAdapter;

const schema = createSchema({
  email: { type: "string", rules: { required: true, email: true } },
});

const form = useValfuseForm({
  schema,
  defaultValues: { email: "" },
});

const onSubmit = form.handleSubmit(async (values) => {
  await loginApi(values);
});
</script>

<template>
  <form @submit="onSubmit">
    <input v-bind="form.register('email')" />
    <p v-if="form.formState.errors.email">{{ form.formState.errors.email.message }}</p>
    <button :disabled="form.formState.isSubmitting">Submit</button>
  </form>
</template>
```

### 🌐 Localization (CLI + runtime)

```bash
# Compile YAML/JSON locale files → type-safe TypeScript
npx valfuse-localization init        # creates valfuse-localization.yaml
npx valfuse-localization generate    # compiles → src/assets/localizations/
```

```ts
// In a React component
import { ReactAdapter, interpolate } from "@valfuse-node/core";
const { LocalizationProvider, useLocalization } = ReactAdapter;

<LocalizationProvider locale="en" translations={translations}>
  <App />
</LocalizationProvider>;

function Header() {
  const { t } = useLocalization("common");
  return <h1>{t("app_name")}</h1>;
}

// Or use the runtime interpolator directly (browser-safe):
interpolate("Hello, {name}!", { name: "Alice" });  // → "Hello, Alice!"
```

---

## Import Map

`@valfuse-node/core` re-exports four packages. Two are flattened (no name collisions), two are namespaced (collisions possible).

| Source | Access pattern | Why? |
|---|---|---|
| `@valfuse-node/form` | Top-level (`createSchema`, `validateSchema`, ...) | Framework-agnostic, no collision risk |
| `@valfuse-node/localization` | Top-level (`interpolate`, `compileProject`, ...) | Framework-agnostic, no collision risk |
| `@valfuse-node/react` | `ReactAdapter.*` namespace | Both React and Vue export `useValfuseForm`; namespacing disambiguates |
| `@valfuse-node/vue` | `VueAdapter.*` namespace | Same reason as React |

```ts
import {
  // Flat (from form)
  createSchema, validateSchema, transformValues, normalizeError, t,
  // Flat (from localization)
  interpolate, compileProject, loadConfig, runGenerate,
  // Namespaced (from react)
  ReactAdapter,
  // Namespaced (from vue)
  VueAdapter,
} from "@valfuse-node/core";

const { useValfuseForm } = ReactAdapter;
const { useValfuseForm: useVueValfuseForm } = VueAdapter;
```

> **Why namespace the adapters?** Both `@valfuse-node/react` and `@valfuse-node/vue` export identically-named hooks (`useValfuseForm`) and overlapping types (`UseValfuseFormProps`, `UseValfuseFormReturn`). Flattening them would silently shadow one with the other. Namespacing makes the choice explicit.

---

## API Reference

### Form domain (flattened to top level)

#### `createSchema(fields)`

Define your field structure and per-field rules. Returns a plain schema object.

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
    rules: [{ name: "min", value: 18, error: { message: "Must be 18+", code: "age.min" } }],
  },
  active: { type: "boolean" },
});
```

**Supported field types:** `string` | `number` | `boolean` | `array` | `object`

**Built-in rules:**

| Type | Available rules |
|---|---|
| `string` | `required`, `minLength`, `maxLength`, `pattern`, `email`, `url` |
| `number` | `required`, `min`, `max`, `integer` |
| `boolean` | `required` |
| `array` | `required`, `minItems`, `maxItems` |
| `object` | `required` |
| generic (all) | `refine`, `custom`, `matchField`, `oneOf`, `notOneOf` |

#### `validateSchema(schema, values)`

Run validation imperatively — outside React/Vue, e.g. in server actions or Node.js.

```ts
import { validateSchema } from "@valfuse-node/core";

const errors = validateSchema(loginSchema, { email: "bad", password: "123" });
// → { email: { message: "Invalid email format", code: "email.invalid", type: "rule" } }
```

#### `transformValues(schema, rawValues)`

Coerces raw form input (often strings from HTML inputs) into properly typed values based on schema field types.

```ts
import { transformValues } from "@valfuse-node/core";

const typed = transformValues(schema, { age: "25", active: "true" });
// → { age: 25, active: true }
```

#### `normalizeError(raw)`

Normalizes a string or error object into a `ValfuseError`.

```ts
import { normalizeError } from "@valfuse-node/core";

normalizeError("Something went wrong");
// → { message: "Something went wrong" }
```

#### `t(...transformerNames)`

Compose field-level transformers declaratively.

```ts
import { t } from "@valfuse-node/core";

const schema = createSchema({
  username: {
    type: "string",
    transformers: t("trim", "lowercase"),
    rules: { required: true, minLength: 3 },
  },
});
```

### Localization (flattened to top level)

The localization package has three import surfaces (CLI + compiler, browser runtime, types). All are available from `@valfuse-node/core`.

#### Compiler / CLI (Node.js only)

| Export | Use |
|---|---|
| `loadConfig(path)` | Load and parse `valfuse-localization.yaml` |
| `compileProject(config)` | Run the full compile pipeline |
| `normalizeProject(config)` | Normalize raw locale data |
| `validateProject(config)` | Check key/placeholder parity |
| `runInit / runGenerate / runValidate / runCoverage / runClean` | CLI command handlers |

```ts
import { loadConfig, compileProject } from "@valfuse-node/core";

const config = await loadConfig("./valfuse-localization.yaml");
await compileProject(config);
```

#### Runtime (browser-safe)

| Export | Use |
|---|---|
| `interpolate(template, params, options?)` | Replace `{name}` placeholders |
| `lookupMessage(messages, key)` | Look up a translation by dot-path key |
| `pickPluralVariant(messages, count)` | Pick plural form by count |
| `pickGenderVariant(messages, gender)` | Pick gender form |
| `pickContextVariant(messages, context)` | Pick context form |
| `parseStructuredVariants(value)` | Parse `one{...} other{...}` strings |

```ts
import { interpolate } from "@valfuse-node/core";

interpolate("Hello, {name}!", { name: "Alice" });
// → "Hello, Alice!"

interpolate("{count, plural, one {# item} other {# items}}", { count: 5 });
// → "5 items"
```

#### CLI

```bash
npx valfuse-localization init           # scaffold valfuse-localization.yaml
npx valfuse-localization generate       # compile JSON → TypeScript
npx valfuse-localization generate --watch
npx valfuse-localization validate       # key/placeholder parity check
npx valfuse-localization coverage       # per-locale coverage report
npx valfuse-localization clean          # remove generated output
```

Requires **Node.js ≥ 20**.

### React adapter (namespaced)

Access via `ReactAdapter.*`. React is an optional peer dep — if you only use form/localization, you don't need it installed.

```ts
import { ReactAdapter } from "@valfuse-node/core";

const {
  useValfuseForm,        // main hook
  ValfuseController,     // controlled-input bridge component
  LocalizationProvider,  // context provider
  useLocalization,       // translation hook
  useLocalizationTree,   // raw-tree hook
  createLocalizationStore,
  createLazyLocaleLoader,
  createSsrLocalizationState,
  localStorageStrategy, sessionStorageStrategy,
  cookieStrategy, memoryStrategy, composeStorage,
} = ReactAdapter;
```

#### `useValfuseForm(options)`

The primary React hook. **Complete API:**

| Method / Property | Description |
|---|---|
| `form.register(name)` | Spread `{ name, value, onChange, onBlur, ref }` onto an `<input>` |
| `form.handleSubmit(fn)` | Returns `onSubmit` handler; only calls `fn(values)` when validation passes |
| `form.formState.errors` | `{ [field]: ValfuseFieldError }` — active errors |
| `form.formState.isSubmitting` | `true` while submit function is awaiting |
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

**Options:**

```ts
useValfuseForm({
  schema,                 // ValfuseSchema (required)
  defaultValues,          // { [field]: value } (required)
  mode?: "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all",
});
```

#### `ValfuseController`

For controlled inputs that don't work with `register` (custom select, date picker, checkbox group).

```tsx
import { ReactAdapter } from "@valfuse-node/core";
const { ValfuseController, useValfuseForm } = ReactAdapter;

<ValfuseController
  name="role"
  control={form.control}
  render={({ field, fieldState }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      isInvalid={fieldState.invalid}
    />
  )}
/>
```

#### Localization runtime

```tsx
import { ReactAdapter } from "@valfuse-node/core";
const { LocalizationProvider, useLocalization, localStorageStrategy } = ReactAdapter;

<LocalizationProvider
  manifest={localization}
  storage={localStorageStrategy({ key: "locale" })}
  initialLocale="en"
>
  <App />
</LocalizationProvider>;

function Header() {
  const { t, locale, setLocale } = useLocalization("common");
  return <h1>{t("app_name")}</h1>;
}
```

**Storage strategies:** `localStorageStrategy` | `sessionStorageStrategy` | `cookieStrategy` | `memoryStrategy` | `composeStorage`

### Vue adapter (namespaced)

Access via `VueAdapter.*`. Vue is an optional peer dep.

```vue
<script setup lang="ts">
import { createSchema, VueAdapter } from "@valfuse-node/core";
const { useValfuseForm } = VueAdapter;

const schema = createSchema({
  email: { type: "string", rules: { required: true, email: true } },
});

const form = useValfuseForm({
  schema,
  defaultValues: { email: "" },
});

const onSubmit = form.handleSubmit(async (values) => {
  await loginApi(values);
});
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

> **Heads-up:** The Vue adapter is currently a thin composable; it does not yet expose a `ValfuseController` equivalent or all `formState` fields that React does. See [TODO] for parity work.

---

## End-to-End Example

A complete React form with validation, transformation, server-error injection, and localization:

```tsx
import { createSchema, ReactAdapter } from "@valfuse-node/core";

const { useValfuseForm, LocalizationProvider, useLocalization } = ReactAdapter;

const schema = createSchema({
  email: {
    type: "string",
    transformers: [
      { name: "trim" },
      { name: "lowercase" },
    ],
    rules: [
      { name: "required", error: { message: "Email is required", code: "email.required" } },
      { name: "email",    error: { message: "Invalid email",     code: "email.invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required", code: "password.required" } },
      { name: "minLength", value: 8, error: { message: "Min 8 chars", code: "password.min" } },
    ],
  },
});

export function SignupForm() {
  const form = useValfuseForm({
    schema,
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await signupApi(values);
    } catch (err) {
      form.setErrors({
        email: { message: "Account already exists", type: "server", code: "auth.duplicate" },
      });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <label>
        Email
        <input {...form.register("email")} />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email.message}</span>
        )}
      </label>

      <label>
        Password
        <input type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <span className="error">{form.formState.errors.password.message}</span>
        )}
      </label>

      <button type="submit" disabled={form.formState.isSubmitting}>
        Sign up
      </button>
    </form>
  );
}
```

---

## Architecture

`@valfuse-node/core` is a **pure re-export facade** — its bundle is ~270 bytes of ESM. Nothing is bundled, duplicated, or re-implemented.

```
┌────────────────────────────────────────────────────────────┐
│  @valfuse-node/core  (this package — facade only)         │
│    ├─ Form domain exports (flattened)                     │
│    ├─ Localization exports (flattened)                     │
│    ├─ ReactAdapter namespace                              │
│    └─ VueAdapter namespace                                │
└────────────────────────────────────────────────────────────┘
            │                  │             │           │
            ▼                  ▼             ▼           ▼
   @valfuse-node/form  @valfuse-node/   @valfuse-node/  @valfuse-node/
                        localization     react          vue
                       (zero deps)      (peer: react)  (peer: vue)
```

**Dependency direction** (strictly inner→outer is forbidden):

- `form` → nothing (pure domain)
- `localization` → nothing (zero deps; runtime is browser-safe)
- `react` → `form`, `localization` (peer: `react`)
- `vue` → `form` (peer: `vue`)
- `core` → `form`, `localization`, `react`, `vue` (peer: `react`, `vue` — both optional)

**Build:** turbo builds `form` → `localization` → `react` → `vue` → `core` in order. Each package's `dist/` is what `core` resolves at runtime.

**Tree-shaking:** Because `core` is a facade with named re-exports (not a bundle), bundlers can still tree-shake unused exports. Importing `createSchema` from `core` does NOT pull in React or Vue at runtime.

---

## Sub-package READMEs

For deeper detail on any specific surface:

- [`@valfuse-node/form`](./packages/form/README.md) (or built into this README above)
- [`@valfuse-node/react`](./packages/react/README.md)
- [`@valfuse-node/vue`](./packages/vue/README.md)
- [`@valfuse-node/localization`](./packages/localization/README.md)

---

## License

[MIT](./LICENSE)
