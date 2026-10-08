---
name: frontend-engineering-workflow
description: Use this skill for focused frontend web or mobile engineering work including UI architecture, component structure, state management, API integration, routing, forms, validation, DTO/view-model mapping, reusable components, frontend clean code review, and frontend testing strategy. Use only when the request is primarily frontend-specific. For broad PRD-to-delivery work, use prd-to-delivery-workflow; for architecture-only review, use architecture-workflow.
---

# Frontend Engineering Workflow

## Purpose
Plan, review, or implement frontend work while preserving clean architecture, maintainability, scalability, reusability, clean code, SOLID, testability, and UI/UX consistency.

## Scope
Use for:
- Web/mobile UI implementation planning
- Component architecture
- Feature module structure
- State management
- API integration from frontend
- Form and validation pattern
- Routing/navigation pattern
- Error/loading/empty state standard
- Frontend testing plan
- Frontend refactor review

## Core Rules
- Keep visual components focused on rendering and user interaction.
- Keep business rules outside components/pages/screens.
- Keep API response transformation outside visual components.
- Use existing healthy state, API, validation, and routing patterns.
- Keep shared components domain-neutral.
- Keep feature-specific components inside the feature/module.
- Avoid global state unless data is cross-module, session-level, or truly shared.
- Avoid premature shared abstractions.

## Frontend Layer Guidance
Typical ownership:
- Presentation: pages, screens, components, UI state
- Application: hooks/controllers/view-models/use cases
- Domain: frontend domain model/rules when present
- Infrastructure: API clients, storage, adapters, mappers

## Required Output

```markdown
# Frontend Engineering Plan

## 1. Existing Frontend Evidence

## 2. UI/UX Scope

## 3. Component Plan

## 4. State Management Plan

## 5. API Integration Plan

## 6. Data Mapping / View Model Plan

## 7. Reusability Plan

## 8. Clean Code / SOLID Notes

## 9. Testing Plan
- Unit:
- Component:
- Integration:
- E2E:

## 10. Tasks
```

## Reference Files
- `references/frontend-checklist.md`
- `references/frontend-task-template.md`
