# valfuse-node

> **Config-first form validation, localization, static asset tooling, and TypeScript barrel generation for Express, React, and Vue.**
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
- [Support](#support)
- [License](#license)

---

## Why Valfuse?

Most form libraries require you to learn a heavy abstraction or lock you into a specific validation engine (Zod, Yup, etc.). Valfuse takes a different approach:

| Concern           | Valfuse approach                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------- |
| Schema definition | Plain objects — readable, serializable, no runtime magic                                     |
| Validation        | Native rule engine, no Zod / Yup dependency                                                  |
| React integration | Only `useState`, `useRef`, `useCallback` — no hidden state machines                          |
| Vue integration   | Native Vue composable with `reactive`, `ref` — no extra wrapper                              |
| Error model       | Schema, manual, and server errors unified in `formState.errors`                              |
| Localization      | YAML-configured CLI that compiles JSON locales into type-safe TypeScript                     |
| UI                | Zero UI coupling — works with any component library or raw HTML                              |
| Multi-framework   | One validation engine supports React, Vue, and Node.js; schemas can follow each API contract |

---

## Packages

| Package                                                           | Description                                                                   | npm            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------- |
| [`@valfuse-node/core`](./packages/core/README.md)                 | **Umbrella entry point** — runtime facade and explicit Node.js subpaths       | ✅ published   |
| [`@valfuse-node/assets`](./packages/assets/README.md)             | CLI and Node.js API for generating typed TypeScript paths for static assets   | ✅ published   |
| [@valfuse-node/barrel](./packages/barrel/README.md)               | CLI and Node.js API for generating TypeScript barrel files                    | ✅ published   |
| [`@valfuse-node/validation`](./packages/validation/README.md)     | Framework-neutral schemas, rules, transforms, and validation                  | 🆕 new package |
| [`@valfuse-node/form`](./packages/form/README.md)                 | Framework-neutral form-state primitives                                       | ✅ published   |
| [`@valfuse-node/react`](./packages/react/README.md)               | React `useValfuseForm` hook, `<ValfuseController>`, full localization runtime | ✅ published   |
| [`@valfuse-node/vue`](./packages/vue/README.md)                   | Vue 3 `useValfuseForm` composable with native v-model bindings                | ✅ published   |
| [`@valfuse-node/express`](./packages/express/README.md)           | Express middleware for request validation and localization                    | ✅ published   |
| [`@valfuse-node/localization`](./packages/localization/README.md) | CLI compiler: JSON/YAML → type-safe TypeScript localization + browser runtime | ✅ published   |

> The `@valfuse-node/example-react`, `@valfuse-node/example-vue`, and `@valfuse-node/example-express` packages are private examples — see [Examples](#examples).

---

## Installation

For the full core root facade, install the umbrella and its React and Vue peer
packages. The root facade re-exports both adapters, so both peers must be
resolvable when the root entry is loaded:

```bash
npm install @valfuse-node/core react react-dom vue
```

For a framework-neutral project, install only the packages you use:

```bash
npm install @valfuse-node/validation @valfuse-node/localization
```

For one framework adapter, use its package with the form-state and validation
packages and that framework's peer dependencies:

```bash
npm install @valfuse-node/react @valfuse-node/form @valfuse-node/validation react react-dom
npm install @valfuse-node/vue @valfuse-node/form @valfuse-node/validation vue
npm install @valfuse-node/express @valfuse-node/validation @valfuse-node/localization express
```

To generate typed paths for files under your app's public asset directory:

```bash
npm install --save-dev @valfuse-node/assets
# Add an `assets` section to valfuse.yaml in the project root, then run:
npx valfuse-assets
```

The YAML config maps `input_dir`, `output_file`, and `base_path`; see the
[assets package README](./packages/assets/README.md) for a complete example.

---

To generate package entry barrels from selected TypeScript modules:

```
npm install --save-dev @valfuse-node/barrel
# Add a `barrel` section to valfuse.yaml, then run:
npx valfuse-barrel
```

The **@valfuse-node/core** root import exports the form, validation,
localization, React, and Vue APIs. Its explicit **/assets**, **/barrel**,
**/express**, and **/validation** subpaths expose the Node.js generator APIs,
Express middleware, and validation-only entry without loading them through the
root import. Install the individual packages directly when you only need their
CLI tools or Express integration.

## Quick Start

### 🧩 Validation-only (Node.js, server actions)

```ts
import { createSchema, validateSchema, transformValues, t } from "@valfuse-node/validation";

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
              │     ├─ @valfuse-node/assets (subpath: /assets)
              │     ├─ @valfuse-node/barrel (subpath: /barrel)
              │     ├─ @valfuse-node/validation (subpath: /validation)
              │     ├─ @valfuse-node/form
              │     ├─ @valfuse-node/localization
              │     ├─ @valfuse-node/express (peer: express)
              │     ├─ @valfuse-node/react  (peer: react)
              │     └─ @valfuse-node/vue    (peer: vue)
              │
              ├─ examples/express-example (private)
              ├─ examples/react-example  (private)
              └─ examples/vue-example    (private)
```

**Dependency direction** (strictly inner→outer is forbidden):

| Package        | Depends on                                                               | Peer                             |
| -------------- | ------------------------------------------------------------------------ | -------------------------------- |
| `validation`   | —                                                                        | —                                |
| `form`         | `validation`                                                             | —                                |
| `assets`       | `yaml` (generator config)                                                | —                                |
| `barrel`       | `yaml` (generator config)                                                | —                                |
| `localization` | `yaml`, `chokidar` (Node compiler/watch)                                 | —                                |
| `react`        | `form`, `validation`, `localization`                                     | `react >= 18`, `react-dom >= 18` |
| `vue`          | `form`, `validation`, `localization`                                     | `vue >= 3`                       |
| `express`      | `validation`, `localization`                                             | `express >= 4.18`                |
| `core`         | `form`, `validation`, `localization`, `react`, `vue`, `assets`, `barrel` | React, Vue, Express (optional)   |

The core root facade re-exports the React and Vue adapters, so direct Node.js
imports of that facade need both peer modules available. Express is an optional
peer used only by the explicit `/express` subpath; the React adapter also
requires `react-dom >= 18`.

**Build order:** `validation` → `form` → `express` / `react` / `vue` → `core`
(turbo handles this automatically; `localization`, `assets`, and `barrel` are
built as dependencies where needed).

**Bundle and peer loading:** `@valfuse-node/core` is a re-export facade with
named values from its package dependencies. Compatible bundlers can tree-shake
unused exports, but the root entry statically re-exports both framework
adapters. Direct Node.js imports therefore require the React and Vue peer
modules to resolve. Use standalone packages or one adapter package when the
application should not depend on an unused framework.

For package boundaries, conventions, and engineering guides, see the
[`docs/` index](./docs/README.md).

---

## Sub-package READMEs

- [**@valfuse-node/barrel**](./packages/barrel/README.md) — CLI and Node.js API for generating TypeScript barrel files

For deeper detail on any specific surface:

- [**`@valfuse-node/core`**](./packages/core/README.md) — umbrella entry point with full quick-start and import map
- [**`@valfuse-node/assets`**](./packages/assets/README.md) — CLI and Node.js API for generating a typed static asset registry
- [**`@valfuse-node/validation`**](./packages/validation/README.md) — schemas, rules, transformers, and validation
- [**`@valfuse-node/form`**](./packages/form/README.md) — framework-agnostic form-state primitives
- [**`@valfuse-node/localization`**](./packages/localization/README.md) — CLI, compiler pipeline, source-file format, structured variants, validators, runtime
- [**`@valfuse-node/react`**](./packages/react/README.md) — `useValfuseForm`, `<ValfuseController>`, `<LocalizationProvider>`, storage strategies, `useLocalization` full API
- [**`@valfuse-node/vue`**](./packages/vue/README.md) — `useValfuseForm`, Vue-native form bindings, localization provider and composables
- [**`@valfuse-node/express`**](./packages/express/README.md) — request validation and request-scoped localization middleware

---

## Development

### Prereqs

- Node.js ≥ 22 (see `.nvmrc`)
- npm 11 (the repository pins `npm@11.6.2` and uses npm workspaces)

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
npm run format        # Prettier --write the whole repo
npm run format:check  # Prettier --check (CI gate)
npm run validate      # format:check + lint + typecheck + test
npm run clean         # Remove all dist/ + node_modules/.cache/turbo
```

### Commit & release conventions

Commits are enforced as **Conventional Commits** by husky hooks (`commitlint`
on commit-msg, `lint-staged` on pre-commit) — invalid messages are rejected
locally. Types: `feat fix docs style refactor perf test build ci chore revert`;
scopes mirror the packages (`core`, `form`, `localization`, `react`, `vue`,
`examples`, …). See the
[release and publishing guide](./docs/release-and-publishing.md) for the full
reference.

Releasing is fully automated per package via git tags:

```bash
# 1. Bump the version in packages/<pkg>/package.json, commit, push (triggers CI)
# 2. Verify the tag matches the package version:
npm run release:verify -- v0.4.1-react
# 3. Tag and push — GitHub Actions tests, builds, and publishes to npm:
git tag v0.4.1-react && git push origin v0.4.1-react
```

Published packages carry **SLSA provenance** attestations; each release runs
test → build → version-verify → publish inside a single workflow
([`publish.yml`](./.github/workflows/publish.yml)).

### Per-package scripts

Packages expose the scripts relevant to their source; schema validation tests
live in `@valfuse-node/validation`.

### Project layout

```
valfuse-node/
├── packages/
│   ├── assets/               ← static asset path generator
│   ├── barrel/               ← TypeScript barrel generator
│   ├── core/                 ← umbrella facade
│   ├── form/                 ← framework-agnostic form state
│   ├── validation/           ← schemas, rules, and transformations
│   ├── express/              ← Express middleware adapter
│   ├── localization/         ← CLI + compiler + runtime
│   ├── react/                ← React adapter
│   └── vue/                  ← Vue adapter
├── examples/
│   ├── react-example/        ← private playground (UserObjectForm, UserIdForm)
│   ├── vue-example/          ← private playground (AllFeaturesForm, etc.)
│   └── express-example/      ← Express middleware and request examples
├── docs/                     ← Architecture and engineering guides
├── package.json              ← root workspace + scripts
├── turbo.json
└── tsconfig.base.json
```

---

## Examples

Three private reference apps live under `examples/`. Use them to copy working
patterns into your own project. The React and Vue apps cover form state, the
validation engine, generated assets, localization, barrel generation, and the core facade.
The Express app demonstrates request validation, request-scoped localization,
static assets, and generated route exports. All three use the shared
`@valfuse-node/barrel` CLI for generated exports. Their guides document the
relevant package APIs and workspace commands:

- [React example guide](./examples/react-example/README.md)
- [Vue example guide](./examples/vue-example/README.md)
- [Express example guide](./examples/express-example/README.md)

### `examples/react-example`

```bash
cd examples/react-example
npm run dev          # http://localhost:5173
```

The [React example guide](./examples/react-example/README.md) includes a
package-to-feature map and the generator commands.

Demonstrates:

- `useValfuseForm` with `register()` for text inputs
- `<ValfuseController>` for a custom role dropdown (object value + ID value patterns)
- `form.setErrors()` for server-side error mapping
- `LocalizationProvider` + `useLocalization` for full i18n
- Watch mode for the localization CLI

### `examples/vue-example`

```bash
cd examples/vue-example
npm run dev          # http://localhost:5174
```

The [Vue example guide](./examples/vue-example/README.md) includes a
package-to-feature map and the generator commands.

Demonstrates:

- All `useValfuseForm` API surface in one form (`AllFeaturesForm`)
- `getValue` / `setValue` for custom selects (Vue has no `ValfuseController` yet)
- `watch(name, cb)` per-field reactive subscription
- `form.setErrors()` for server validation
- `form.reset()` to defaultValues and partial overrides
- Mode selector — `onSubmit` | `onChange` | `onBlur` | `all`

### `examples/express-example`

```bash
npm run dev:express   # http://localhost:3000
```

The [Express example guide](./examples/express-example/README.md) includes
request examples and the generator commands.

Demonstrates:

- `validateBody()`, `validateParams()`, and `validateQuery()` with transforms and schema validation
- `createLocalizationMiddleware()` using the `Accept-Language` header
- The `@valfuse-node/core/express` entry point
- Generated asset paths, static file serving, and route barrels

---

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow,
branch strategy, and PR conventions. Contributions follow the
[Code of Conduct](./CODE_OF_CONDUCT.md). The monorepo uses:

- **turbo** for build orchestration
- **npm workspaces** for dependency management
- **tsup** for library builds (CJS + ESM + DTS)
- **vitest** for unit tests
- **ESLint** (flat config) + **typescript-eslint**
- **Keep a Changelog** format — see [`CHANGELOG.md`](./CHANGELOG.md)

---

## Support

For usage questions, bug reports, or feature requests, see
[`SUPPORT.md`](./SUPPORT.md). For security vulnerabilities, follow
[`SECURITY.md`](./SECURITY.md); do not report them in public issues.

---

## License

[MIT](./LICENSE)
