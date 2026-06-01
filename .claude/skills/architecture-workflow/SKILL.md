---
name: architecture-workflow
description: Use this skill for focused clean architecture analysis, module boundary design, dependency direction review, SOLID assessment, maintainability/scalability/reusability review, technical debt mapping, ADR creation, and architecture decision support. Use when the request is primarily about architecture quality. Do not use as the top-level workflow for broad PRD-to-delivery planning; use prd-to-delivery-workflow for cross-domain PRD, implementation, QA, and documentation planning.
---

# Architecture Workflow

## Purpose
Evaluate or design architecture so the project remains clean, maintainable, scalable, reusable, testable, and aligned with healthy existing conventions.

## Scope
Use for:
- Clean Architecture review
- Module boundary design
- Dependency direction validation
- SOLID review
- Technical debt mapping
- ADR creation
- Refactor roadmap
- Architecture quality gate before implementation

Do not use for:
- Frontend implementation details only -> use `frontend-engineering-workflow`
- Backend API/use case details only -> use `backend-engineering-workflow`
- QA-only planning -> use `qa-engineering-workflow`
- Documentation-only output -> use `technical-documentation-workflow`
- End-to-end PRD delivery -> use `prd-to-delivery-workflow`

## Review Dimensions
Always assess:
- Clean Architecture dependency direction
- Domain purity
- Layer responsibility
- Coupling and cohesion
- SOLID principles
- Reusability vs over-abstraction
- Scalability and future growth
- Testability
- Security/data sensitivity if relevant
- Migration and rollback risk

## Decision Priority
1. Product correctness
2. Security/data safety
3. Clean Architecture
4. Maintainability
5. Testability
6. SOLID
7. Scalability
8. Reusability
9. Healthy existing convention
10. Delivery speed

## Required Output

```markdown
# Architecture Quality Review

## 1. Existing Architecture Evidence

## 2. Clean Architecture Assessment

## 3. Maintainability Assessment

## 4. Scalability Assessment

## 5. Reusability Assessment

## 6. SOLID Assessment

## 7. Technical Debt Findings

## 8. Recommended Architecture Direction

## 9. Migration / Refactor Plan

## 10. ADR Recommendation
```

## Reference Files
- `references/clean-architecture-checklist.md`
- `references/parallel-execution-model.md`
- `references/adr-template.md`
- `references/task-breakdown-template.md`
