# Reliability

Assume external operations can fail.

## Always consider

- timeouts
- cancellation
- retries
- idempotency
- partial failure
- duplicate requests
- concurrency
- race conditions
- stale state
- transaction boundaries
- recovery behavior

## External calls

External calls must not wait indefinitely.

Retries must be bounded, intentional, safe, and observable.

- Do not retry permanent failures.
- Do not retry unsafe non-idempotent operations without idempotency
  protection.

## Idempotency

Explicitly consider idempotency for operations such as:

- payment creation
- job submission
- webhook processing
- imports
- message publishing
- commands with side effects

## Error handling

- Do not silently swallow errors.
- Preserve useful diagnostic context without leaking sensitive details.
- Do not expose stack traces, database implementation details, secrets, or
  internal infrastructure details to untrusted clients.