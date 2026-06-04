## 1. Informasi Umum

| Field | Value |
|-------|-------|
| **Nama Dokumen** | ADR-001: Core as Orchestration Layer |
| **Nama Project** | valfuse-node |
| **Modul / Fitur** | packages/core architecture |
| **Dibuat oleh** | Alfin Noviaji |
| **Dibuat pada** | 2026-06-01 |
| **Diubah oleh** | - |
| **Diubah pada** | - |
| **Direview oleh** | - |
| **Direview pada** | - |
| **Versi** | v1 |
| **Status** | accepted |

---

## 2. Context

### Problem
The `@valfuse-node/core` package was implemented as a re-export wrapper:
```typescript
// packages/core/src/public-api.ts
export * from "@valfuse-node/form";
```

This created an architecturally incorrect dependency direction:
```
react ──→ core ──→ form  (WRONG)
```

Additionally, `core` was advertised as an "orchestration layer" but contained no orchestration logic — it merely re-exported form domain types and functions.

### User Requirement
User specified:
- Schema, validateSchema, transformValues, rules MUST be in `packages/form/`
- `packages/core` is Orchestration only — coordinates form and localization
- `packages/core` should have NO schema, validateSchema, or rules
- Shared utilities (used by form AND localization) go in core

### Constraints
- Must maintain backward compatibility for consumers migrating from `@valfuse-node/core`
- Cannot introduce circular dependencies
- Must use yarn only (not npm)

---

## 3. Decision

### Decision Made
1. **Removed form re-export from core** — `packages/core/src/public-api.ts` no longer exports from `@valfuse-node/form`
2. **Core is now orchestration-only** — placeholder for future shared utilities and coordination logic
3. **Consumers must migrate** — update imports from `@valfuse-node/core` to `@valfuse-node/form`
4. **React/Vue adapters updated** — now depend on `@valfuse-node/form` directly (not core)

### Before
```
react ──→ core ──→ form
vue   ──→ core ──→ form
localization → (nothing, not connected)
```

### After
```
react ──→ form ──→ [schema, rules, validation, transformation]
vue   ──→ form
localization ──→ core (shared utilities, when defined)
core  ──→ (nothing — orchestration placeholder)
```

### Files Changed
- `packages/core/src/public-api.ts` — removed form re-export
- `packages/core/package.json` — removed `@valfuse-node/form` dependency, added deprecation notice
- `packages/react/package.json` — changed `@valfuse-node/core` to `@valfuse-node/form`
- `packages/vue/package.json` — changed `@valfuse-node/core` to `@valfuse-node/form`
- `packages/examples/*/package.json` — updated dependencies
- Example source files — updated imports

---

## 4. Consequences

### Positive
- Clean Architecture dependency direction is now correct
- Form domain logic is isolated in `packages/form/`
- Core package is available for actual orchestration use cases
- No confusion about where form validation logic lives

### Negative
- **Breaking change** for consumers using `@valfuse-node/core` for form types/functions
- Requires migration effort from existing consumers

### Neutral
- Core package still exists but exports minimal API
- Additional work needed to define what "orchestration" means for this project

---

## 5. Alternatives Considered

### Option A: Remove packages/core entirely
- **Pros**: Simpler, no confusion
- **Cons**: No place for future orchestration, no migration path
- **Rejected because**: User explicitly stated core is "Orchestration" which implies a role

### Option B: Keep re-export with alias
- **Pros**: Backward compatible
- **Cons**: Still architecturally wrong, core depends on form
- **Rejected because**: Violates Clean Architecture dependency rules

### Option C: Core re-exports form with warning
- **Pros**: Backward compatible
- **Cons**: Delays the inevitable, technical debt
- **Rejected because**: User requirement is clear about architecture

---

## 6. Migration Notes

### For consumers using @valfuse-node/core

**Before:**
```typescript
import { createSchema, validateSchema } from "@valfuse-node/core";
```

**After:**
```typescript
import { createSchema, validateSchema } from "@valfuse-node/form";
```

### Migration Steps
1. Update package.json: change `@valfuse-node/core` dependency to `@valfuse-node/form`
2. Update all imports from `@valfuse-node/core` to `@valfuse-node/form`
3. Run typecheck and tests to verify

### Timeline
- Core package marked as deprecated in package.json description
- No immediate removal planned
- Consumers encouraged to migrate promptly

---

## 7. Addendum (2026-06-04) — Pivot to Umbrella Role

### Updated Status
**This ADR is partially superseded by a role pivot.** The "core is orchestration only, with no schema/validation" architectural rule from §3 still holds — but the *role* of `core` is no longer "placeholder for future orchestration logic." It is now the **umbrella entry point** for the entire valfuse-node ecosystem.

### Why pivot?
ADR-001's "no schema/validation in core" rule was sound: domain logic belongs in `form`, not `core`. But ADR-001 did not define what `core` *should* export. The interim state — an empty interface and a 0-byte ESM bundle — was unacceptable to publish.

After a fresh architecture review (2026-06-04), the user (Alfin) requested a single-install experience:

> "inginku core ini sebagai orcestra import/export dari form, localization, react, vue agar secara terpusat cukup `npm install @valfuse-node/core` sudah ada semuanya di library tersebut"

### New role of `core`
`@valfuse-node/core` is now a **pure re-export facade**. Its `dist/index.mjs` is ~270 B and contains only `export * from` statements. The dependency direction is:

```
core ──→ form
core ──→ localization
core ──→ react
core ──→ vue
```

`form` and `localization` are flattened to top level (no name collisions). `react` and `vue` are exported flat with `{Tech}{Domain}{Feature}`-prefixed hook names — `useReactValfuseForm` and `useVueValfuseForm` — to disambiguate the identically-named `useValfuseForm` exposed by both adapter packages. The underlying `@valfuse-node/react` and `@valfuse-node/vue` packages keep their original `useValfuseForm` name; the rename is umbrella-level only.

### What is preserved from ADR-001
- ✅ `core` still does **not** contain schema, validation, transformation, or rules — all of that stays in `form`.
- ✅ `core` still has **no** domain logic of its own. It is a re-export layer only.
- ✅ The dependency graph remains acyclic (the `localization → core` edge that existed as an unused-but-declared dep has been removed).

### What changed
- ❌ `core` is **no longer** an "orchestration placeholder" or "deprecation stub."
- ❌ The migration path described in §6 is **no longer necessary** for new consumers — they can install `@valfuse-node/core` and use `createSchema` etc. directly. Existing consumers who updated to `@valfuse-node/form` per §6 are unaffected.
- ⚠️ The "core has no peer dependencies" assumption is false: it now lists `react >= 18` and `vue >= 3` as **optional** peer dependencies. Consumers using only form/localization do not need to install them.

### Implications for ADR-002
ADR-002 ("Shared Utilities Extraction") is **superseded** by this addendum. The original idea — extract genuinely-shared utilities into `core` so both `form` and `localization` depend on it — would have created a cycle (since `core` now re-exports from `localization`). The new architecture makes ADR-002 unnecessary: there is no "shared utilities" role for `core` because `core` is a re-export facade, not a domain package.