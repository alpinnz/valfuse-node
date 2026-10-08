# React Engineering Checklist

## Components
- Keep rendering separate from orchestration when complexity grows.
- Keep feature-specific components inside feature/module folders.
- Move to shared only after stable reuse is proven.
- Avoid components with too many responsibilities.
- Avoid boolean prop combinations that create implicit state machines.
- Prefer explicit composition for layout and variants.

## Hooks
- Use hooks for UI orchestration, not as dumping grounds.
- Keep hooks focused on one concern.
- Avoid hiding business rules in hooks when a use case/service layer exists.
- Keep data fetching hooks consistent with project convention.

## State
- Local state for local UI behavior.
- URL state for navigation/filter/shareable state.
- Server-state cache for remote data.
- Global state only for cross-module/session concerns.
- Avoid duplicating the same state in multiple stores.

## Data Flow
- Do not render raw API shapes directly if the project uses DTO/model/mappers.
- Centralize error mapping according to existing convention.
- Keep loading, empty, error, and permission states consistent.

## Performance
- Avoid unnecessary memoization.
- Use memoization only for expensive computation, stable references, or proven render issues.
- Split large routes/components when they block readability or loading.
- Use lazy loading where it matches route/module boundaries.

## Testing
- Component tests for UI behavior.
- Hook tests for complex orchestration.
- Integration tests for API-connected flows where applicable.
- E2E tests for critical journeys.
