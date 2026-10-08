# Performance

Do not optimize without evidence.

## Before optimizing

Identify:

- actual bottleneck
- measurement
- expected impact
- complexity cost
- regression risk

## Evidence tools

Use profiling, metrics, traces, benchmarks, database query plans, and browser
performance tooling when appropriate.

## Meaningful costs

Focus on meaningful costs such as:

- algorithmic complexity
- unnecessary network requests
- N+1 database queries
- large payloads
- blocking I/O
- repeated expensive computation
- unbounded concurrency
- memory growth
- unnecessary UI rendering

## Caching

Do not add caching without defining:

- cache key
- TTL
- invalidation
- consistency requirements
- memory limits
- failure behavior

## Scale

Do not design for hypothetical scale.