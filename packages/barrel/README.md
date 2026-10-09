# @valfuse-node/barrel

Generate a deterministic TypeScript barrel (an index file) for one source directory. The CLI scans only direct child TypeScript modules, so each run has a narrow, reviewable scope.

## Install

```
npm install --save-dev @valfuse-node/barrel
```

## Configure

Create **valfuse-barrel.yaml**:

```yaml
input_dir: src/rules
output_file: src/rules/index.ts

# Optional allowlist. Omit it or use [] to include all eligible direct children.
include:
  - email.ts
  - required.ts

# Optional exact file names to omit from an automatic scan.
exclude: []
```

The default paths are **src** and **src/index.ts**. Use **include** when a directory contains internal modules that should not be public. **exclude** takes exact TypeScript file names and applies when **include** is empty.

## Generate and check

```
npx valfuse-barrel
npx valfuse-barrel --check
```

Add the commands to your package scripts if needed:

```json
{
  "scripts": {
    "barrel:generate": "valfuse-barrel",
    "barrel:check": "valfuse-barrel --check"
  }
}
```

Generated files contain sorted export-star statements. Default exports are not re-exported. Existing output files are replaced only when generated content changes. **--check** exits with an error if output is missing or stale.

## Public API and dependency guidance

Use one config per directory when a package needs multiple feature barrels, and run the CLI with **--config** for each config file. Generation is non-recursive by design: create feature-level barrels explicitly, then decide which of those belong in the package root **src/index.ts**.

Export-star statements can introduce duplicate public names. Use **include** to define the public surface, or write explicit named exports by hand when symbols conflict or need aliases. Internal modules in the folder should import one another directly instead of importing from the barrel they will be re-exported through; that avoids circular module edges.

This package is a Node.js development tool. Its API is available from the
explicit **@valfuse-node/core/barrel** subpath; it is not loaded from the core
root import. The command-line tool can also be installed and invoked directly.

## Node.js API

```ts
import { generateBarrel } from "@valfuse-node/barrel";

await generateBarrel({
  cwd: process.cwd(),
  config: {
    inputDir: "src/rules",
    outputFile: "src/rules/index.ts",
    include: ["email.ts", "required.ts"],
  },
});
```

See the [repository README](../../README.md) for package selection and the [architecture guide](../../docs/architecture.md) for dependency boundaries.

## License

MIT
