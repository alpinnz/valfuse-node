# Contributing

Thank you for your interest in contributing to `valfuse-node`.

---

## Prerequisites

- Node.js `>=18`
- npm `>=9`

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
│   ├── core/                    # @valfuse-node/core
│   ├── adapter-react/           # @valfuse-node/adapter-react
│   └── adapter-react-example/   # private playground
├── turbo.json
├── tsconfig.base.json
└── eslint.config.mjs
```

---

## Development Workflow

```bash
# Run the example playground
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# TypeScript check
npm run typecheck

# Lint
npm run lint
```

---

## Definition of Done

A task is considered done when:

- [ ] Implementation matches the requirement
- [ ] TypeScript compiles without errors
- [ ] Lint passes without errors
- [ ] Tests related to the change pass
- [ ] The example app still runs
- [ ] Documentation is updated
- [ ] Public APIs are exported from `index.ts`
- [ ] No unnecessary dependencies added
- [ ] No direct imports into internal module files of other packages

---

## Coding Standards

### Naming

| Unit | Convention | Example |
|---|---|---|
| Render component | Descriptive noun | `UserProfileCard` |
| Logic function | Action/domain verb | `validateStringRule` |
| Helper/utility | Transformation name | `normalizeError` |
| Constant | `UPPER_SNAKE_CASE` | `EMAIL_REGEX` |
| File | `kebab-case` | `validate-schema.ts` |

### Forbidden

- Abbreviations like `str`, `num`, `arr`, `err` — use `stringValue`, `numericValue`, `parsedArray`, `caughtError`
- Magic strings/numbers without named constants
- Dead code
- Comments that explain bad code instead of fixing it
- Generic names like `data`, `info`, `item`, `handler` without context

### Architecture Rules

- `core` must not depend on React or any UI framework
- `adapter-react` may depend on `core` and React only — no external form libraries
- `adapter-react-example` may depend on all packages
- Public API must be exported exclusively from `index.ts`
- No cross-package internal imports (e.g. `@valfuse-node/core/src/rules/string.rules`)

---

## Testing

```bash
npm run test                             # all packages
npm run test --workspace=packages/core   # specific package
```

Test naming format:

```
describe("validateSchema")
it("should return required error when string value is empty")
```

---

## Commit Convention

Use clear, imperative commit messages:

```
feat(core): add matchField rule
fix(adapter-react): resolve setErrors type inference for object errors
docs(core): document regex rule pattern config format
test(core): add unit tests for number rules
```

---

## Package Manager

This project uses **npm** exclusively. Do not use `pnpm`, `yarn`, or `bun`.

