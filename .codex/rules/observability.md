# Observability

Treat observability as part of production engineering.

## Consider for important production behavior

- structured logs
- metrics
- distributed traces
- error tracking
- correlation / request IDs
- meaningful operational context

Logs should help answer:

- what happened?
- where?
- for which operation?
- for which entity?
- what dependency failed?
- what was the outcome?

## Safety

Do not log secrets or unnecessarily sensitive information.

## Sentry

Use Sentry when production evidence is relevant.

Preferred production-debugging flow:

```
Sentry evidence
→ source code
→ logs/traces if available
→ root cause
→ fix
→ regression verification
```

Do not guess production behavior when evidence is available.