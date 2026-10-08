---
name: nodejs-engineering-workflow
description: Use this skill for Node.js-specific backend or server-side engineering work including Express, NestJS, Fastify, Node service boundaries, runtime configuration, middleware, validation, error handling, async flows, package scripts, dependency management, API handlers, and Node testing. Use when the request explicitly involves Node.js, JavaScript/TypeScript backend, server runtime behavior, middleware, or Node ecosystem implementation. Avoid for generic backend planning not tied to Node.js.
---

# Node.js Engineering Workflow

## Purpose

Use this skill to keep Node.js backend/server code clean, maintainable, scalable, secure, testable, and aligned with clean architecture.

This skill is technology-specific. Use `backend-engineering-workflow` for broad backend design and this skill for Node.js runtime/framework details.

## Operating Rules

1. Inspect existing framework and module conventions first.
2. Keep handlers/controllers thin.
3. Keep business rules in application/domain layers.
4. Keep infrastructure code in adapters, providers, repositories, clients, or framework-specific modules.
5. Keep validation at boundaries and domain invariants in domain/application code.
6. Use centralized error handling where the project supports it.
7. Avoid mixing transport concerns with use cases.
8. Avoid introducing new packages when existing packages solve the same need.
9. Treat asynchronous side effects explicitly.
10. Keep configuration typed, validated, and environment-specific.

## Node Review Checklist

When reviewing Node.js code, check `references/nodejs-checklist.md`.

## Output Contract

Return:

```text
# Node.js Engineering Review

## Existing Node.js Evidence
- Framework:
- Files inspected:
- Module pattern:
- Handler/controller pattern:
- Service/use case pattern:
- Repository/integration pattern:
- Validation/error pattern:
- Test pattern:

## Issues Found
- Architecture:
- Maintainability:
- Scalability:
- Security:
- Testability:

## Recommended Approach
- Module boundary:
- Handler/controller:
- Use case/service:
- Repository/integration:
- Validation/error:
- Testing plan:

## Implementation Tasks
- Task:
- Files:
- Acceptance criteria:
- Risk:
```
