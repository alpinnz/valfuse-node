# ADR-0002: Shared utilities extraction

- Status: Superseded
- Date: 2026-06-01
- Superseded by: [ADR-0001](./0001-core-umbrella-facade.md), 2026-06-04

## Context

An earlier proposal considered putting utilities shared by `form` and
`localization` in `core`. At that time, no concrete shared utility had been
identified.

## Earlier proposal

Audit for proven shared behavior before extracting it, and avoid moving code
into `core` solely to remove superficial duplication.

## Why it was superseded

ADR-0001 made `core` the umbrella package that depends on and re-exports
`localization`. Making `localization` depend on `core` for utilities would
create a dependency cycle. `core` therefore remains a facade rather than a
shared domain package. No shared utility extraction was implemented by this
proposal.
