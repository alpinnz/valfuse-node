# ADR-0003: Separate the validation engine from form state

- Status: Accepted
- Date: 2026-10-17
- Supersedes: The package responsibility split in part of ADR-0001
- Superseded by: None

## Context

The `@valfuse-node/form` package combined schema definitions, rules,
transformations, validation, and form-state primitives. React, Vue, and Express
all depended on that package even though Express only needs request validation
and browser adapters need both validation and form state.

Form input and API request contracts can also differ. Forcing one schema to
serve both can couple UI-specific fields and rules to the backend payload.

## Decision

- Move schema types, rules, transformations, and validation into the
  framework-neutral `@valfuse-node/validation` package.
- Keep `@valfuse-node/form` focused on form-state primitives and adapter
  contracts. It depends on `validation` and re-exports its public API for
  compatibility; new code should import validation APIs from the dedicated
  package.
- React and Vue adapters use both packages. Express uses `validation` directly
  and does not depend on form state.
- Applications may define separate form and API schemas when their shapes or
  validation requirements differ. Both use the same validation engine.
- Expose the validation API through the `@valfuse-node/core/validation`
  subpath while retaining existing root exports.

## Consequences

Backend projects can use validation without installing form-state behavior.
React and Vue retain the existing form experience. Existing imports from
`@valfuse-node/form` continue to work through compatibility re-exports, while
new imports make the package responsibility clear.

The new package must be published before packages that depend on it. Existing
packages must receive new releases before consumers can use this split from
npm. Database-backed rules remain in application services or domain logic;
the shared validation engine is synchronous and framework-neutral.

## Alternatives considered

- Keep validation inside `form` and make backend APIs install the whole form
  package: rejected because it preserves the current coupling.
- Duplicate the validation engine for client forms and backend APIs: rejected
  because rule behavior would drift and require parallel maintenance.
- Force one schema object to describe both UI and API payloads: rejected
  because those contracts can differ.
