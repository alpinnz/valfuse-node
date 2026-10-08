# Testing

The packages use Vitest. Tests are kept with their owning package under
`src/__tests__/`; React tests use a DOM environment, while domain and compiler
tests run in Node. Vue tests use the Vue testing utilities configured by that
workspace.

## Run checks

From the repository root:

```bash
npm ci
npm run format:check
npm run lint
npm run typecheck
npm run build
npm run test:coverage
```

`npm run validate` is a shorter local gate that runs formatting, lint,
typechecking, and tests. It does not invoke the root build task or request a
coverage report, although Turborepo can build upstream packages required by
those tasks.

Turborepo config makes tests, lint, and typecheck depend on upstream package
builds. This matters for a fresh checkout because workspace packages import
each other through their package entry points. The GitHub Actions workflow
explicitly builds before running coverage-enabled tests and also runs
`npm audit --audit-level=high` on Ubuntu and Windows.

When adding tests, assert public behavior at the package boundary. Keep
framework-specific interaction tests in the relevant adapter workspace and
test compiler or validation logic without a UI runtime where possible.
