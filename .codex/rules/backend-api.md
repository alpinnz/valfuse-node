---
paths:
  - '**/*.{go,java,kt,cpp,c,rs,py,cs}'
  - 'server/**'
  - 'backend/**'
  - 'api/**'
description: Backend and API engineering rules activated for server-side source files.
---

# Backend / API

## Inputs and invariants

- Treat incoming requests as untrusted.
- Important business invariants belong in authoritative backend/domain logic.
- Authentication does not imply authorization.

## API contract

Consider:

- request schema
- response schema
- validation
- authentication
- authorization
- status codes
- error format
- backwards compatibility
- idempotency
- pagination

Do not silently change public contracts.

## Database changes

Consider:

- constraints
- nullability
- indexes
- transactions
- locking
- concurrency
- migration safety
- backwards compatibility
- rollback

Do not add indexes blindly. Do not perform destructive migrations casually.

- Keep transactions focused.
- Understand which operations must succeed or fail atomically.
- Avoid external network calls inside long database transactions unless
  required and consciously designed.

## External services

For external services consider:

- timeout
- cancellation
- retry
- idempotency
- failure mapping
- observability

Do not assume dependencies always succeed.

## Error exposure

Do not expose internal stack traces, secrets, database internals, or
infrastructure details to untrusted clients. Keep internal diagnostic context
while exposing safe external errors.