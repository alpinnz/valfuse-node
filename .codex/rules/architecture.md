# Architecture

Pragmatic Clean Architecture and architecture-review principles.

## Considerations for any architecture decision

- Separation of concerns
- Module boundaries
- Dependency direction
- State ownership
- Data flow
- API boundaries
- Domain boundaries
- Infrastructure boundaries
- Coupling
- Cohesion
- Testability
- Backwards compatibility
- Deployment impact
- Observability
- Scalability requirements

## Dependency rules

- Important business logic should not unnecessarily depend on infrastructure.
- Dependencies should point toward stable, domain-level abstractions where
  this provides meaningful isolation — not toward arbitrary layers.
- Infrastructure may depend on domain; domain should not depend on
  infrastructure unless required by the actual framework in use.
- Keep the dependency direction explicit and one-way within a module.

## Prohibit ceremonial Clean Architecture

Do not introduce:

- ports
- adapters
- repositories
- use cases
- interfaces
- factories
- domain services

unless they provide meaningful:

- isolation
- dependency control
- testing
- ownership
- substitution
- reuse

Prefer the architecture already established in a repository unless it causes
a concrete technical problem.

## State ownership

- Every mutable state must have a clear owner.
- Avoid multiple sources of truth.
- Derived state should normally be calculated rather than manually synchronized.
- State must be modified only through its owner.

## Boundaries

- APIs, domains, and infrastructure need defined boundaries.
- Serialize across boundaries; agree on contracts.
- Keep side effects at the edge of the module where they belong.
- Never let a dependency cross a boundary implicitly.

## Scalability

Do not design for hypothetical scale. Prefer evidence-based optimization.

## Deployment impact

Prefer changes that are deployable independently and can be rolled back.

## Testability

Architecture must keep important logic testable without heavy infrastructure
or extensive mocking. Mock the boundary, not the implementation.