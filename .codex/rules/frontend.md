---
paths:
  - '**/*.{ts,tsx,js,jsx,vue,svelte,css,scss,html}'
description: Frontend engineering rules activated for frontend web source files.
---

# Frontend

## State

- Prefer local state until shared state is genuinely required.
- Maintain one source of truth.
- Derived values should normally be calculated rather than manually synchronized.
- Keep state ownership explicit.

## Components

- Components require clear responsibilities.
- Do not extract components merely to reduce line count.
- Prefer composition over unnecessary abstraction.

## UI states

Always consider:

- loading
- success
- empty
- error
- disabled
- validation
- partial data
- retry

## Asynchronous risks

Consider:

- stale requests
- duplicate requests
- cancellation
- race conditions
- navigation during requests
- unmount behavior
- optimistic update rollback

## Accessibility

Treat accessibility as part of correctness. Consider:

- semantic HTML
- keyboard access
- focus management
- labels
- accessible names
- screen readers
- contrast

## React

- Keep state ownership explicit.
- Avoid unnecessary effects.
- Control side effects.
- Prefer composition.
- Avoid duplicated derived state.
- Avoid unnecessary global state.

Before using `useEffect`, determine whether the logic belongs in:

- rendering
- event handler
- data fetching
- state transition
- subscription

Do not use `useMemo` by default. Only use memoization when there is a
demonstrated performance need or the project explicitly requires it.