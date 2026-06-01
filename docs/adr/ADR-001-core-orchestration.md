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