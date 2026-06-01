# [🟡 ARCH 001001] - Architecture Workflow Templates

Template files untuk architecture workflow project valfuse-node.

## Directory Structure

```
.claude/templates/arch-001001/
  README.md              ← This file
  doc-template.md        ← Document frontmatter template
  adr-template.md        ← ADR template
  plan-template.md       ← Plan template
  task-template.md       ← Task template
  report-template.md     ← Report template
```

## Naming Convention

All output files use format:

```
docs/arch001001/{runner}-{phase}-{number}-{name}-v{version}
```

Example:
```
docs/arch001001/001-001-001-report-v1.md
docs/arch001001/001-002-001-report-v1.md
docs/arch001001/001-003-001-review-v1.md
docs/arch001001/001-004-001-task-v1.md
docs/arch001001/001-005-001-impl-v1.md
```

## Phase Output Files

| Phase | File | Description |
|-------|------|-------------|
| Phase 1 | `001-001-001-report-v1.md` | Baseline analysis |
| Phase 2 | `001-002-001-report-v1.md` | Specialist fan-out |
| Phase 3 | `001-003-001-review-v1.md` | Fan-in review |
| Phase 4 | `001-004-001-task-v1.md` | Task composition |
| Phase 5 | `001-005-001-impl-v1.md` | Implementation readiness |

## Document Types

| Type | Description |
|------|-------------|
| `report` | Phase 1-2 output |
| `review` | Phase 3 fan-in review |
| `task` | Phase 4 task composition |
| `impl` | Phase 5 implementation readiness |

## Common Fields (Informasi Umum)

Every document must start with:

```markdown
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
| **Status** | draft |
```

## Workflow Status Values

| Status | Meaning |
|--------|---------|
| `draft` | Initial working draft |
| `review` | Under review |
| `approved` | Approved for implementation |
| `deprecated` | Superseded |

## ADR Status Values

| Status | Meaning |
|--------|---------|
| `proposed` | Under consideration |
| `accepted` | Approved and implemented |
| `deprecated` | Superseded by another ADR |