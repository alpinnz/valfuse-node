# Project documentation

This folder documents the architecture and engineering practices of the
`valfuse-node` library monorepo. Package-specific APIs and runnable examples
remain in each workspace's README.

## Guides

| Guide                                                               | What it covers                                                          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [Architecture](./architecture.md)                                   | Workspace roles, dependency direction, and public package boundaries    |
| [Code conventions](./code-conventions.md)                           | TypeScript, public exports, imports, and naming conventions             |
| [Environment and configuration](./environment-and-configuration.md) | Node.js, npm, workspace commands, and localization configuration        |
| [Forms and localization](./forms-and-localization.md)               | Framework-neutral form behavior and the localization compiler/runtime   |
| [Framework adapters and state](./framework-adapters-and-state.md)   | React and Vue adapter responsibilities and form state ownership         |
| [Security and data handling](./security-and-data-handling.md)       | Validation boundaries and handling of values, errors, and locale data   |
| [Testing](./testing.md)                                             | Vitest setup, package test commands, and CI quality gates               |
| [Release and publishing](./release-and-publishing.md)               | CI workflows, npm release tags, package publishing, and troubleshooting |
| [Decisions](./decisions/README.md)                                  | Accepted and superseded architecture decisions                          |

## Other maintained documentation

- [Repository overview and quick start](../README.md)
- [Contribution workflow](../CONTRIBUTING.md)
- [Code of Conduct](../CODE_OF_CONDUCT.md)
- [Support resources](../SUPPORT.md)
- [Security reporting policy](../SECURITY.md)
- [Changelog](../CHANGELOG.md)
- [Repository instructions](../AGENTS.md) and the `.codex/` workflows, which
  configure contributor and agent behavior rather than product architecture
- Package API references: [`core`](../packages/core/README.md),
  [`form`](../packages/form/README.md),
  [`localization`](../packages/localization/README.md),
  [`react`](../packages/react/README.md), and
  [`vue`](../packages/vue/README.md)

The repository provides libraries and example apps; it does not provide an
HTTP client/server, router, database layer, or shared UI styling system. Those
topics are intentionally not represented as standalone guides. Locale
preference storage is covered in [Framework adapters and state](./framework-adapters-and-state.md).
