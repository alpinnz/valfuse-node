# Backend Checklist

## Architecture
- Are controllers thin?
- Are use cases explicit?
- Is persistence isolated?
- Are repository contracts stable?
- Are DTOs separated from domain models when required?
- Is authorization enforced server-side?

## Clean Code
- Are services cohesive?
- Are dependencies explicit?
- Is error handling consistent?
- Are transactions clear?
- Are side effects obvious?

## Testing
- Domain/use case unit tests?
- Repository/integration tests?
- Contract tests for API shape?
- Negative tests for auth/validation?
