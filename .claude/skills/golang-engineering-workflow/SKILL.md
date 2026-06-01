---
name: golang-engineering-workflow
description: Use this skill for Go/Golang-specific backend engineering work including package structure, interfaces, dependency inversion, handlers, services/use cases, repositories, context propagation, error handling, concurrency, goroutines, channels, database access, API servers, and Go testing. Use when the request explicitly involves Go, Golang, Go modules, Go services, or Go-specific clean architecture implementation. Avoid for generic backend planning not tied to Go.
---

# Golang Engineering Workflow

## Purpose

Use this skill to keep Go services simple, idiomatic, maintainable, scalable, testable, and aligned with clean architecture.

This skill is technology-specific. Use `backend-engineering-workflow` for broad backend design and this skill for Go implementation details.

## Operating Rules

1. Inspect existing package layout first.
2. Prefer simple idiomatic Go over framework-heavy abstractions.
3. Keep handlers thin and transport-specific.
4. Keep use cases/services independent from HTTP, database, and framework details.
5. Define small interfaces near the consumer when useful.
6. Avoid unnecessary abstraction and generic frameworks.
7. Pass `context.Context` through request-scoped operations.
8. Handle errors explicitly and consistently.
9. Keep concurrency bounded, cancellable, and observable.
10. Test use cases with fakes/mocks and integration boundaries with fixtures.

## Go Review Checklist

When reviewing Go code, check `references/golang-checklist.md`.

## Output Contract

Return:

```text
# Golang Engineering Review

## Existing Go Evidence
- Packages inspected:
- Handler pattern:
- Use case/service pattern:
- Interface/repository pattern:
- Error pattern:
- Context/concurrency pattern:
- Test pattern:

## Issues Found
- Architecture:
- Maintainability:
- Scalability:
- Concurrency risk:
- Testability:

## Recommended Approach
- Package boundary:
- Interface boundary:
- Handler/use case/repository flow:
- Error strategy:
- Context/concurrency strategy:
- Testing plan:

## Implementation Tasks
- Task:
- Files:
- Acceptance criteria:
- Risk:
```
