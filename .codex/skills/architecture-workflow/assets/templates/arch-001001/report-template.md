# Template — Report Document

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

## 2. Scope Analyzed

- **Scope:** [What this report covers]
- **Included:** [Files/modules analyzed]
- **Excluded:** [Files/modules not covered]

---

## 3. Files / Evidence Inspected

| Path | Evidence | Relevance |
|------|----------|-----------|
| [path] | [finding] | [why relevant] |
| [path] | [finding] | [why relevant] |

---

## 4. Current Architecture Pattern

### Package Structure (Current)

```
[Current package structure diagram]
```

### Existing Convention
[Current architectural pattern]

### Healthy Pattern
[List of good patterns to preserve]

### Problematic Pattern
[List of patterns that need improvement]

---

## 5. Baseline Findings

### Requirement Findings

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| [aspect 1] | [current] | [target] |
| [aspect 2] | [current] | [target] |

### Codebase Findings

| Package | Lines of Code | Responsibilities |
|---------|---------------|-----------------|
| [package] | [LOC] | [responsibilities] |

### Technical Debt

| Debt | Severity | Impact |
|------|----------|--------|
| [debt] | [severity] | [impact] |

### Risk Areas

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [risk] | [probability] | [impact] | [mitigation] |

---

## 6. Analysis Sections

### Clean Architecture Assessment

- **Dependency direction:**
- **Layer responsibility:**
- **Boundary violations:**
- **Domain purity:**
- **Infrastructure leakage:**

### Maintainability Assessment

- **Coupling:**
- **Cohesion:**
- **Complexity:**
- **Naming:**
- **Change impact:**

### Scalability Assessment

- **Module growth risk:**
- **Data flow growth risk:**
- **Platform growth risk:**
- **Performance concern:**

### Reusability Assessment

- **Reusable candidates:**
- **Feature-local logic:**
- **Premature abstraction risk:**
- **Duplication risk:**

### SOLID Assessment

- **SRP:**
- **OCP:**
- **LSP:**
- **ISP:**
- **DIP:**

---

## 7. Specialist Analysis

### [Specialist Name 1]

**Scope**: [scope]
**Findings**: [findings]
**Recommendations**: [recommendations]

### [Specialist Name 2]

**Scope**: [scope]
**Findings**: [findings]
**Recommendations**: [recommendations]

---

## 8. Technical Debt

| Debt | Impact | Severity | Suggested Improvement |
|------|--------|----------|----------------------|
| [debt] | [impact] | [severity] | [improvement] |

---

## 9. Recommendations Summary

### Must Fix (Critical)

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

### Should Fix (High)

1. [Recommendation 1]
2. [Recommendation 2]

### Optional (Medium)

1. [Recommendation 1]
2. [Recommendation 2]

---

## 10. Next Steps

1. **Phase 1**: [description]
2. **Phase 2**: [description]
3. **Phase 3**: [description]

---

## 11. Naming

```
docs/arch001001/{runner}-{phase}-{number}-{name}-v{version}
```

Example: `docs/arch001001/001-001-001-report-v1.md`