# @valfuse-node/localization

> Localization generation engine — compiler, CLI, validator, and browser-safe runtime for `@valfuse-node`.

## Installation

```bash
npm install @valfuse-node/localization
```

Requires **Node.js ≥ 20**.

## Features

- 📝 **YAML-based** — define translations in clean YAML with nested namespaces
- 🔨 **Code generation** — generates fully typed TypeScript locale files
- 🌐 **Browser-safe runtime** — interpolation engine ships separately via `@valfuse-node/localization/browser`
- 🔍 **Coverage reports** — HTML and JSON translation coverage analysis
- 👀 **Watch mode** — re-compiles on YAML change during development
- ✅ **Validation** — detect missing keys, invalid syntax, and coverage gaps before shipping

## CLI

```bash
# Initialize config
npx valfuse-localization init

# Generate typed locale files
npx valfuse-localization generate

# Validate translations
npx valfuse-localization validate

# Generate coverage report
npx valfuse-localization coverage

# Remove generated files
npx valfuse-localization clean
```

## Configuration

Create a `valfuse-localization.yaml` (or `.json`) at your project root:

```yaml
defaultLocale: en
locales: [en, id]
inputDir: src/assets/localizations
outputDir: src/assets/localizations
```

## Runtime Entry Points

| Import path | Use case |
|---|---|
| `@valfuse-node/localization` | CLI + compiler (Node.js only) |
| `@valfuse-node/localization/browser` | Browser-safe runtime interpolation only |
| `@valfuse-node/localization/runtime` | Alias for `/browser` |

### Browser Runtime Usage

```typescript
import { interpolate, lookupMessage } from "@valfuse-node/localization/browser";
```

## License

[MIT](./LICENSE)

