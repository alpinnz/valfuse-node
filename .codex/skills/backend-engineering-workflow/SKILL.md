---
name: backend-engineering-workflow
description: Use this skill for focused backend engineering work including API design, application use cases, service boundaries, repository pattern, database access, validation, authorization, external integration, error handling, backend clean code review, and backend testing strategy. Use only when the request is primarily backend-specific. For broad PRD-to-delivery work, use prd-to-delivery-workflow; for architecture-only review, use architecture-workflow.
---

# Backend Engineering Workflow

## Purpose
Plan, review, or implement backend work with clean architecture boundaries, thin controllers, explicit use cases, safe data access, strong validation, authorization, maintainability, scalability, SOLID, and testability.

## Scope
Use for:
- API contract design
- Controller/handler planning
- Use case/service design
- Repository/interface boundaries
- Database access pattern
- DTO/schema validation
- Authentication/authorization behavior
- External service integration
- Error response standard
- Backend testing plan

## Core Rules
- Keep controllers thin.
- Keep business rules in application/domain layer.
- Keep persistence logic in repository/infrastructure layer.
- Keep external integrations in adapters/infrastructure.
- Keep validation at boundaries and invariants in domain/application.
- Keep backend authorization authoritative.
- Avoid god services.
- Avoid database model leakage into domain or response unless intentional and safe.

## Required Output

```markdown
# Backend Engineering Plan

## 1. Existing Backend Evidence

## 2. API Contract

## 3. Use Case / Service Boundary

## 4. Domain Rules

## 5. Repository / Persistence Plan

## 6. Validation and Error Handling

## 7. Authentication / Authorization

## 8. Integration Impact

## 9. Clean Code / SOLID Notes

## 10. Testing Plan
- Unit:
- Integration:
- Contract:
- Security:
- Regression:

## 11. Tasks
```

## Reference Files
- `references/backend-checklist.md`
- `references/backend-task-template.md`
