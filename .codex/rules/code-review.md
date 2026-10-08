# Code Review

Define Senior Engineer review standards.

## Correctness

- logic errors
- invalid assumptions
- async races
- concurrency problems
- stale state
- incorrect contracts
- edge cases

## Maintainability

- naming
- complexity
- duplication
- coupling
- cohesion
- responsibility boundaries
- unnecessary abstractions

## Reliability

- timeouts
- retries
- idempotency
- partial failures
- duplicate requests
- transaction safety

## Security

- authentication
- authorization
- validation
- injection
- sensitive-data exposure
- unsafe dependencies

## Performance

Only report meaningful performance issues. Do not report speculative
micro-optimizations.

## Severity

Use severity where useful:

```
BLOCKER
HIGH
MEDIUM
LOW
NIT
```

Do not classify personal style preferences as blocking issues.

Prefer a few high-confidence findings over many speculative findings.

## Toolkit

Use the repository code-reviewer agent or the optional CodeRabbit plugin for dedicated final engineering review when useful.
Do not repeatedly invoke overlapping reviewers on unchanged code.