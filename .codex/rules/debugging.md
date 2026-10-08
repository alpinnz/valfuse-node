# Debugging

Debugging must be evidence-driven.

## Model

```
Problem
→ Reproduction
→ Evidence
→ Root Cause
→ Fix
→ Verification
```

Do not randomly change code until symptoms disappear.

## Sources of evidence

Consider evidence from:

- stack traces
- logs
- network requests
- API responses
- application state
- database state
- browser console
- tests
- metrics
- traces
- Sentry
- source code

## Principles

- Find the earliest appropriate layer that violated the intended invariant.
- Do not compensate for backend contract bugs with fragile frontend patches
  unless explicitly required as a temporary compatibility measure.
- Do not suppress errors just to remove symptoms.
- Verify root cause with evidence before changing code.