# @valfuse-node/core

> **Umbrella entry point for valfuse-node** — one install, one import path, the full library: form domain, localization, and React/Vue adapters.

```bash
npm install @valfuse-node/core
```

That single command gives you:

- 📦 **Form domain** (`@valfuse-node/form`) — schema, rules, validation, transformation, state
- 🌐 **Localization** (`@valfuse-node/localization`) — CLI compiler, validators, browser runtime
- ⚛️ **React adapter** (`@valfuse-node/react`) — `useReactValfuseForm` hook, `<ValfuseController>`, `<LocalizationProvider>`
- 💚 **Vue adapter** (`@valfuse-node/vue`) — `useVueValfuseForm` composable

**Peer dependencies (optional):** `react >= 18` (for the React adapter), `vue >= 3` (for the Vue adapter). Both are listed as optional peer deps, so you can install `@valfuse-node/core` and use only the form/localization pieces without React or Vue.

---

## Table of Contents

- [Quick Start by Adapter](#quick-start-by-adapter)
- [Import Map](#import-map)
- [API Reference](#api-reference)
  - [Form Domain](#form-domain-flattened-to-top-level)
  - [Localization](#localization-flattened-to-top-level)
  - [React Adapter](#react-adapter)
  - [Vue Adapter](#vue-adapter)
- [End-to-End Example](#end-to-end-example)
- [Architecture](#architecture)
- [Sub-package READMEs](#sub-package-readmes)
- [License](#license)

---

## Quick Start by Adapter

### 🧩 Form-only (Node.js, server actions, any framework)

```ts
import { createSchema, validateSchema, transformValues, t } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }],
  },
  age: {
    type: "number",
    transform: t.toInteger,
    rules: [{ name: "min", value: 18, error: { message: "18+" } }],
  },
});

const cleaned = transformValues(schema, { email: "  Alice@Example.com  ", age: "25" });
// → { email: "alice@example.com", age: 25 }

const result = validateSchema(schema, cleaned);
// result.errors → {}
```

### ⚛️ React

```tsx
import { createSchema, useReactValfuseForm, LocalizationProvider, useLocalization, localStorageStrategy } from "@valfuse-node/core";
import manifest from "./loc/manifest.json";

<LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
  <LoginForm />
</LocalizationProvider>;

const schema = createSchema({
  email:    { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }] },
  password: { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "minLength", value: 8, error: { message: "Min 8" } }] },
});

export function LoginForm() {
  const { translate } = useLocalization();
  const form = useReactValfuseForm({
    schema,
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  return (
    <form onSubmit={form.handleSubmit(async (values) => { await loginApi(values); })}>
      <input {...form.register("email")} placeholder={translate("auth.email")} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}

      <button type="submit" disabled={form.formState.isSubmitting}>{translate("auth.submit")}</button>
    </form>
  );
}
```

### 💚 Vue

```vue
<script setup lang="ts">
import { createSchema, useVueValfuseForm } from "@valfuse-node/core";

const schema = createSchema({
  email:    { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }] },
  password: { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "minLength", value: 8, error: { message: "Min 8" } }] },
});

type Values = { email: string; password: string };

const form = useVueValfuseForm<Values>({
  schema,
  defaultValues: { email: "", password: "" },
});

async function onSubmit(values: Values) {
  await loginApi(values);
}
</script>

<template>
  <form @submit="form.handleSubmit(onSubmit)">
    <input v-bind="form.register('email')" />
    <p v-if="form.formState.errors.email">{{ form.formState.errors.email.message }}</p>

    <input type="password" v-bind="form.register('password')" />
    <p v-if="form.formState.errors.password">{{ form.formState.errors.password.message }}</p>

    <button type="submit" :disabled="form.formState.isSubmitting">Log in</button>
  </form>
</template>
```

### 🌐 Localization (CLI + runtime)

```bash
# Compile YAML/JSON locale files → type-safe TypeScript
npx valfuse-localization init
npx valfuse-localization generate
npx valfuse-localization generate --watch
```

```ts
// Or use the runtime interpolator directly (browser-safe):
import { interpolate } from "@valfuse-node/core";

interpolate("Hello, {name}!", { name: "Alice" });   // → "Hello, Alice!"
interpolate("{count, plural, one {# item} other {# items}}", { count: 5 });
// → "5 items"
```

---

## Import Map

`@valfuse-node/core` re-exports four packages. Two are flattened (no name collisions). The two adapter packages share a single value-level name (`useValfuseForm`), which is renamed at the umbrella level to `useReactValfuseForm` / `useVueValfuseForm` following the `{Tech}{Domain}{Feature}` convention. The underlying adapter packages keep their original `useValfuseForm` name.

| Source | Access pattern | Why? |
|---|---|---|
| `@valfuse-node/form` | Top-level (`createSchema`, `validateSchema`, `t`, …) | Framework-agnostic, no collision risk |
| `@valfuse-node/localization` | Top-level (`interpolate`, `compileProject`, `loadConfig`, …) | Framework-agnostic, no collision risk |
| `@valfuse-node/react` | Top-level (`useReactValfuseForm`, `ValfuseController`, `LocalizationProvider`, `useLocalization`, …) | The single conflicting value `useValfuseForm` is renamed to disambiguate |
| `@valfuse-node/vue` | Top-level (`useVueValfuseForm`, …) | Same reason as React |

```ts
import {
  // Form domain
  createSchema, validateSchema, transformValues, normalizeError, t,
  // Localization
  interpolate, compileProject, loadConfig, runGenerate,
  // React adapter — note the Tech-prefix
  useReactValfuseForm, ValfuseController, LocalizationProvider, useLocalization,
  useLocalizationTree, createLocalizationStore, createLazyLocaleLoader, createSsrLocalizationState,
  localStorageStrategy, sessionStorageStrategy, cookieStrategy, memoryStrategy, composeStorage,
  // Vue adapter — Tech-prefix disambiguates the identically-named React hook
  useVueValfuseForm,
} from "@valfuse-node/core";
```

> **Why tech-prefix the hooks?** Both `@valfuse-node/react` and `@valfuse-node/vue` export a hook named `useValfuseForm`. Flattening both into the umbrella would silently shadow one. The `{Tech}{Domain}{Feature}` rename (`useReactValfuseForm` / `useVueValfuseForm`) makes the choice explicit at the call site. The underlying adapter packages still export `useValfuseForm` for backward compat — the rename is umbrella-level only.

> **TypeScript-only:** all types are re-exported flat from the form domain (no collision — both adapters import the same types from `@valfuse-node/form`).

---

## API Reference

### Form domain (flattened to top level)

#### `createSchema(fields)`

Define your field structure and per-field rules. Returns a plain schema object — `createSchema` is an identity function that gives you type inference.

```ts
const schema = createSchema({
  name:  { type: "string", rules: [{ name: "required", error: { message: "Required" } }] },
  age:   { type: "number", rules: [{ name: "min", value: 18, error: { message: "18+" } }] },
  tags:  { type: "array",  rules: [{ name: "nonempty", error: { message: "Add at least 1" } }] },
});
```

**Supported field types:** `string` | `number` | `boolean` | `array` | `object`

**Built-in rules (full reference in [`@valfuse-node/form` README](../form/README.md#built-in-rules)):**

| Type | Rules |
|---|---|
| `string` | `required`, `min`, `max`, `length`, `email`, `url`, `uuid`, `regex`, `includes`, `startsWith`, `endsWith` |
| `number` | `required`, `min`, `max`, `gt`, `gte`, `lt`, `lte`, `int`, `positive`, `nonnegative`, `negative`, `nonpositive`, `multipleOf` |
| `boolean` | `required`, `literal`, `accepted` |
| `array` | `required`, `min`, `max`, `length`, `nonempty` |
| `object` | `required`, `shape` |
| generic | `custom`, `refine`, `matchField`, `oneOf`, `notOneOf` |

#### `validateSchema(schema, values)`

```ts
const errors = validateSchema(loginSchema, { email: "bad", password: "123" });
// → { email: { message: "Invalid email format", code: "email.invalid", type: "validation" } }
```

#### `transformValues(schema, rawValues)`

```ts
const typed = transformValues(schema, { age: "25", active: "true" });
// → { age: 25, active: true }
```

#### `normalizeError(raw)`

```ts
normalizeError("Something went wrong");
// → { message: "Something went wrong" }
```

#### `t(...transformerNames)` — built-in transformers

| Group | Transformer | Effect |
|---|---|---|
| String | `t.trim`, `t.trimStart`, `t.trimEnd` | Whitespace removal |
| String | `t.toLowerCase`, `t.toUpperCase`, `t.toTitleCase`, `t.toSentenceCase` | Case |
| String | `t.collapseSpaces` | Collapse whitespace |
| Coercion | `t.toNumber`, `t.toInteger`, `t.toFloat` | String → number |
| Coercion | `t.toBoolean` | `"true"/"1"/1/true` → `true` |
| Compose | `t.pipe(...fns)` | Left-to-right composition |

```ts
const schema = createSchema({
  email: { type: "string", transform: t.pipe(t.trim, t.toLowerCase), rules: [{ name: "required", error: { message: "Required" } }] },
});
```

See [`@valfuse-node/form` README](../form/README.md#value-transformation) for full coverage of all transformers and custom-transformer authoring.

### Localization (flattened to top level)

The localization package has three import surfaces (CLI + compiler, browser runtime, types). All are available from `@valfuse-node/core`.

#### Compiler / CLI (Node.js only)

| Export | Use |
|---|---|
| `loadConfig(path)` | Load and parse `valfuse-localization.yaml` |
| `compileProject(config)` | Run the full compile pipeline |
| `normalizeProject(config)` | Normalize raw locale data |
| `validateProject(config)` | Check key/placeholder parity |
| `runInit` / `runGenerate` / `runValidate` / `runCoverage` / `runClean` | CLI command handlers |

```ts
import { loadConfig, compileProject } from "@valfuse-node/core";

const config = await loadConfig("./valfuse-localization.yaml");
const compiled = await compileProject("./", config);
```

#### Runtime (browser-safe)

| Export | Use |
|---|---|
| `interpolate(template, params, options?)` | Replace `{name}` placeholders |
| `lookupMessage(context, key)` | Look up a translation by dot-path key |
| `pickPluralVariant(variants, count)` | Pick plural form by count |
| `pickGenderVariant(variants, gender)` | Pick gender form |
| `pickContextVariant(variants, context)` | Pick context form |
| `pickStructuredPluralVariant` / `pickStructuredGenderVariant` / `pickStructuredContextVariant` | High-level structured variant pickers (auto-parse the JSON payload from the manifest) |
| `parseStructuredVariants(value)` | Decode a JSON-encoded variant map |

```ts
import { interpolate } from "@valfuse-node/core";

interpolate("Hello, {name}!", { name: "Alice" });
// → "Hello, Alice!"

interpolate("{count, plural, one {# item} other {# items}}", { count: 5 });
// → "5 items"
```

#### CLI

```bash
npx valfuse-localization init           # scaffold valfuse-localization.yaml + a sample module
npx valfuse-localization generate       # compile JSON → TypeScript
npx valfuse-localization generate --watch
npx valfuse-localization validate       # key/placeholder parity check
npx valfuse-localization coverage       # per-locale coverage report
npx valfuse-localization clean          # remove generated output
```

Requires **Node.js ≥ 20**.

See [`@valfuse-node/localization` README](../localization/README.md) for the full source-file format, structured variants, config file, and programmatic compiler pipeline.

### React adapter

All React values are at the top level. React is an optional peer dep — if you only use form/localization, you don't need it installed.

```ts
import {
  useReactValfuseForm,        // main hook
  ValfuseController,         // controlled-input bridge component
  LocalizationProvider,      // context provider
  useLocalization,           // translation hook (full localizer API)
  useLocalizationTree,       // nested-tree hook
  createLocalizationStore,   // standalone mutable store
  createLazyLocaleLoader,    // code-split locales
  createSsrLocalizationState,// SSR snapshot helper
  localStorageStrategy, sessionStorageStrategy,
  cookieStrategy, memoryStrategy, composeStorage,
} from "@valfuse-node/core";
```

#### `useReactValfuseForm(options)`

```ts
const form = useReactValfuseForm<UserValues>({
  schema,                 // ValfuseSchema (required)
  defaultValues,          // { [field]: value } (required) — `TFieldValues` is inferred
  mode?: "onSubmit" | "onChange" | "onBlur",
  reValidateMode?: "onChange" | "onBlur" | "onSubmit",
});
```

| Method / Property | Description |
|---|---|
| `form.register(name)` | Spread `{ name, value, onChange, onBlur, ref }` onto an `<input>` |
| `form.handleSubmit(fn)` | Returns `onSubmit` handler; only calls `fn(values)` when validation passes |
| `form.formState.errors` | `Partial<Record<keyof T, ValfuseFieldError>>` — active errors |
| `form.formState.isSubmitting` | `true` while submit function is awaiting |
| `form.formState.isSubmitted` | `true` after first submit attempt |
| `form.formState.isSubmitSuccessful` | `true` if the most recent submit completed without throwing |
| `form.formState.submitCount` | Total submit attempts |
| `form.formState.isValid` | `true` when no validation errors exist |
| `form.formState.isDirty` | `true` when any field differs from `defaultValues` |
| `form.formState.dirtyFields` | Fields that differ from `defaultValues` |
| `form.formState.touchedFields` | Fields the user has blurred |
| `form.formState.defaultValues` | The defaults passed to the hook |
| `form.setErrors(errors)` | Inject errors manually (e.g. from API response) |
| `form.clearErrors(fields?)` | Clear one, many, or all errors |
| `form.setValue(name, value, options?)` | Programmatically set a field value (`{ shouldValidate: true }` to run validation) |
| `form.trigger(name?)` | Manually trigger validation. `name` can be a string, an array, or omitted (validate all) |
| `form.watch(...)` | Multi-overload subscribe / snapshot — `watch()`, `watch("email")`, `watch(["a","b"])`, `watch(callback)` |
| `form.reset(values?)` | Reset to `defaultValues` (or provided partial values); also clears submission state |
| `form.control` | Pass to `<ValfuseController>` for custom inputs |

#### `<ValfuseController>`

For controlled inputs that don't work with `register` (custom select, date picker, checkbox group).

```tsx
<ValfuseController
  control={form.control}
  name="role"
  render={({ field, fieldState }) => (
    <Select
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      isInvalid={!!fieldState.error}
    />
  )}
/>
```

#### Localization runtime

```tsx
import {
  useReactValfuseForm,
  LocalizationProvider,
  useLocalization,
  localStorageStrategy,
} from "@valfuse-node/core";

<LocalizationProvider
  manifest={localization}
  storage={localStorageStrategy({ key: "app-locale" })}
  initialLocale="en"
>
  <App />
</LocalizationProvider>;

function Header() {
  const { translate, locale, setLocale } = useLocalization();
  return (
    <header>
      <h1>{translate("common.app.title")}</h1>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="id">Bahasa Indonesia</option>
      </select>
    </header>
  );
}
```

**`useLocalization()` returns:**

| Group | API | Description |
|---|---|---|
| Translate | `translate(key, fallback?)` | Lookup with optional fallback |
| Translate | `translateOrNull(key)` | Returns `null` when missing or key is `null`/`undefined` |
| Format | `format(key, params)` | Lookup + placeholder interpolation |
| Format | `formatOrNull(key, params)` | Format, returns `null` when missing |
| Variants | `plural(key, count)` | Pick a plural branch |
| Variants | `pluralOrNull(key, count)` | Plural, returns `null` when missing |
| Variants | `gender(key, value, params)` | Pick a gender branch |
| Variants | `context(key, value, params?)` | Pick a context branch |
| Namespace | `namespace(scope)` | Returns a `NamespacedLocalizer` with the 8 methods above, all auto-prefixed |
| Iteration | `entriesForLocale` | `Array<[key, value]>` sorted alphabetically by key |
| Context | `locale` | Current locale string |
| Context | `setLocale(locale)` | Switch active locale (also writes to the configured `storage`) |
| Context | `store` | Lower-level `LocalizationStore` — `store.t(key, params)`, `store.getLocale()`, `store.setLocale(locale)` |
| Context | `manifest` | The raw `RuntimeManifest` passed to the provider |

**Storage strategies:** `localStorageStrategy` | `sessionStorageStrategy` | `cookieStrategy` | `memoryStrategy` | `composeStorage`

See [`@valfuse-node/react` README](../react/README.md#localization-runtime) for full storage-strategy options and the `useLocalizationTree()` hook.

### Vue adapter

All Vue values are at the top level. Vue is an optional peer dep.

```vue
<script setup lang="ts">
import { createSchema, useVueValfuseForm } from "@valfuse-node/core";

const schema = createSchema({
  email:    { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "email", error: { message: "Invalid" } }] },
  password: { type: "string", rules: [{ name: "required", error: { message: "Required" } }, { name: "minLength", value: 8, error: { message: "Min 8" } }] },
});

type Values = { email: string; password: string };

const form = useVueValfuseForm<Values>({
  schema,
  defaultValues: { email: "", password: "" },
});

async function onSubmit(values: Values) {
  await loginApi(values);
}
</script>

<template>
  <form @submit="form.handleSubmit(onSubmit)">
    <input v-bind="form.register('email')" />
    <p v-if="form.formState.errors.email">{{ form.formState.errors.email.message }}</p>
    <input type="password" v-bind="form.register('password')" />
    <p v-if="form.formState.errors.password">{{ form.formState.errors.password.message }}</p>
    <button type="submit" :disabled="form.formState.isSubmitting">Log in</button>
  </form>
</template>
```

The Vue `register()` returns `{ name, modelValue, "onUpdate:modelValue", onBlur }` — compatible with Vue's `v-bind` and `v-model`. The form contract is **identical at the type level** with the React adapter.

> **Heads-up:** The Vue adapter is currently a thin composable; it does not yet expose a `<ValfuseController>` equivalent, `getValue`/`getValues` convenience getters, or all the `useLocalization`-family helpers. See [`@valfuse-node/vue` README](../vue/README.md#api-parity-vs-react) for the full parity matrix.

---

## End-to-End Example

A complete React form with validation, transformation, server-error injection, and localization:

```tsx
import {
  createSchema,
  useReactValfuseForm,
  ValfuseController,
  LocalizationProvider,
  useLocalization,
  localStorageStrategy,
} from "@valfuse-node/core";
import manifest from "./loc/manifest.json";

const schema = createSchema({
  email: {
    type: "string",
    transform: (v) => String(v).trim().toLowerCase(),
    rules: [
      { name: "required", error: { message: "Email is required", code: "email.required" } },
      { name: "email",    error: { message: "Invalid email",     code: "email.invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required",  error: { message: "Required",  code: "password.required" } },
      { name: "minLength", value: 8, error: { message: "Min 8 chars", code: "password.min" } },
    ],
  },
});

export function App() {
  return (
    <LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
      <SignupForm />
    </LocalizationProvider>
  );
}

export function SignupForm() {
  const { translate, format } = useLocalization();

  const form = useReactValfuseForm({
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
        {translate("auth.email")}
        <input {...form.register("email")} />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email.message}</span>
        )}
      </label>

      <label>
        {translate("auth.password")}
        <input type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <span className="error">{form.formState.errors.password.message}</span>
        )}
      </label>

      <ValfuseController
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <input
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            className={fieldState.error ? "invalid" : ""}
          />
        )}
      />

      <button type="submit" disabled={form.formState.isSubmitting}>
        {translate("auth.submit")}
      </button>

      <p>{format("auth.password_hint", { min: 8 })}</p>
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
│    ├─ React adapter exports (flat, with useReactValfuseForm)│
│    └─ Vue adapter exports   (flat, with useVueValfuseForm) │
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

- [`@valfuse-node/form`](../form/README.md) — schema, rules, transformers, validation, framework-agnostic state
- [`@valfuse-node/localization`](../localization/README.md) — CLI, compiler, runtime interpolation, structured variants, validators
- [`@valfuse-node/react`](../react/README.md) — `useValfuseForm`, `<ValfuseController>`, `LocalizationProvider`, storage strategies
- [`@valfuse-node/vue`](../vue/README.md) — `useValfuseForm` composable, v-model bindings, parity with React

---

## License

[MIT](../../LICENSE)
