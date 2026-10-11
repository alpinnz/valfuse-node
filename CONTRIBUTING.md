# Contributing

Thank you for your interest in contributing to `valfuse-node`.

By participating, you agree to follow the project's
[Code of Conduct](./CODE_OF_CONDUCT.md).

---

## Prerequisites

- Node.js `>=22`
- npm `>=11`

---

## Setup

```bash
git clone https://github.com/alpinnz/valfuse-node.git
cd valfuse-node
npm install
npm run build
```

---

## Project Structure

```
valfuse-node/
├── packages/
│   ├── assets/                          # @valfuse-node/assets
│   ├── barrel/                          # @valfuse-node/barrel
│   ├── core/                            # Root facade and /assets, /barrel, /express subpaths
│   ├── express/                         # @valfuse-node/express middleware
│   ├── form/                            # @valfuse-node/form domain
│   ├── localization/                    # Compiler, CLI, and browser runtime
│   ├── react/                           # @valfuse-node/react adapter
│   ├── vue/                             # @valfuse-node/vue adapter
├── examples/
│   ├── express-example/                 # Private Express server reference
│   ├── react-example/                   # Private React playground
│   └── vue-example/                     # Private Vue 3 playground
├── docs/                                # Architecture and engineering guides
├── turbo.json
├── tsconfig.base.json
└── eslint.config.mjs
```

---

## Development Workflow

```bash
# Run the example playground
npm run dev

# Run only the React example
npm run dev:react

# Run only the Vue example
npm run dev:vue

# Run only the Express example
npm run dev:express

# Build all packages
npm run build

# Run all tests
npm run test

# TypeScript check
npm run typecheck

# Lint
npm run lint

# Clean all build artifacts
npm run clean
```

### Workspace-scoped commands

```bash
# Test a specific package
npm run test --workspace=packages/core
npm run test --workspace=packages/react
npm run test --workspace=packages/express

# Localization CLI (from root)
npm run example:localization:generate
npm run example:localization:watch
npm run example:localization:validate
```

---

## Publishing

```bash
# Publish individual packages
npm run publish:assets
npm run publish:barrel
npm run publish:form
npm run publish:localization
npm run publish:express
npm run publish:react
npm run publish:vue
npm run publish:core

# Publish all packages at once
npm run publish:all
```

---

## Definition of Done

A task is considered done when:

- [ ] Implementation matches the requirement
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Lint passes without errors (`npm run lint`)
- [ ] Tests related to the change pass (`npm run test`)
- [ ] The example app still runs (`npm run dev`)
- [ ] Documentation is updated
- [ ] Public APIs are exported from `public-api.ts` and re-exported via `index.ts`
- [ ] No unnecessary dependencies added
- [ ] No direct imports into internal module files of other packages

---

## Coding Standards

### Naming

| Unit             | Convention                        | Example              |
| ---------------- | --------------------------------- | -------------------- |
| React component  | Descriptive noun (`PascalCase`)   | `ValfuseController`  |
| Vue composable   | `use` prefix (`camelCase`)        | `useValfuseForm`     |
| Logic function   | Action/domain verb (`camelCase`)  | `validateStringRule` |
| Helper/utility   | Transformation name (`camelCase`) | `normalizeError`     |
| Constant         | `UPPER_SNAKE_CASE`                | `EMAIL_REGEX`        |
| File             | `kebab-case`                      | `validate-schema.ts` |
| Type / Interface | `PascalCase`                      | `ValfuseSchema`      |

### Forbidden

- Abbreviations like `str`, `num`, `arr`, `err` — use `stringValue`, `numericValue`, `parsedArray`, `caughtError`
- Magic strings/numbers without named constants
- Dead code
- Comments that explain bad code instead of fixing it
- Generic names like `data`, `info`, `item`, `handler` without context

### Architecture Rules

- `form` is a zero-dependency domain package. `localization` has Node.js compiler dependencies, but neither package may import React, Vue, Express, or another framework adapter
- `react` may depend on `form` and `localization` only — no external form libraries
- `vue` may depend on `form` and `localization` only — no external form libraries
- `express` may depend on `form` and `localization`; Express is its framework peer
- `core` is the **umbrella facade** — its root re-exports from `form`, `localization`, `react`, and `vue`; Express and the Node.js generators are explicit subpaths. It must not contain domain logic of its own.
- `localization` must not depend on React or any UI framework (browser runtime is framework-agnostic)
- Each example may depend on the packages needed by its framework and demo
- Public APIs must be exported from each package entry point. `form`, `localization`, `react`, and `vue` curate exports in `public-api.ts`; `assets`, `barrel`, and `express` export through their entry files, while `core` provides its root and explicit subpath entry points.
- No cross-package internal imports (e.g. `@valfuse-node/form/src/rules/string.rule`)
- The `localization` package exposes two entry points: `index.ts` (Node.js/CLI) and `browser.ts` (runtime)

---

## Testing

```bash
npm run test                                      # all packages
npm run test --workspace=packages/core            # @valfuse-node/core only
npm run test --workspace=packages/react           # @valfuse-node/react only
```

Test naming format:

```ts
describe("validateSchema", () => {
  it("should return required error when string value is empty", () => { ... });
});
```

---

## Commit Convention

Use clear, imperative commit messages scoped to the affected package:

```
feat(core): add matchField rule
fix(react): update setErrors type inference for object errors
feat(localization): add structured variant support to runtime
fix(vue): resolve reactivity issue in useValfuseForm
docs(core): document regex rule pattern config format
test(core): add unit tests for number rules
chore: bump turbo and typescript to latest
```

---

## Package Manager

This project uses **npm** exclusively. Do not use `pnpm`, `yarn`, or `bun`.
