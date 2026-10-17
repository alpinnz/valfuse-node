# Environment and configuration

## Development environment

- Use Node.js 22 or newer. `.nvmrc` selects Node.js `22`, and every published
  package declares `engines.node` as `>=22.0.0`.
- Use npm. The repository pins `npm@11.6.2` through the root
  `packageManager` field and uses `package-lock.json` for dependency
  resolution.
- Install from the repository root with `npm ci` when reproducing a clean
  checkout.

## Workspace commands

Root scripts use Turborepo to run package tasks across `packages/*` and
`examples/*`:

| Command                                                         | Purpose                                      |
| --------------------------------------------------------------- | -------------------------------------------- |
| `npm run build`                                                 | Build workspace packages in dependency order |
| `npm run lint`                                                  | Run ESLint in each workspace                 |
| `npm run typecheck`                                             | Run TypeScript checks in each workspace      |
| `npm run test`                                                  | Run Vitest in packages with tests            |
| `npm run test:coverage`                                         | Run Vitest with coverage enabled             |
| `npm run format:check`                                          | Check formatting with Prettier               |
| `npm run validate`                                              | Run format check, lint, typecheck, and tests |
| `npm run dev:react` / `npm run dev:vue` / `npm run dev:express` | Start one example application                |

The CI workflow also runs a build, coverage-enabled tests, and `npm audit`.
`npm run validate` does not invoke the root build task as a separate step.
Turborepo can still build upstream packages required by its lint, typecheck,
and test tasks. Use `npm run build` to run the build task across all
workspaces explicitly.

Build workspace packages before starting an example from a clean checkout.
Example scripts invoke the `valfuse-assets` and `valfuse-localization` binaries
declared by their workspace package dependencies. For barrel generation, they
call the built workspace CLI at `packages/barrel/dist/cli/index.js`, following
the monorepo guidance in the
[`@valfuse-node/barrel` README](../packages/barrel/README.md).

## Valfuse generator configuration

All Valfuse generators read package-specific sections from the consumer
project's `valfuse.yaml`. The `localization` section defines locale
sources and generated output; see the
[localization package README](../packages/localization/README.md) for its schema
and command options.

The `assets` section's `input_dir`, `output_file`, and `base_path` options define
the static asset directory, generated TypeScript module, and public URL prefix.
See the [assets package README](../packages/assets/README.md) for defaults and
usage.

The `barrel` section scans direct children of one configured directory by
default. Set `recursive: true` to generate an `index.ts` in each nested
directory that contains eligible `.ts` or `.tsx` modules. See the
[barrel package README](../packages/barrel/README.md) for its options.

The library and examples do not require a repository-level `.env` file.
