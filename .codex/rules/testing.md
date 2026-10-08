# Testing

Testing effort should follow risk.

## Priority

Prioritize tests that cover:

- business-critical behavior
- authorization
- complex state transitions
- regressions
- edge cases
- integration boundaries
- critical user flows

## Pyramid

Use unit, integration, and end-to-end tests at the appropriate boundary.

- Unit: fast, isolated logic.
- Integration: real boundaries and contracts.
- E2E: critical user flows, sparingly and, when possible, on stable
  targets.

## Behavior not implementation

Test behavior rather than private implementation.

For bug fixes, when practical:

```
reproduce
→ failing regression test
→ smallest fix
→ passing regression test
→ surrounding verification
```

## Qualities

Tests should be deterministic, readable, isolated where appropriate,
repeatable, and meaningful.

## Avoid

- arbitrary sleeps
- order-dependent tests
- excessive mocking
- brittle selectors
- mocking the implementation itself

Mock boundaries, not everything.

## Run verification

Run tests before declaring success. Never claim green tests that were not run.