# Code conventions

These conventions describe the current package structure and repository
configuration. Follow existing package patterns before introducing a new
abstraction.

## TypeScript

- Shared compiler options live in `tsconfig.base.json` and enable `strict`,
  `noUnusedLocals`, and `noUnusedParameters`.
- Use domain-specific names and explicit types at package boundaries.
- Keep framework-specific code in the corresponding adapter package. The
  `form` package stays framework-agnostic.

## Public exports and imports

- Declare package APIs through the package's public entry point. The `form`,
  `localization`, `react`, and `vue` packages use `public-api.ts` files where
  applicable; `core` is a direct umbrella re-export.
- Import another workspace through its package name and exported entry point.
  Do not reach into another package's internal `src/` paths.
- Keep package dependencies pointed toward the owning domain. Do not move code
  into `core` just because two modules look similar; `core` is not a shared
  utility package.

## Naming and file placement

- Use `camelCase` for functions and variables, `PascalCase` for types and
  React components, and descriptive `UPPER_SNAKE_CASE` names for constants
  where that convention is already used.
- Keep implementation and its tests within the owning workspace. Package
  tests live under `src/__tests__/`.
- Add user-facing API examples to the relevant package README and record
  intentional public or architectural changes in the changelog or a decision
  record.

## Formatting and linting

Prettier is configured at the repository root and ESLint uses the flat config
in `eslint.config.mjs`. Run the package scripts instead of adding local
formatting or lint configuration without a need.

See [Contributing](../CONTRIBUTING.md) for the development workflow and
[Testing](./testing.md) for validation commands.
