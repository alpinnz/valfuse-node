# Clean Architecture Checklist

## Dependency Direction
- Presentation may depend on application-facing APIs.
- Application may depend on domain and repository/service contracts.
- Domain depends on no framework or infrastructure implementation.
- Infrastructure depends inward and implements contracts.

## Violations
- UI component contains business rule.
- Use case directly imports HTTP client, ORM, SDK, or database adapter.
- Domain imports framework types.
- API response is used as domain model without intentional mapping.
- Shared module becomes a dumping ground.

## Review Categories
- Modularity
- Testability
- Dependency direction
- Data mapping
- Security and authorization
- Error handling
- Performance and scalability
- Migration safety
- Team readability
