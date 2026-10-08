---
name: typescript-engineering-workflow
description: Use this skill for TypeScript-specific engineering work across frontend or backend including type modeling, DTO/domain types, generics, discriminated unions, strict null handling, API contracts, runtime validation boundaries, type-safe refactoring, and TS clean code. Use when the request explicitly involves TypeScript types, TS architecture, type safety, React TSX, Node TypeScript, or shared type contracts. Avoid when the task is framework-specific and does not require TypeScript design decisions.
---

# TypeScript Engineering Workflow

## Purpose

Use this skill to improve type safety, maintainability, and refactor confidence in TypeScript codebases.

This is a cross-cutting language skill. Use it with React or Node.js skills when a task requires framework-specific decisions plus type-level design.

## Operating Rules

1. Inspect existing TypeScript strictness and conventions first.
2. Do not use `any` unless there is a documented boundary reason.
3. Keep domain types distinct from DTOs when the project has domain/data separation.
4. Use runtime validation at external boundaries; TypeScript types alone are not validation.
5. Prefer explicit types for public APIs and inferred types for obvious local expressions.
6. Use discriminated unions for state machines and typed variants.
7. Avoid over-generic code that hides business meaning.
8. Keep shared types stable and version-conscious.
9. Avoid type assertions that silence real uncertainty.
10. Make illegal states unrepresentable where practical.

## TypeScript Review Checklist

When reviewing TypeScript code, check `references/typescript-checklist.md`.

## Output Contract

Return:

```text
# TypeScript Engineering Review

## Existing TypeScript Evidence
- tsconfig/strictness:
- Files inspected:
- Type modeling pattern:
- DTO/domain pattern:
- Runtime validation pattern:
- Error/state type pattern:

## Issues Found
- Type safety:
- Maintainability:
- Runtime boundary:
- Over/under-abstraction:
- Refactor risk:

## Recommended Approach
- Type model:
- Boundary validation:
- DTO/domain separation:
- Error/state typing:
- Test/refactor plan:

## Implementation Tasks
- Task:
- Files:
- Acceptance criteria:
- Risk:
```
