# Contributing

Thank you for your interest in contributing to `valfuse-node`.

---

## Prerequisites

- Node.js `>=20`
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
│   ├── core/                            # @valfuse-node/core (umbrella — re-exports the others)
│   │   └── src/
│   │       └── index.ts                 # Facade: re-exports from form/localization (flat) and react/vue (namespaced as ReactAdapter / VueAdapter)
│   │
│   ├── localization/                    # @valfuse-node/localization
│   │   └── src/
│   │       ├── cli/                     # CLI commands (generate, validate, coverage, init, clean)
│   │       ├── compiler/                # Build manifest, runtime model, React runtime files
│   │       ├── config/                  # Load, normalize, and validate project config
│   │       ├── coverage/                # Coverage report builders (HTML, JSON)
│   │       ├── diagnostics/             # Diagnostic codes and terminal report renderer
│   │       ├── emitter/                 # Output dir management and runtime file emission
│   │       ├── loader/                  # File index builder and locale file scanner
│   │       ├── normalizer/              # Key/node normalization and metadata handling
│   │       ├── parser/                  # Localization file parser and placeholder extractor
│   │       ├── runtime/                 # Browser runtime (interpolation, variants, lookup)
│   │       ├── types/                   # Shared TypeScript types
│   │       ├── validator/               # Validation rules (parity, depth, collisions, placeholders)
│   │       ├── watch/                   # Watch service and ignore patterns
│   │       ├── browser.ts               # Browser/runtime package entry point
│   │       ├── public-api.ts            # Named re-exports for the public API
│   │       └── index.ts                 # Package entry point (Node.js / CLI)
│   │
│   ├── react/                           # @valfuse-node/react
│   │   └── src/
│   │       ├── components/              # ValfuseController
│   │       ├── helpers/                 # Field error helpers, validation mode utilities
│   │       ├── hooks/                   # useValfuseForm
│   │       ├── localization/
│   │       │   ├── bridge/              # LocalizationStore
│   │       │   ├── hooks/               # useLocalization, useLocalizationTree
│   │       │   ├── lazy/                # createLazyLocaleLoader
│   │       │   ├── provider/            # LocalizationProvider
│   │       │   ├── ssr/                 # createSsrLocalizationState
│   │       │   └── storage/             # localeStorage
│   │       ├── types/                   # React-specific TypeScript types
│   │       ├── public-api.ts            # Named re-exports for the public API
│   │       └── index.ts                 # Package entry point
│   │
│   ├── vue/                             # @valfuse-node/vue
│   │   └── src/
│   │       ├── composables/             # useValfuseForm
│   │       ├── types/                   # Vue-specific TypeScript types
│   │       ├── public-api.ts            # Named re-exports for the public API
│   │       └── index.ts                 # Package entry point
│   │
   └── examples/
       ├── react-example/               # Private playground — React (not published)
       └── vue-example/                 # Private playground — Vue 3 (not published)
│
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

# Localization CLI (from root)
npm run example:localization:generate
npm run example:localization:watch
npm run example:localization:validate
```

---

## Publishing

```bash
# Publish individual packages
npm run publish:core
npm run publish:localization
npm run publish:react
npm run publish:vue

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

| Unit | Convention | Example |
|---|---|---|
| React component | Descriptive noun (`PascalCase`) | `ValfuseController` |
| Vue composable | `use` prefix (`camelCase`) | `useValfuseForm` |
| Logic function | Action/domain verb (`camelCase`) | `validateStringRule` |
| Helper/utility | Transformation name (`camelCase`) | `normalizeError` |
| Constant | `UPPER_SNAKE_CASE` | `EMAIL_REGEX` |
| File | `kebab-case` | `validate-schema.ts` |
| Type / Interface | `PascalCase` | `ValfuseSchema` |

### Forbidden

- Abbreviations like `str`, `num`, `arr`, `err` — use `stringValue`, `numericValue`, `parsedArray`, `caughtError`
- Magic strings/numbers without named constants
- Dead code
- Comments that explain bad code instead of fixing it
- Generic names like `data`, `info`, `item`, `handler` without context

### Architecture Rules

- `form` and `localization` are **zero-dependency domain packages** — they must not import React, Vue, or any UI framework
- `react` may depend on `form` and `localization` only — no external form libraries
- `vue` may depend on `form` only — no external form libraries
- `core` is the **umbrella facade** — it re-exports from `form`, `localization`, `react`, and `vue`. It must not contain any domain logic of its own; it is a re-export layer only.
- `localization` must not depend on React or any UI framework (browser runtime is framework-agnostic)
- `examples/react-example` may depend on all packages
- `examples/vue-example` may depend on all packages
- Public API must be declared in `public-api.ts` and re-exported from `index.ts` (except `core`, which has no `public-api.ts` because it is itself a re-export layer)
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
