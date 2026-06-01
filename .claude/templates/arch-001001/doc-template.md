# Template — Document Frontmatter

Every document in `docs/arch001001/` must start with this section:

```markdown
## 1. Informasi Umum

| Field | Value |
|-------|-------|
| **Nama Dokumen** | [document name] |
| **Nama Project** | valfuse-node |
| **Modul / Fitur** | [module or feature name] |
| **Dibuat oleh** | Alfin Noviaji |
| **Dibuat pada** | 2026-05-31 |
| **Diubah oleh** | Alfin Noviaji |
| **Diubah pada** | 2026-05-31 |
| **Direview oleh** | - |
| **Direview pada** | - |
| **Versi** | v1 |
| **Status** | draft |
```

## Field Definitions

| Field | Description |
|-------|-------------|
| **Nama Dokumen** | Document name/title |
| **Nama Project** | Project name (valfuse-node) |
| **Modul / Fitur** | Module or feature this document relates to |
| **Dibuat oleh** | Author who created the document |
| **Dibuat pada** | Creation date |
| **Diubah oleh** | Last author who modified |
| **Diubah pada** | Last modification date |
| **Direview oleh** | Reviewer name (fill when reviewed) |
| **Direview pada** | Review date (fill when reviewed) |
| **Versi** | Document version (v1, v2, etc.) |
| **Status** | draft / review / approved / deprecated |

## Document Types

| Status | Meaning |
|--------|---------|
| `draft` | Initial working draft |
| `review` | Under review |
| `approved` | Approved for implementation |
| `deprecated` | Superseded by newer version |

## Naming Format

```
docs/arch001001/{runner}-{phase}-{number}-{name}-v{version}
```

Example: `docs/arch001001/001-001-001-report-v1`

| Part | Meaning |
|------|---------|
| `001` | Runner number (workflow identifier) |
| `001` | Phase number (01-05) |
| `001` | Sequence number |
| `report` | Document type |
| `v1` | Version |

## File Structure

```
docs/arch001001/
  001-001-001-report-v1.md   ← Phase 1: Baseline
  001-002-001-report-v1.md   ← Phase 2: Specialists
  001-003-001-review-v1.md   ← Phase 3: Review
  001-004-001-task-v1.md     ← Phase 4: Tasks
  001-005-001-impl-v1.md     ← Phase 5: Implementation
```

## Version Increment Rules

- `v1` → `v2` when significant content changes
- Never delete or overwrite — new version is always added
- Status changes do NOT increment version (draft → review → approved)