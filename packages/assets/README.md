# @valfuse-node/assets

Generate a typed TypeScript registry for static assets. Directory names and
file names become nested keys, and each leaf contains the asset's public URL.

```bash
npm install --save-dev @valfuse-node/assets
```

Requires **Node.js 22 or newer** to run the generator. The generated module is
plain TypeScript and has no runtime dependency on this package.

The package declares `engines.node >=22`. Install it as a development
dependency when you generate the registry during development or CI.

## Contents

- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Generated names and paths](#generated-names-and-paths)
- [Programmatic API](#programmatic-api)
- [Troubleshooting](#troubleshooting)
- [Scope](#scope)
- [Release history](#release-history)
- [Support](#support)
- [License](#license)

## Quick start

Place files under `public/assets`:

```text
public/assets/
├── images/
│   ├── company-logo.svg
│   └── profile/avatar.png
└── icons/search.svg
```

Create `valfuse-assets.yaml` in the project root:

```yaml
input_dir: public/assets
output_file: src/assets/assets.ts
base_path: /assets
```

Run `npx valfuse-assets`. It generates `src/assets/assets.ts`:

```ts
import { assets } from "./assets/assets";

assets.images.companyLogo; // "/assets/images/company-logo.svg"
assets.images.profile.avatar; // "/assets/images/profile/avatar.png"
assets.icons.search; // "/assets/icons/search.svg"
```

The generator also exports `AssetPath`, a union of all generated URL strings:

```ts
import { assets, type AssetPath } from "./assets/assets";

const logo: AssetPath = assets.images.companyLogo;
```

The path values work with React, Vue, HTML, and other browser code that accepts
URLs. Put assets in the framework's public/static directory so the framework
copies them to the matching URL at build time.

For example, in a React component:

```tsx
import { assets } from "./assets/assets";

export function CompanyLogo() {
  return <img src={assets.images.companyLogo} alt="Company" />;
}
```

The generated registry contains URL strings only. Keep the source files in the
public directory and make sure the configured `base_path` matches the URL path
your server or CDN uses to serve that directory.

## Configuration

The CLI reads `valfuse-assets.yaml` from the current working directory, matching
the config-file convention used by the localization CLI:

```yaml
input_dir: public/media
output_file: src/assets/assets.ts
base_path: /media
```

Relative file paths in this config are resolved from the current working
directory; absolute file paths are also accepted. The `base_path` is the URL
prefix that serves the contents of `input_dir`; it can be a root-relative path
such as `/media` or an absolute HTTP(S) URL for a CDN.
Each discovered file's path beneath `input_dir` is appended to this prefix.
Input and output paths are resolved from the current working directory. The
CLI accepts only these snake_case YAML keys; unknown keys, empty values, an
invalid URL prefix, or an output filename without a `.ts` extension are errors.

The default values are:

| Option        | Default                | Purpose                                    |
| ------------- | ---------------------- | ------------------------------------------ |
| `input_dir`   | `public/assets`        | Directory tree to scan                     |
| `output_file` | `src/assets/assets.ts` | Generated TypeScript module                |
| `base_path`   | `/assets`              | Public URL prefix for files in `input_dir` |

Pass another config file with `--config`:

```bash
npx valfuse-assets --config config/valfuse-assets.yaml
```

Use `--check` in CI to fail when the generated module is missing or stale. It
does not write files:

```bash
npx valfuse-assets --check
npx valfuse-assets --help
```

| Option            | Behavior                                      |
| ----------------- | --------------------------------------------- |
| `--config <file>` | Read another YAML config file                 |
| `--check`         | Fail if the generated module is missing/stale |
| `--help`, `-h`    | Print CLI usage and defaults                  |

For repeatable project commands, add scripts to your `package.json`:

```json
{
  "scripts": {
    "assets:generate": "valfuse-assets",
    "assets:check": "valfuse-assets --check"
  }
}
```

Run `npm run assets:generate` after changing files under the input directory.
Run `npm run assets:check` in CI to ensure the committed generated registry is
current. The command does not copy, transform, or fingerprint source files.

## Generated names and paths

- Nested folders remain nested object keys.
- File extensions are removed from keys: `company-logo.svg` becomes
  `companyLogo`.
- Folder and file names are converted to lower camel case, including names that
  already use camel case. A leading number is prefixed with `_`.
- URL segments are percent-encoded while the generated keys use readable names.
- Output is sorted deterministically, and unchanged output files are not
  rewritten.
- Name collisions after normalization produce an error instead of silently
  replacing an asset.
- Symlinks, special filesystem entries, `.DS_Store`, `Thumbs.db`, and
  `desktop.ini` are skipped.

## Programmatic API

The Node.js API is also available from the explicit
**@valfuse-node/core/assets** subpath. It is not loaded from the core root
import; use the standalone **@valfuse-node/assets** package when you only need
the CLI.

The generator can also be called from a Node.js build script:

```ts
import { generateAssets } from "@valfuse-node/assets";

await generateAssets({
  config: {
    inputDir: "public/assets",
    outputFile: "src/assets/assets.ts",
    basePath: "/assets",
  },
});
```

`GenerateAssetsOptions` accepts an optional `cwd`, partial camelCase `config`,
and `check` flag. The equivalent of the default config is:

```ts
{
  inputDir: "public/assets",
  outputFile: "src/assets/assets.ts",
  basePath: "/assets",
}
```

The package entry exports `generateAssets` and
`DEFAULT_ASSET_GENERATOR_CONFIG`. Its public types are
`AssetGeneratorConfig`, `AssetGeneratorConfigInput`, `GenerateAssetsOptions`,
and `GenerateAssetsResult`.

Pass `check: true` to check generated output without writing it. On success,
`generateAssets` returns `GenerateAssetsResult`:

```ts
{
  assetCount: number;
  outputFile: string; // absolute path
  changed: boolean;
}
```

The function rejects missing or invalid input directories, invalid config, and
asset-name collisions with an `Error`. In check mode, it also throws when the
generated file is missing or stale.

## Troubleshooting

- **Input directory not found:** run the CLI from the project root or set
  `cwd` in the API call; configured paths are relative to that directory.
- **Two files map to the same TypeScript key:** rename one path segment. For
  example, names that normalize to the same lower-camel-case key cannot share
  the registry.
- **A generated URL returns 404:** compare `base_path` with the actual public
  URL for the configured input directory. The generator does not move files.
- **CI reports stale output:** run `npm run assets:generate` and commit the
  updated generated module.

## Scope

This package generates a typed registry of static public URLs. It does not
import files into Vite/Webpack bundles, transform image files, or generate
image, SVG, font, or color helper APIs. For bundled assets, use your bundler's
asset import or `new URL(..., import.meta.url)` behavior instead.

## Release history

See the [monorepo changelog](https://github.com/alpinnz/valfuse-node/blob/master/CHANGELOG.md).

## Support

For usage questions, bug reports, and feature requests, see the
[project support guide](https://github.com/alpinnz/valfuse-node/blob/master/SUPPORT.md).
For security reports, follow the
[security policy](https://github.com/alpinnz/valfuse-node/blob/master/SECURITY.md).
Do not use public issues for security reports.

## License

[MIT](LICENSE)
