# valfuse-node

> **Config-first form validation and localization library for React and Vue.**
> No Zod. No react-hook-form. No UI coupling. Just plain objects and framework hooks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Turbo](https://img.shields.io/badge/monorepo-turbo-blueviolet)](https://turbo.build/)
[![CI](https://github.com/alpinnz/valfuse-node/actions/workflows/ci.yml/badge.svg)](https://github.com/alpinnz/valfuse-node/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@valfuse-node/core?label=npm%40valfuse-node&color=cb3837)](https://www.npmjs.com/org/valfuse-node)

---

## Table of Contents

- [Why Valfuse?](#why-valfuse)
- [Packages](#packages)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Sub-package READMEs](#sub-package-readmes)
- [Development](#development)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

---

## Why Valfuse?

Most form libraries require you to learn a heavy abstraction or lock you into a specific validation engine (Zod, Yup, etc.). Valfuse takes a different approach:

| Concern           | Valfuse approach                                                         |
| ----------------- | ------------------------------------------------------------------------ |
| Schema definition | Plain objects — readable, serializable, no runtime magic                 |
| Validation        | Native rule engine, no Zod / Yup dependency                              |
| React integration | Only `useState`, `useRef`, `useCallback` — no hidden state machines      |
| Vue integration   | Native Vue composable with `reactive`, `ref` — no extra wrapper          |
| Error model       | Schema, manual, and server errors unified in `formState.errors`          |
| Localization      | YAML-configured CLI that compiles JSON locales into type-safe TypeScript |
| UI                | Zero UI coupling — works with any component library or raw HTML          |
| Multi-framework   | One schema is reused across React, Vue, and Node.js                      |

---

## Packages

| Package                                                           | Description                                                                             | npm          |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------ |
| [`@valfuse-node/core`](./packages/core/README.md)                 | **Umbrella entry point** — re-exports form, localization, and adapters from one package | ✅ published |
| [`@valfuse-node/form`](./packages/form/README.md)                 | Framework-agnostic schema, rules, validation, transformation, state                     | ✅ published |
| [`@valfuse-node/react`](./packages/react/README.md)               | React `useValfuseForm` hook, `<ValfuseController>`, full localization runtime           | ✅ published |
| [`@valfuse-node/vue`](./packages/vue/README.md)                   | Vue 3 `useValfuseForm` composable with native v-model bindings                          | ✅ published |
| [`@valfuse-node/localization`](./packages/localization/README.md) | CLI compiler: JSON/YAML → type-safe TypeScript localization + browser runtime           | ✅ published |

> The `@valfuse-node/example-react` and `@valfuse-node/example-vue` packages are private playgrounds — see [Examples](#examples).

---

## Installation

For most apps, install the umbrella:

```bash
npm install @valfuse-node/core
# + peer (only what you actually use)
npm install react@>=18 react-dom@>=18     # for the React adapter
npm install vue@>=3                        # for the Vue adapter
```

If you only need a subset (e.g. just the form domain in a server action):

```bash
npm install @valfuse-node/form
```

If you only need the localization CLI / runtime:

```bash
npm install @valfuse-node/localization
```

---

## Quick Start

### 🧩 Form-only (Node.js, server actions)

```ts
import { createSchema, validateSchema, transformValues, t } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "email", error: { message: "Invalid" } },
    ],
  },
  age: {
    type: "number",
    transform: t.toInteger,
    rules: [{ name: "min", value: 18, error: { message: "18+" } }],
  },
});

const cleaned = transformValues(schema, { email: "  Alice@Example.com  ", age: "25" });
const errors = validateSchema(schema, cleaned);
```

### ⚛️ React

```tsx
import { createSchema, useReactValfuseForm } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "email", error: { message: "Invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "minLength", value: 8, error: { message: "Min 8" } },
    ],
  },
});

export function LoginForm() {
  const form = useReactValfuseForm({
    schema,
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  return (
    <form
      onSubmit={form.handleSubmit(async (values) => {
        await loginApi(values);
      })}
    >
      <input {...form.register("email")} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}

      <input type="password" {...form.register("password")} />
      {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}

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
import { createSchema, useVueValfuseForm } from "@valfuse-node/core";

const schema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "email", error: { message: "Invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Required" } },
      { name: "minLength", value: 8, error: { message: "Min 8" } },
    ],
  },
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
npx valfuse-localization init
npx valfuse-localization generate
npx valfuse-localization generate --watch
```

```tsx
import { LocalizationProvider, useLocalization, localStorageStrategy } from "@valfuse-node/core";
import manifest from "./loc/manifest.json";

<LocalizationProvider manifest={manifest} storage={localStorageStrategy()}>
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

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  valfuse-node monorepo (npm workspaces + Turbo)               │
└────────────────────────────────────────────────────────────────┘
              │
              ├─ @valfuse-node/core       (umbrella facade)
              │     ├─ @valfuse-node/form
              │     ├─ @valfuse-node/localization
              │     ├─ @valfuse-node/react  (peer: react)
              │     └─ @valfuse-node/vue    (peer: vue)
              │
              ├─ packages/examples/react-example  (private)
              └─ packages/examples/vue-example    (private)
```

**Dependency direction** (strictly inner→outer is forbidden):

| Package        | Depends on                             | Peer                                      |
| -------------- | -------------------------------------- | ----------------------------------------- |
| `form`         | —                                      | —                                         |
| `localization` | —                                      | —                                         |
| `react`        | `form`, `localization`                 | `react >= 18`                             |
| `vue`          | `form`                                 | `vue >= 3`                                |
| `core`         | `form`, `localization`, `react`, `vue` | `react >= 18`, `vue >= 3` (both optional) |

**Build order:** `form` → `localization` → `react` → `vue` → `core` (turbo handles this automatically).

**Bundle:** `@valfuse-node/core` is a ~270-byte ESM facade — it re-exports named values from the four sub-packages. Bundlers still tree-shake unused exports.

---

## Sub-package READMEs

For deeper detail on any specific surface:

- [**`@valfuse-node/core`**](./packages/core/README.md) — umbrella entry point with full quick-start and import map
- [**`@valfuse-node/form`**](./packages/form/README.md) — schema, all rules by type, transformers, validation, framework-agnostic state
- [**`@valfuse-node/localization`**](./packages/localization/README.md) — CLI, compiler pipeline, source-file format, structured variants, validators, runtime
- [**`@valfuse-node/react`**](./packages/react/README.md) — `useValfuseForm`, `<ValfuseController>`, `<LocalizationProvider>`, storage strategies, `useLocalization` full API
- [**`@valfuse-node/vue`**](./packages/vue/README.md) — `useValfuseForm` composable, v-model bindings, React parity matrix

---

## Development

### Prereqs

- Node.js ≥ 20 (required by `@valfuse-node/localization`)
- npm ≥ 10 (the repo uses npm workspaces; not yarn/pnpm)

### Bootstrap

```bash
git clone https://github.com/alpinnz/valfuse-node.git
cd valfuse-node
npm install
npm run build
```

### Common scripts

```bash
npm run build         # Build all packages in dependency order (turbo)
npm run dev           # Watch mode for all packages
npm run lint          # ESLint
npm run typecheck     # TypeScript --noEmit across all packages
npm run test          # Run all unit tests
npm run clean         # Remove all dist/ + node_modules/.cache/turbo
```

### Per-package scripts

Each package exposes the same scripts — `npm run -w @valfuse-node/form build`, `npm run -w @valfuse-node/localization test`, etc.

### Project layout

```
valfuse-node/
├── packages/
│   ├── core/                 ← umbrella facade (270 B)
│   ├── form/                 ← schema + rules + validation (framework-agnostic)
│   ├── localization/         ← CLI + compiler + runtime
│   ├── react/                ← React adapter
│   ├── vue/                  ← Vue adapter
│   └── examples/
│       ├── react-example/    ← private playground (UserObjectForm, UserIdForm)
│       └── vue-example/      ← private playground (AllFeaturesForm, etc.)
├── docs/
│   └── adr/                  ← Architecture Decision Records
├── package.json              ← root workspace + scripts
├── turbo.json
└── tsconfig.base.json
```

---

## Examples

Two private reference apps under `packages/examples/`. Use them to copy-paste working patterns into your own project.

### `packages/examples/react-example`

```bash
cd packages/examples/react-example
npm run dev          # http://localhost:5173
```

Demonstrates:

- `useValfuseForm` with `register()` for text inputs
- `<ValfuseController>` for a custom role dropdown (object value + ID value patterns)
- `form.setErrors()` for server-side error mapping
- `LocalizationProvider` + `useLocalization` for full i18n
- Watch mode for the localization CLI

### `packages/examples/vue-example`

```bash
cd packages/examples/vue-example
npm run dev          # http://localhost:5174
```

Demonstrates:

- All `useValfuseForm` API surface in one form (`AllFeaturesForm`)
- `getValue` / `setValue` for custom selects (Vue has no `ValfuseController` yet)
- `watch(name, cb)` per-field reactive subscription
- `form.setErrors()` for server validation
- `form.reset()` to defaultValues and partial overrides
- Mode selector — `onSubmit` | `onChange` | `onBlur` | `all`

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow, branch strategy, and PR conventions. The monorepo uses:

- **turbo** for build orchestration
- **npm workspaces** for dependency management
- **tsup** for library builds (CJS + ESM + DTS)
- **vitest** for unit tests
- **ESLint** (flat config) + **typescript-eslint**
- **Keep a Changelog** format — see [`CHANGELOG.md`](./CHANGELOG.md)

---

## License

[MIT](./LICENSE)
