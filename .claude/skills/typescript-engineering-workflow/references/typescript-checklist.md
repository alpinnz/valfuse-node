# TypeScript Engineering Checklist

## Type Safety
- Avoid `any` and unsafe assertions.
- Prefer `unknown` at external boundaries until validated.
- Use strict null checks and explicit optional handling.
- Avoid broad object types when a precise model is needed.

## DTO and Domain Types
- Keep raw API/database DTOs separate from domain/view models when architecture requires it.
- Use mappers to transform external shapes.
- Avoid leaking backend DTO changes directly into UI/domain logic.

## Runtime Validation
- Validate external input at boundaries.
- Do not rely on interfaces/types for runtime safety.
- Keep validation schemas close to boundary contracts.

## State and Variants
- Use discriminated unions for loading/error/success states where useful.
- Avoid boolean combinations that allow invalid states.
- Type errors and result objects consistently.

## Generics
- Use generics when they preserve real relationships between inputs/outputs.
- Avoid generic abstractions that obscure domain meaning.

## Public Contracts
- Explicitly type exported functions, hooks, services, and library APIs.
- Keep shared type contracts stable and documented.
