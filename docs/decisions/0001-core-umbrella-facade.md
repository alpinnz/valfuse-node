# ADR-0001: Use `core` as the umbrella facade

- Status: Accepted
- Date: 2026-06-04
- Supersedes: The earlier orchestration-placeholder proposal for `core`
- Superseded by: None

## Context

Consumers need one package entry point for the Valfuse form, localization,
React, and Vue APIs. The earlier `core` orchestration proposal left the package
without orchestration behavior and did not provide that installation path.
Form-domain behavior still belongs in `@valfuse-node/form`.

## Decision

- `@valfuse-node/core` depends on and re-exports the public APIs of `form`,
  `localization`, `react`, and `vue`.
- `core` contains no form or localization domain implementation.
- Framework-neutral exports are available at the top level. The umbrella
  renames colliding form hooks to `useReactValfuseForm` and
  `useVueValfuseForm`; the adapter packages keep their own
  `useValfuseForm` exports.
- React and Vue are optional peer dependencies in package metadata, but the
  core root facade statically re-exports both adapters. Consumers loading that
  root entry must make both framework peers resolvable. Framework-neutral and
  single-framework consumers should use the standalone packages to avoid the
  unused adapter peer.

## Consequences

Consumers can install the umbrella package for a single import surface. Its
root entry statically re-exports both adapters, so direct Node.js imports
require both framework peer modules to resolve even though they are optional in
package metadata. Consumers who do not use both frameworks should import the
standalone packages. The core dependency graph points outward to the packages
it re-exports, so it must remain a facade and must not become a dependency of
those packages.

The earlier shared-utilities proposal is recorded as superseded in
[ADR-0002](./0002-shared-utilities-extraction.md).

## Alternatives considered

- Keep `core` as an orchestration placeholder: rejected because it has no
  current orchestration behavior and does not meet the single-entry-point
  requirement.
- Remove `core`: rejected because the umbrella package provides a useful
  supported installation path.
