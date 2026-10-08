# Frontend Checklist

## Architecture
- Is business logic outside visual components?
- Is data fetching placed in the existing accepted layer?
- Is API response mapped before UI consumption when required?
- Is local/global/cache state separated clearly?
- Are reusable components truly reusable?

## Clean Code
- Are components small and named clearly?
- Are props explicit and stable?
- Is deep conditional rendering avoided?
- Are magic values extracted appropriately?
- Are feature-specific utilities kept out of shared folders?

## Testing
- Component behavior tested?
- Hooks/controllers tested when logic-heavy?
- Critical user flow covered by E2E?
- Error/loading/empty states covered?
