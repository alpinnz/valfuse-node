# Template — Task Document

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

---

## 2. Task Definitions

### DoR (Definition of Ready)

Sebelum task di-assign dan dimulai:

- [ ] Task memiliki description yang jelas
- [ ] Dependency task sudah completed
- [ ] Acceptance criteria sudah defined
- [ ] Resource yang dibutuhkan sudah tersedia
- [ ] Technical approach sudah agreed
- [ ] Risk sudah di-assess

### DoD (Definition of Done)

Task dianggap selesai ketika:

- [ ] Code sudah di-write dan compile tanpa error
- [ ] Unit test sudah written dan passing
- [ ] Integration test sudah passing (jika applicable)
- [ ] Code sudah di-review minimal 1 reviewer
- [ ] Documentation sudah updated (jika applicable)
- [ ] No breaking changes tanpa reason yang valid
- [ ] TypeScript compilation pass tanpa error
- [ ] Lint pass tanpa error

---

## 3. Task Details Template

### Task ID: [XXX]
**Title**: [Task title]

| Field | Value |
|-------|-------|
| **Role** | [Frontend/Backend/QA/DevOps/Documentation/Refactor/Security/Data] |
| **Layer** | [Presentation/Application/Domain/Infrastructure] |
| **Module** | [module name] |
| **Priority** | [Must Fix/Should Fix/Optional] |
| **Risk Level** | [Low/Medium/High/Critical] |
| **Estimated Complexity** | [1-10] |

**DoR Checklist**:
- [ ] [Checklist item 1]
- [ ] [Checklist item 2]
- [ ] [Checklist item 3]

**Description**:
[Detailed description of what needs to be done]

**Sub-Tasks**:
- [ ] 1. [Sub-task 1]
- [ ] 2. [Sub-task 2]
- [ ] 3. [Sub-task 3]

**Files to Create**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Files to Modify**:
- `path/to/file1.ts`
- `path/to/file2.ts`

**Files to Remove**:
- `path/to/file1.ts`

**Dependency**: [Task IDs that must be completed before this task]

**Acceptance Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Testing Requirement**: [What tests need to be written or updated]

**Documentation Requirement**: [What documentation needs to be created or updated]

**PR Description Template**:
```markdown
## Summary
[One sentence description of the change]

## Changes
- [List of specific changes made]
- [Include file paths]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Refactoring

## DoD Checklist
- [ ] Code compiles without errors
- [ ] Unit tests added/updated and passing
- [ ] Integration tests passing (if applicable)
- [ ] No breaking changes (or documented)
- [ ] Documentation updated (if applicable)
- [ ] TypeScript compilation passes
- [ ] Lint passes

## Verification
- [ ] npm run typecheck passes
- [ ] npm run lint passes
- [ ] npm run test passes
- [ ] npm run build passes
```

---

## 4. Naming

```
docs/arch001001/{runner}-{phase}-{number}-{name}-v{version}
```

Example: `docs/arch001001/001-004-001-task-v1.md`