# Node.js Engineering Checklist

## Architecture
- Keep controllers/route handlers thin.
- Keep use cases independent from Express/Nest/Fastify details.
- Keep repositories/adapters responsible for low-level I/O.
- Avoid direct database/client calls from controllers.
- Avoid domain entities importing framework types.

## Error Handling
- Use a consistent error taxonomy.
- Map domain/application errors to transport responses at the boundary.
- Avoid leaking stack traces or internal details to clients.
- Log with context but without sensitive data.

## Validation
- Validate external input at boundaries.
- Keep domain invariants in domain/application code.
- Keep DTO/schema validation separate from business decisions.

## Async and Side Effects
- Handle promises explicitly.
- Use transactions or compensation for multi-step state changes where needed.
- Keep retries/idempotency explicit for external integrations.

## Configuration
- Validate required environment variables at startup.
- Avoid reading env vars throughout business code.
- Use config providers/modules consistently.

## Testing
- Unit test use cases and pure logic.
- Integration test repositories, APIs, and external adapters with controlled fixtures.
- Add negative tests for validation and authorization.
