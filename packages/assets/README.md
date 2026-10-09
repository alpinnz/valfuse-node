# @valfuse-node/assets

Generate a typed TypeScript registry for static assets. Directory names and
file names become nested keys, and each leaf contains the asset's public URL.

```bash
npm install --save-dev @valfuse-node/assets
```

Requires **Node.js 22 or newer** to run the generator. The generated module is
plain TypeScript and has no runtime dependency on this package.

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

## Configuration

The CLI reads `valfuse-assets.yaml` from the current working directory, matching
the config-file convention used by the localization CLI:

```yaml
input_dir: public/media
output_file: src/assets/assets.ts
base_path: /media
```

All paths in this file are relative to the current working directory. The
`base_path` is the URL prefix that serves the contents of `input_dir`; it can
be a root-relative path such as `/media` or an absolute HTTP(S) URL for a CDN.
Each discovered file's path beneath `input_dir` is appended to this prefix.

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
```

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

Pass `check: true` to check generated output without writing it. The function
returns the number of assets, the absolute output path, and whether it changed
the output file.

## Scope

This package generates a typed registry of static public URLs. It does not
import files into Vite/Webpack bundles, transform image files, or generate
image, SVG, font, or color helper APIs. For bundled assets, use your bundler's
asset import or `new URL(..., import.meta.url)` behavior instead.

## Release history

See the [monorepo changelog](https://github.com/alpinnz/valfuse-node/blob/master/CHANGELOG.md).

## License

MIT
