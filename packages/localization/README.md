# @valfuse-node/localization

> Localization generation engine — YAML/JSON source files → type-safe TypeScript manifest → browser-safe interpolation runtime. CLI compiler + validator + coverage reporter + watch mode. Zero runtime dependencies in the browser.

```bash
npm install @valfuse-node/localization
```

Requires **Node.js ≥ 20** for the CLI / compiler. The runtime is browser-safe and tree-shakable.

---

## Table of Contents

- [Three-Layer Architecture](#three-layer-architecture)
- [Quick Start](#quick-start)
- [Source File Format (YAML / JSON)](#source-file-format-yaml--json)
- [Structured Variants (Plural / Gender / Context)](#structured-variants-plural--gender--context)
- [Inline Metadata](#inline-metadata)
- [The `valfuse-localization.yaml` Config File](#the-valfuse-localizationyaml-config-file)
- [CLI Commands](#cli-commands)
- [Generated Outputs](#generated-outputs)
- [Browser Runtime API](#browser-runtime-api)
- [Validators](#validators)
- [Compiler Pipeline (Programmatic)](#compiler-pipeline-programmatic)
- [Watch Mode](#watch-mode)
- [Type Reference](#type-reference)
- [Development Usage](#development-usage)
- [License](#license)

---

## Three-Layer Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│  Source files (YAML / JSON)   →   in: assets/localizations/       │
└────────────────────────────────────────────────────────────────────┘
                                ↓ valfuse-localization generate
┌────────────────────────────────────────────────────────────────────┐
│  Generated artifacts          →   out: src/assets/localizations/  │
│    • localization.ts          (framework-specific entry point)    │
│    • localization.types.ts    (TypeScript types for all keys)     │
│    • localization.manifest.json (browser-loadable runtime data)   │
└────────────────────────────────────────────────────────────────────┘
                                ↓
┌────────────────────────────────────────────────────────────────────┐
│  Runtime (browser)            →   interpolate, lookupMessage, …   │
└────────────────────────────────────────────────────────────────────┘
```

The compiler runs at build time; the runtime is shipped to the browser. There is no overlap — the runtime never imports Node-only APIs.

---

## Quick Start

```bash
# 1. Scaffold a sample module
npx valfuse-localization init

# 2. Compile to TypeScript + JSON manifest
npx valfuse-localization generate

# 3. (optional) Watch mode for development
npx valfuse-localization generate --watch
```

The default scaffold creates `assets/localizations/common/en.json` and `assets/localizations/common/id.json`.

---

## Source File Format (YAML / JSON)

Each **module** is a folder under `input_dir`. Each **locale** is a file inside the module folder, named `<locale>.json` (or `.yaml`).

```
assets/localizations/
├── common/
│   ├── en.json
│   ├── id.json
│   └── ja.json
└── auth/
    ├── en.json
    └── id.json
```

### Leaf string (most common)

```json
{
  "@@module": "common",
  "@@locale": "en",
  "app": {
    "title": "My App",
    "tagline": "Form validation that doesn't get in your way"
  },
  "errors": {
    "required": "This field is required",
    "min_length": "Must be at least {min} characters"
  }
}
```

The two reserved keys at the root are:

| Key        | Purpose                                  |
| ---------- | ---------------------------------------- |
| `@@module` | Module name (must match the folder name) |
| `@@locale` | Locale code (`en`, `id`, `ja`, …)        |

### Flat vs. nested

Both produce the **same generated keys**. The compiler flattens nested objects using dot-paths.

```json
{ "auth": { "login": { "title": "Log in" } } }
```

Generates key: `common.auth.login.title` (with `namespace_prefix: module` — the default) or `auth.login.title` (with `namespace_prefix: none`).

### Placeholders

Use `{name}` syntax. Identifiers match `[a-zA-Z_][a-zA-Z0-9_]*`.

```json
{ "welcome": "Hello, {name}! You have {count} new messages." }
```

Interpolate at runtime with `interpolate("Hello, {name}!", { name: "Alfin" })` → `"Hello, Alfin!"`.

Missing placeholders keep their original `{token}` so missing values are visible during development.

---

## Structured Variants (Plural / Gender / Context)

Mark a leaf as **structured** with one of the three reserved keys: `@plural`, `@gender`, `@context`.

### `@plural` — pick a variant by quantity

```json
{
  "items": {
    "count": {
      "@plural": {
        "zero": "No items",
        "one": "1 item",
        "other": "{count} items"
      }
    }
  }
}
```

```ts
import { plural } from "@valfuse-node/localization/runtime";
plural("common.items.count", 0); // → "No items"
plural("common.items.count", 1); // → "1 item"
plural("common.items.count", 5); // → "5 items"
```

`{count}` is auto-injected as a placeholder for plural branches.

### `@gender` — pick a variant by gender

```json
{
  "profile": {
    "follower_count": {
      "@gender": {
        "male": "{count} male followers",
        "female": "{count} female followers",
        "other": "{count} followers"
      }
    }
  }
}
```

```ts
import { gender } from "@valfuse-node/localization/runtime";
gender("common.profile.follower_count", "male", { count: 3 }); // → "3 male followers"
gender("common.profile.follower_count", "female", { count: 3 }); // → "3 female followers"
```

### `@context` — pick a variant by free-form context

```json
{
  "word": {
    "open": {
      "@context": {
        "verb": "Open the file",
        "adjective": "The file is open"
      }
    }
  }
}
```

```ts
import { context } from "@valfuse-node/localization/runtime";
context("common.word.open", "verb"); // → "Open the file"
context("common.word.open", "adjective"); // → "The file is open"
```

### Resolution priority

When a leaf has both an `@plural` and metadata placeholders, the variant branches are selected first; placeholders interpolate into the chosen branch.

---

## Inline Metadata

Attach developer-only metadata to a leaf using sibling keys. Metadata is **never emitted to the runtime** — it lives only in the source for tooling.

```json
{
  "welcome": {
    "@description": "Greeting shown on the home page hero",
    "@example": "Hello, Alfin!",
    "@placeholders": {
      "name": "User's first name"
    },
    "value": "Hello, {name}!"
  }
}
```

| Key             | Type                      | Purpose                                                                              |
| --------------- | ------------------------- | ------------------------------------------------------------------------------------ |
| `@description`  | `string`                  | Human-readable description for translators / docs                                    |
| `@example`      | `string`                  | Example of a fully-interpolated message                                              |
| `@placeholders` | `Record<string, string>`  | Per-placeholder documentation                                                        |
| `@custom`       | `Record<string, unknown>` | Any custom tooling metadata (use only when `validation.allow_custom_metadata: true`) |

> **Reserved keys (cannot be used as message names):** `@@module`, `@@locale`, `@plural`, `@gender`, `@context`, `@description`, `@example`, `@placeholders`, `@custom`.

---

## The `valfuse-localization.yaml` Config File

```yaml
input_dir: assets/localizations # where the YAML/JSON source files live
output_dir: src/assets/localizations # where the generated TS/JSON go

framework: react # react | vue | nest
class_name: Localization # name of the generated class/namespace

base_locale: en # default locale at runtime
fallback_locale: en # fallback when a key is missing
strict: true # throw on errors (vs. just warn)

# Prepend the module folder name to every key:
#   "module" (default) → common.auth.login.title
#   "none"             → auth.login.title
namespace_prefix: module

generated:
  runtime_entry_file: localization.ts
  runtime_types_file: localization.types.ts
  runtime_manifest_file: localization.manifest.json

validation:
  max_depth: 10 # reject nested objects deeper than this
  require_key_parity: true # every key must exist in every locale
  require_placeholder_parity: true # placeholder set must match across locales
  require_structured_parity: true # @plural/@gender/@context variants must match
  allow_custom_metadata: true # allow @custom blocks
  validate_path_metadata_consistency: true # metadata must match across locales

reporting:
  output_dir: src/assets/localizations/reports
  coverage_format: json # json | html
```

---

## CLI Commands

All commands read `valfuse-localization.yaml` from the current working directory. Pass `{ cwd: "..." }` programmatically.

### `npx valfuse-localization init`

Scaffolds `assets/localizations/common/{en,id}.json` with sample content. Use it to bootstrap a new project.

```bash
npx valfuse-localization init
# → ✅ Initialized localization files in <cwd>/assets/localizations/common
```

### `npx valfuse-localization generate`

Compiles source files → `localization.ts`, `localization.types.ts`, `localization.manifest.json`, plus coverage report.

```bash
npx valfuse-localization generate
npx valfuse-localization generate --watch    # re-run on file changes
```

Errors are printed to stderr. With `strict: true`, the process exits non-zero on errors.

### `npx valfuse-localization validate`

Compiles + runs the validator pipeline + prints diagnostics. Does not write any output files.

```bash
npx valfuse-localization validate
```

### `npx valfuse-localization coverage [--format json|html] [--output <file>]`

Builds and writes a coverage report (per-locale fill rate, per-key fill matrix).

```bash
npx valfuse-localization coverage                       # → coverage.json
npx valfuse-localization coverage --format html         # → coverage.html
npx valfuse-localization coverage --output ./cov.json   # → ./cov.json
```

### `npx valfuse-localization clean`

Removes the generated output directory.

```bash
npx valfuse-localization clean
# → ✅ Localization output cleaned.
```

---

## Generated Outputs

### `localization.ts` — the framework-specific entry point

Exposes a singleton with the active locale, a `t()` lookup function, and the underlying manifest. The exact shape depends on `framework: react | vue | nest` in the config.

```ts
// For framework: react
import { Localization, localization } from "./assets/localizations/localization";
// `localization` is the runtime manifest + t() helper
// `Localization` is the class for the configured framework
```

### `localization.types.ts` — type-safe keys

Auto-generates a `TranslationKey` union from the compiled set of keys. Use it to type-safe your lookups.

```ts
import type { TranslationKey } from "./assets/localizations/localization.types";
const key: TranslationKey = "common.errors.required"; // ✓
const bad: TranslationKey = "common.erros.requird"; // ✗ type error
```

### `localization.manifest.json` — the browser-loadable payload

```json
{
  "base_locale": "en",
  "fallback_locale": "en",
  "locales": ["en", "id"],
  "entries": [
    { "key": "common.app.title", "placeholders": [] },
    { "key": "common.welcome", "placeholders": ["name"] }
  ],
  "messages": {
    "en": { "common.app.title": "My App", "common.welcome": "Hello, {name}!" },
    "id": { "common.app.title": "Aplikasi Saya", "common.welcome": "Halo, {name}!" }
  }
}
```

Structured variants are stored as JSON-encoded strings — use `parseStructuredVariants()` to decode them.

---

## Browser Runtime API

Import from `@valfuse-node/localization/runtime` (or `@valfuse-node/core`). The runtime is **zero-dependency, browser-safe, tree-shakable**.

```ts
import {
  interpolate,
  lookupMessage,
  pickContextVariant,
  pickGenderVariant,
  pickPluralVariant,
  pickStructuredContextVariant,
  pickStructuredGenderVariant,
  pickStructuredPluralVariant,
  parseStructuredVariants,
} from "@valfuse-node/localization/runtime";
```

### `interpolate(template, params)`

```ts
interpolate("Hello, {name}!", { name: "Alfin" });
// → "Hello, Alfin!"

interpolate("Hello, {name}!", {}); // missing → kept as-is → "Hello, {name}!"
interpolate("Total: {price}", { price: 0 }); // 0 is a real value → "Total: 0"
```

Placeholder identifiers match `[a-zA-Z_][a-zA-Z0-9_]*`.

### `lookupMessage(context, key)`

```ts
const ctx: RuntimeContext = {
  locale: "id",
  fallbackLocale: "en",
  messages: manifest.messages,
};

lookupMessage(ctx, "common.app.title");
// → "Aplikasi Saya" (if present)
// → "My App"        (falls back to fallbackLocale)
// → "common.app.title" (returns the key if both miss — useful for dev visibility)
```

### `pickPluralVariant(variants, count)` / `pickGenderVariant(variants, value)` / `pickContextVariant(variants, context)`

Low-level variant pickers for parsed variant maps:

```ts
pickPluralVariant({ one: "1 item", other: "{count} items" }, 5);
// → "{count} items"
```

### `parseStructuredVariants(raw)` + `pickStructured*`

For runtime structured entries (e.g. when reading from `manifest.messages` directly):

```ts
const raw = manifest.messages.en["common.items.count"]; // JSON-encoded string
const variants = parseStructuredVariants(raw);
// → { zero: "No items", one: "1 item", other: "{count} items" }

pickStructuredPluralVariant(raw, 5);
// → "5 items"  (auto-injects {count} for plural)
```

For `pickStructuredPluralVariant`, `count` is automatically injected into the interpolation params.

### `RuntimeContext`

```ts
interface RuntimeContext {
  locale: string;
  fallbackLocale: string;
  messages: Record<string, Record<string, string>>;
}
```

---

## Validators

The compiler runs seven independent validators. Each can be turned on/off in config (`validation.*`).

| Validator                   | What it checks                                                   | Toggle                               |
| --------------------------- | ---------------------------------------------------------------- | ------------------------------------ |
| `validateKeyParity`         | Every key exists in every locale                                 | `require_key_parity`                 |
| `validatePlaceholderParity` | Placeholder sets match across locales                            | `require_placeholder_parity`         |
| `validateStructuredParity`  | `@plural`/`@gender`/`@context` variant keys match across locales | `require_structured_parity`          |
| `validateMetadataUsage`     | Inline metadata is well-formed                                   | always on                            |
| `validatePathConsistency`   | Metadata is consistent across locales for the same path          | `validate_path_metadata_consistency` |
| `validateFlattenCollision`  | No two source paths flatten to the same key                      | always on                            |
| `validateMaxDepth`          | No nesting deeper than `max_depth`                               | `max_depth`                          |

---

## Compiler Pipeline (Programmatic)

```ts
import {
  loadConfig,
  compileProject,
  normalizeProject,
  validateProject,
} from "@valfuse-node/localization";

// 1. Load + validate config
const config = await loadConfig("./");

// 2. Compile source → NormalizedProject
const compiled = await compileProject("./", config);
// compiled.diagnostics   → Diagnostic[]
// compiled.manifest       → RuntimeManifest (the JSON-payload shape)

// 3. Lower-level access (if you need to inspect normalized data)
const normalized = normalizeProject(config);
validateProject(normalized);
```

`compileProject` is what `runGenerate` calls internally — it loads source, normalizes, validates, and produces a `RuntimeManifest` plus the diagnostic report.

---

## Watch Mode

`runGenerate({ watch: true })` re-runs the full pipeline whenever a source file changes.

```ts
import { runGenerate } from "@valfuse-node/localization";

await runGenerate({ watch: true });
// → keeps the process alive; Ctrl+C cleanly shuts down
```

Used internally by the CLI's `--watch` flag. Re-emits all generated files on every change — make sure to add them to your `.gitignore`.

---

## Type Reference

```ts
interface RuntimeManifest {
  base_locale: string;
  fallback_locale: string;
  locales: string[];
  entries: { key: string; placeholders: string[] }[];
  messages: Record<string, Record<string, string>>;
}

interface StructuredNode {
  type: "plural" | "gender" | "context";
  variants: Record<string, string>;
}

interface InlineMetadata {
  description?: string;
  example?: string;
  placeholders?: Record<string, string>;
  custom?: Record<string, unknown>;
}

type Framework = "react" | "vue" | "nest";
type NamespacePrefix = "module" | "none";
```

---

## Development Usage

### Add to your build pipeline

```json
// package.json
{
  "scripts": {
    "i18n:generate": "valfuse-localization generate",
    "i18n:watch": "valfuse-localization generate --watch",
    "i18n:check": "valfuse-localization validate",
    "i18n:coverage": "valfuse-localization coverage --format html"
  }
}
```

### Load the manifest in a browser app

```ts
// React adapter: <LocalizationProvider manifest={manifest} />
// (See @valfuse-node/react for full setup)
```

### Use the runtime directly (without the React provider)

```ts
import {
  interpolate,
  lookupMessage,
  type RuntimeContext,
  type RuntimeManifest,
} from "@valfuse-node/localization";

const manifest: RuntimeManifest = await fetch("/loc/manifest.json").then((r) => r.json());
const ctx: RuntimeContext = {
  locale: "id",
  fallbackLocale: manifest.base_locale,
  messages: manifest.messages,
};

const greeting = interpolate(lookupMessage(ctx, "common.welcome"), { name: "Alfin" });
// → "Halo, Alfin!"  (or "Hello, Alfin!" if the key is missing in `id`)
```

### Programmatic generation in a custom build

```ts
// scripts/build-i18n.ts
import { loadConfig, compileProject } from "@valfuse-node/localization";
import { writeFile } from "node:fs/promises";

const config = await loadConfig("./");
const compiled = await compileProject("./", config);

await writeFile("./public/manifest.json", JSON.stringify(compiled.manifest, null, 2));
```

---

## License

[MIT](../../LICENSE)
