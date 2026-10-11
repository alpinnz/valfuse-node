# Architecture

`valfuse-node` is a TypeScript monorepo for reusable form validation,
localization, Express middleware, static asset tooling, and TypeScript barrel
generation. It is built with npm workspaces and Turborepo. Private reference
applications under `examples/` exercise the public APIs: React and Vue use
Vite, while Express runs as a Node.js server.

## Package responsibilities

| Workspace                    | Responsibility                                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@valfuse-node/assets`       | Node.js CLI and API that generate typed TypeScript registries for static asset URLs                  |
| `@valfuse-node/barrel`       | Node.js CLI and API that generate selected TypeScript barrel files                                   |
| `@valfuse-node/core`         | Umbrella root exports with explicit Node.js subpaths for generators and Express middleware           |
| `@valfuse-node/express`      | Express middleware for validated requests and request-scoped localization                            |
| `@valfuse-node/form`         | Framework-agnostic schemas, rules, validation, value transformation, errors, and state types         |
| `@valfuse-node/localization` | Node.js configuration, locale compiler and CLI, validators, generated artifacts, and browser runtime |
| `@valfuse-node/react`        | React form hook and controller, plus React localization provider, hooks, and storage strategies      |
| `@valfuse-node/vue`          | Vue form composable, localization provider/hooks, and Vue-specific types                             |
| `examples/express-example`   | Private Express server and integration reference                                                     |
| `examples/react-example`     | Private React playground and integration reference                                                   |
| `examples/vue-example`       | Private Vue playground and integration reference                                                     |

## Dependency direction

```mermaid
flowchart TD
  form[form domain]
  assets[static asset generator]
  barrel[barrel generator]
  localization[localization compiler and runtime]
  express[Express adapter]
  react[React adapter]
  vue[Vue adapter]
  core[core umbrella]
  expressExample[Express example]
  reactExample[React example]
  vueExample[Vue example]

  express --> form
  express --> localization
  react --> form
  react --> localization
  vue --> form
  vue --> localization
  core --> form
  core --> localization
  core --> assets
  core --> barrel
  core --> express
  core --> react
  core --> vue
  expressExample --> core
  reactExample --> core
  vueExample --> core
```

`form` owns form-domain rules and behavior. Framework adapters depend on that
domain package rather than the other way around. `core` is a facade only: it
contains no form or localization domain logic. The examples consume the
published-style umbrella entry point so they exercise the same API consumers
install.

`assets` and `barrel` are independent Node.js development tools. They have no
dependency on the form libraries. The core package exposes them only through
the explicit `@valfuse-node/core/assets` and
`@valfuse-node/core/barrel` API subpaths. The default core root entry does not
re-export or load either generator, keeping filesystem APIs out of the root
module graph. Their CLIs can also be installed and invoked directly.

The Express adapter depends on `form` and `localization`. The core package
exposes its middleware through `@valfuse-node/core/express`; the optional
Express peer is not loaded by the core root entry. The three examples call the
shared `@valfuse-node/barrel` CLI from their workspace scripts to generate
feature or route exports.

## Public API boundaries

The `assets`, `barrel`, `express`, `form`, `localization`, `react`, and `vue`
packages expose APIs from their package entry points. Cross-package consumers
should import from package exports, never from another package's `src/` files.
`core` re-exports the framework-neutral APIs at the top level and renames the two form hooks to
`useReactValfuseForm` and `useVueValfuseForm` to avoid a name collision. The
adapter packages themselves continue to export `useValfuseForm`.

Localization has separate Node.js and browser entry points. The compiler and
CLI belong to the Node.js surface; interpolation and message lookup belong to
the browser runtime. The React and Vue packages add framework-specific
localization integration. The Express package provides request validation and
request-scoped localization middleware for server applications.

For detailed public APIs, see the [package READMEs](./README.md#other-maintained-documentation).
