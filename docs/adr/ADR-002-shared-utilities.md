## 1. Informasi Umum

| Field | Value |
|-------|-------|
| **Nama Dokumen** | ADR-002: Shared Utilities Extraction |
| **Nama Project** | valfuse-node |
| **Modul / Fitur** | packages/core shared utilities |
| **Dibuat oleh** | Alfin Noviaji |
| **Dibuat pada** | 2026-06-01 |
| **Diubah oleh** | - |
| **Diubah pada** | - |
| **Direview oleh** | - |
| **Direview pada** | - |
| **Versi** | v1 |
| **Status** | **superseded** (see ADR-001 §7 addendum, 2026-06-04) |

---

## 2. Context

### Problem
User requirement states that `packages/core` should hold "shared utilities used by both form and localization". However, no shared utilities currently exist — the original core was just a re-export wrapper.

### User Requirement
- Schema, validateSchema, transformValues, rules MUST be in `packages/form/`
- `packages/core` is Orchestration only
- Shared utilities used by BOTH form AND localization go in core
- `packages/localization` should depend on `packages/core` for shared utilities

### Current State
After ADR-001 implementation:
- Core no longer re-exports form
- No shared utilities defined
- Localization has no dependency on core

---

## 3. Decision

### Decision Made
1. **Audit shared utilities** — identify which utilities (if any) are truly used by both form and localization
2. **Extract common patterns** — only extract what genuinely duplicates across packages
3. **Core shared folder** — if utilities are found, implement in `packages/core/src/shared/`
4. **Localization depends on core** — add `@valfuse-node/core` dependency to localization

### Candidate Shared Utilities (to be audited)
| Candidate | Form Usage | Localization Usage | Verdict |
|-----------|------------|-------------------|---------|
| `t` transformer | Yes — field transforms | Possible — value transforms | TBD |
| `normalizeError` | Yes — error normalization | No obvious usage | TBD |
| Type utilities | Yes | Possible | TBD |

### TODO
- [ ] Audit form and localization for truly shared patterns
- [ ] Implement shared utilities if any exist
- [ ] Add core dependency to localization package.json
- [ ] Document what is shared and why

---

## 4. Consequences

### Positive
- Clear separation of concerns
- No premature abstraction
- Duplication is eliminated only when it genuinely exists

### Negative
- Additional analysis required
- May reveal no utilities are truly shared (which is valid)

### Neutral
- Core's role is still being defined
- Future work needed to complete the architecture

---

## 5. Alternatives Considered

### Option A: Move ALL shared-looking code to core
- **Pros**: " DRY"
- **Cons**: Premature abstraction, may create false dependencies
- **Rejected because**: Violates "prefer duplication over premature abstraction" rule

### Option B: Leave core empty until a clear need emerges
- **Pros**: YAGNI, no unnecessary coupling
- **Cons**: Core has no purpose yet
- **Decision**: Acceptable as interim state

### Option C: Define shared utilities based on user intuition
- **Pros**: Satisfies user requirement
- **Cons**: May create unused code
- **Decision**: Audit first, then implement only what's proven

---

## 6. Migration Notes

If shared utilities are added to core:

### For form package
```typescript
// Before (if using local utils)
import { t } from "./shared/transformers";

// After (if transformer is in core)
import { t } from "@valfuse-node/core";
```

### For localization package
```typescript
// After core dependency added
import { someSharedUtility } from "@valfuse-node/core";
```