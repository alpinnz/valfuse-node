---
name: react-engineering-workflow
description: Use this skill for React-specific frontend engineering work including component design, hooks, state boundaries, rendering performance, routing integration, form handling, API integration in React applications, reusable component decisions, React testing, and migration/refactor planning. Use when the request explicitly involves React, Next.js React UI, React Native UI patterns, JSX/TSX components, hooks, context, or React-specific architecture concerns. Avoid for generic frontend planning that is not React-specific.
---

# React Engineering Workflow

## Purpose

Use this skill to keep React implementations clean, maintainable, scalable, reusable, testable, and aligned with project architecture.

This skill is a technology-specific supplement. It must not replace `frontend-engineering-workflow` for broad frontend planning. Use it when the task requires React-specific decisions.

## Operating Rules

1. Inspect existing React patterns before proposing changes.
2. Follow healthy existing conventions for folder structure, component composition, hooks, state, routing, data fetching, and tests.
3. Do not blindly copy unhealthy patterns. Mark them as technical debt and propose safe incremental improvement.
4. Keep components focused on rendering and interaction.
5. Keep business rules outside visual components.
6. Keep data transformation outside UI rendering code when the project has service, mapper, adapter, or view-model layers.
7. Avoid premature shared components. Share only when behavior and API are stable.
8. Prefer composition over prop explosion.
9. Avoid unnecessary global state.
10. Optimize rendering only when there is evidence or clear risk.

## React Review Checklist

When reviewing React code, check `references/react-checklist.md`.

## Output Contract

Return:

```text
# React Engineering Review

## Existing React Evidence
- Files inspected:
- Existing component pattern:
- Existing hook pattern:
- Existing state pattern:
- Existing API/data pattern:
- Existing test pattern:

## Issues Found
- Architecture:
- Maintainability:
- Reusability:
- Performance:
- Testability:

## Recommended Approach
- Component structure:
- Hook/service boundary:
- State strategy:
- API/data mapping:
- Testing plan:

## Implementation Tasks
- Task:
- Files:
- Acceptance criteria:
- Risk:
```
