# Template — Architecture Decision Record (ADR)

## 1. Informasi Umum

| Field | Value |
|-------|-------|
| **Nama Dokumen** | [document name] |
| **Nama Project** | valfuse-node |
| **Modul / Fitur** | [module or feature name] |
| **Dibuat oleh** | [author] |
| **Dibuat pada** | [date] |
| **Diubah oleh** | [author] |
| **Diubah pada** | [date] |
| **Direview oleh** | [reviewer] |
| **Direview pada** | [date] |
| **Versi** | v1 |
| **Status** | proposed |

---

## 2. Context

[Describe the situation and context that requires a decision]

---

## 3. Decision

[Describe the decision that was made]

---

## 4. Consequences

### Positive
- [What benefits this decision brings]

### Negative
- [What drawbacks this decision introduces]

---

## 5. Alternatives Considered

[Describe alternative options that were considered and why they were rejected]

---

## 6. Migration Notes

[If applicable, describe how to migrate from previous approach]

---

## Naming

```
docs/arch001001/{runner}-adr-{sequence}-{name}-v{version}
```

Example: `docs/arch001001/001-adr-001-form-package-v1.md`

## ADR Status

| Status | Meaning |
|--------|---------|
| `proposed` | Under consideration |
| `accepted` | Approved and implemented |
| `deprecated` | Superseded by another ADR |

## When to Create an ADR

Create an ADR when a decision:
- Introduces a new pattern
- Changes an existing architecture rule
- Affects multiple modules
- Affects security or data contract
- Creates long-term tradeoffs
- Requires migration