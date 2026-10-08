# Golang Engineering Checklist

## Package Structure
- Prefer package boundaries that match domain/application/infrastructure responsibilities.
- Avoid package names like common, utils, helpers unless narrowly scoped.
- Keep exported names intentional.
- Avoid circular dependencies.

## Interfaces
- Define small interfaces near consumers when it improves testability or dependency inversion.
- Do not create interfaces for every struct automatically.
- Avoid large interfaces.

## Handlers and Use Cases
- Handlers parse, validate, authorize at boundary, call use case, map response.
- Use cases coordinate business flow and depend on abstractions.
- Repositories/adapters handle persistence/external systems.

## Errors
- Return errors explicitly.
- Wrap errors with context where useful.
- Map internal errors to transport errors at boundaries.
- Do not expose internal details to clients.

## Context and Concurrency
- Use `context.Context` for cancellation, deadlines, and request-scoped values.
- Avoid unbounded goroutines.
- Avoid sharing mutable state without synchronization.
- Prefer simple synchronous flow unless concurrency is needed.

## Testing
- Table-driven tests where appropriate.
- Unit test use cases with fakes.
- Integration test repositories and handlers when needed.
- Test error paths and authorization boundaries.
