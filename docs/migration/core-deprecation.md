## 1. Informasi Umum

| Field             | Value                                           |
| ----------------- | ----------------------------------------------- |
| **Nama Dokumen**  | Migration Guide: @valfuse-node/core Deprecation |
| **Nama Project**  | valfuse-node                                    |
| **Modul / Fitur** | packages/core deprecation                       |
| **Dibuat oleh**   | Alfin Noviaji                                   |
| **Dibuat pada**   | 2026-06-01                                      |
| **Diubah oleh**   | -                                               |
| **Diubah pada**   | -                                               |
| **Direview oleh** | -                                               |
| **Direview pada** | -                                               |
| **Versi**         | v1                                              |
| **Status**        | draft                                           |

---

## 2. Overview

`@valfuse-node/core` has been **deprecated** as of v0.1.0.

The package previously re-exported form domain logic from `@valfuse-node/form`. This created an architecturally incorrect dependency and has been corrected.

---

## 3. What Changed

### Before

```typescript
// Using @valfuse-node/core (now deprecated)
import { createSchema, validateSchema, transformValues } from "@valfuse-node/core";
```

### After

```typescript
// Using @valfuse-node/form (correct)
import { createSchema, validateSchema, transformValues } from "@valfuse-node/form";
```

---

## 4. Migration Steps

### Step 1: Update package.json

**Before:**

```json
{
  "dependencies": {
    "@valfuse-node/core": "*"
  }
}
```

**After:**

```json
{
  "dependencies": {
    "@valfuse-node/form": "*"
  }
}
```

### Step 2: Update Imports

Replace all occurrences:

```typescript
// Change from:
import { ... } from "@valfuse-node/core";

// To:
import { ... } from "@valfuse-node/form";
```

### Step 3: Run Typecheck and Tests

```bash
yarn typecheck
yarn test
```

---

## 5. Common Imports Mapping

| Old Import (`@valfuse-node/core`) | New Import (`@valfuse-node/form`) |
| --------------------------------- | --------------------------------- |
| `createSchema`                    | `createSchema`                    |
| `validateSchema`                  | `validateSchema`                  |
| `transformValues`                 | `transformValues`                 |
| `normalizeError`                  | `normalizeError`                  |
| `t` (transformer)                 | `t` (transformer)                 |
| All types                         | All types                         |

---

## 6. Why This Change

The previous architecture had `@valfuse-node/core` re-exporting form domain logic:

```
react ──→ core ──→ form  (WRONG)
```

This violated Clean Architecture — the orchestration layer should not depend on domain logic.

The corrected architecture:

```
react ──→ form ──→ [schema, rules, validation]
vue   ──→ form
```

---

## 7. Timeline

- **v0.1.0**: `@valfuse-node/core` deprecated, no longer re-exports form
- **Future**: Core will become true orchestration layer with shared utilities (see ADR-002)
- **Future**: Core may be removed entirely if no orchestration role is needed

---

## 8. Help

If you encounter issues during migration:

1. Verify your imports are from `@valfuse-node/form`
2. Check that `@valfuse-node/core` is removed from dependencies
3. Run `yarn install` to update lockfile
4. Run `yarn typecheck` to verify types

For questions, open an issue on the repository.
