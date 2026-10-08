# Clean Code (production-oriented)

## Prefer

- Explicit control flow
- Small, cohesive functions
- Shallow nesting
- Guard clauses
- Clear dependencies
- Domain-specific types
- Focused modules
- Clear state ownership
- Predictable behavior

## Avoid

- Deep nesting
- Giant functions
- Giant components
- Hidden side effects
- Boolean parameter traps
- Magic values
- Utility dumping grounds
- Premature generics
- Premature abstractions
- Synchronized duplicate state
- Unnecessary indirection

## Functions

- Functions should have one cohesive responsibility.
- Do not split functions merely to reduce line count.
- Extract only when it improves readability, reuse, isolation, testability,
  or responsibility boundaries.

## Comments

Comments should explain:

- why
- business rules
- constraints
- invariants
- trade-offs
- non-obvious decisions

Comments should not repeat obvious code.

## DRY

Apply DRY pragmatically. Similar syntax does not automatically mean shared
abstraction. A small amount of duplication is preferable to a bad abstraction.

## Complexity

- Prefer explicit, linear control flow.
- Use guard clauses to avoid nested conditionals.
- Fail fast at boundaries.