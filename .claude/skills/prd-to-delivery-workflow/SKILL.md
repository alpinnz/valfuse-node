---
name: prd-to-delivery-workflow
description: Use this skill for end-to-end software delivery planning from PRD, feature brief, user story, epic, or product specification into requirement analysis, architecture direction, frontend tasks, backend tasks, QA strategy, documentation plan, release readiness, and implementation sequencing. Use when the request spans multiple roles, layers, platforms, or delivery phases. Do not use for narrow frontend-only, backend-only, QA-only, documentation-only, or architecture-only requests unless they are part of a broader PRD-to-delivery workflow.
---

# PRD to Delivery Workflow

## Purpose
Convert a PRD, epic, feature requirement, or product specification into an execution-ready delivery package without mixing responsibilities between architecture, frontend, backend, QA, and documentation.

## Routing Rule
Use this skill as the top-level workflow only when the input spans two or more delivery domains. For focused work, route to the narrower skill:

- Architecture only -> `architecture-workflow`
- Frontend only -> `frontend-engineering-workflow`
- Backend only -> `backend-engineering-workflow`
- QA/testing only -> `qa-engineering-workflow`
- Technical documentation only -> `technical-documentation-workflow`

## Workflow

### 1. Requirement Intake
Extract:
- Objective
- Actors/users
- Business rules
- Functional scope
- Out of scope
- Acceptance criteria
- Dependencies
- Risks and assumptions

### 2. Delivery Domain Split
Separate work into:
- Architecture
- Frontend
- Backend
- Data/integration
- QA
- DevOps/release
- Documentation

### 3. Architecture Gate
Before task creation, validate:
- Clean Architecture dependency direction
- Module boundaries
- SOLID impact
- Reusability opportunity
- Scalability risk
- Maintainability risk
- Security or data sensitivity

### 4. Parallel Specialist Planning
When available, use the relevant specialist skills/agents in parallel after baseline requirement context is established:
- `architecture-workflow`
- `frontend-engineering-workflow`
- `backend-engineering-workflow`
- `qa-engineering-workflow`
- `technical-documentation-workflow`

### 5. Fan-in Consolidation
Merge specialist outputs into one delivery package. Resolve conflicts using this priority:
1. Product correctness
2. Security and data safety
3. Clean Architecture
4. Maintainability
5. Testability
6. Scalability
7. Reusability
8. Healthy existing convention
9. Delivery speed

### 6. Task Breakdown
Create implementation-ready tasks with:
- Title
- Domain/role
- Scope
- Dependencies
- Files likely affected
- Acceptance criteria
- Testing requirement
- Documentation impact
- Risk level

## Required Output

Use this structure:

```markdown
# PRD to Delivery Package

## 1. Requirement Summary

## 2. Scope Split
- Architecture:
- Frontend:
- Backend:
- Data/Integration:
- QA:
- DevOps/Release:
- Documentation:

## 3. Architecture Quality Notes
- Clean Architecture:
- Maintainability:
- Scalability:
- Reusability:
- SOLID:
- Testability:

## 4. Cross-Domain Dependencies

## 5. Delivery Tasks
| ID | Domain | Task | Dependency | Acceptance Criteria | Test Scope | Risk |
|---|---|---|---|---|---|---|

## 6. Testing Strategy

## 7. Documentation Plan

## 8. Open Questions / Assumptions
```

## Reference Files
- See `references/delivery-task-template.md` for task format.
- See `references/prd-analysis-checklist.md` for intake checklist.
