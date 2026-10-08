# Architecture Quality Guardrail — Parallel Workflow

Use this prompt as the default architecture quality guardrail for existing projects.

This prompt must enforce:

* Clean Architecture
* Maintainability
* Scalability
* Reusability
* Clean Code
* SOLID principles
* Testability
* Low technical debt
* Consistency with healthy existing conventions
* Parallel fan-out / fan-in architecture workflow

---

## Architecture Direction (Corrected)

This project uses the following package architecture:

```
packages/
  core/           ← Orchestration layer
                    - Coordinates between form and localization
                    - Holds shared utilities used by form AND localization
                    - NO schema, validateSchema, or rules (those belong in form)

  form/           ← Form domain (NEW)
                    - schema/ (createSchema)
                    - validation/ (validateSchema)
                    - transformation/ (transformValues)
                    - rules/ (string, number, boolean, array, object, generic rule files)
                    - errors/ (normalizeError)
                    - shared/ (transformers)
                    - types/ (UseValfuseFormProps, UseValfuseFormReturn as interface)
                    - state/ (values, errors, touched, dirty, submitting)
                    - methods/ (register, handleSubmit, setErrors, clearErrors, setValue, trigger, watch, reset, control)

  react/          ← React Adapter
                    - depends on: form, localization
                    - hooks/ (useValfuseForm - thin wrapper)
                    - components/ (ValfuseController)
                    - helpers/ (React-specific only)

  vue/            ← Vue Adapter
                    - depends on: form
                    - composables/ (useValfuseForm - thin wrapper)

  localization/   ← CLI + browser runtime
                    - depends on: core (shared utilities)
                    - cli/, compiler/, config/, emitter/, loader/, normalizer/, parser/, runtime/, types/, validator/, watch/
```

Dependency direction:
```
react ──→ form ──→ [schema, rules, validation, transformation]
vue   ──→ form
localization ──→ core (shared utilities)
```

Core is orchestration only — it coordinates between packages but contains no business rules itself. Schema, validation, rules, and transformation belong in `form/` because they are form-domain concerns. `core/` only holds shared utilities that both `form` and `localization` depend on.

---

## Primary Instruction

Use the `architecture-orchestrator` agent.

This is an existing project unless explicitly stated otherwise.

Before implementation, run a **parallel fan-out / fan-in architecture quality workflow**.

Do not implement code yet.
Do not modify files yet.
Do not install dependencies yet.

First analyze. Then review. Then compose tasks. Implementation only happens after explicit approval.

**All workflow outputs must be written to files** in the `docs/arch001001/` directory per the naming convention below.

---

## Main Objective

Analyze the existing project and produce a complete architecture quality plan that improves or preserves:

* Clean Architecture
* Maintainability
* Scalability
* Reusability
* Clean Code
* SOLID
* Testability
* Low technical debt
* Healthy project conventions

Do not blindly follow existing patterns.

If an existing pattern is healthy, preserve it.
If an existing pattern is harmful, mark it as technical debt and propose a safe incremental improvement.

---

# Parallel Execution Model

## Phase 0 — Intake

Understand the requested requirement, PRD, feature, refactor, or architecture goal.

Identify:

* Business objective
* Affected platforms
* Affected modules
* Affected layers
* Expected output
* Known constraints
* Risk level
* Relevant technology stack

If no PRD is provided, infer scope from the current request and actual codebase evidence.

---

## Phase 1 — Sequential Baseline

Run these agents first because every specialist agent depends on their shared context:

1. `requirement-context-analyst`
2. `existing-codebase-analyst`

The baseline agents must inspect actual project files before making recommendations.

They must produce:

* Existing architecture evidence
* Current folder/module structure
* Existing conventions
* Healthy patterns
* Problematic patterns
* Technical debt
* Risk areas
* Shared context for specialist agents

**Write combined report to `docs/arch001001/001-001-001-report-v1.md`**

---

## Phase 2 — Parallel Specialist Fan-Out

After Phase 1 is complete, run these specialist agents independently and concurrently using the same baseline context:

* `domain-modeling`
* `layer-architecture`
* `frontend-architecture`
* `backend-architecture`
* `data-integration-architecture`
* `security-architecture`
* `devops-environment-architecture`
* `testing-architecture`
* `documentation-architecture`

Each specialist agent must work within its own scope.

Do not run specialist agents sequentially unless there is a direct dependency.

**Write combined specialist report to `docs/arch001001/001-002-001-report-v1.md`**

Each specialist section in the report must follow this output contract:

```text
## [Specialist Name]

### Scope Analyzed
- Scope:
- Included:
- Excluded:

### Files / Evidence Inspected
- Path:
- Evidence:
- Relevance:

### Current Pattern
- Existing convention:
- Healthy pattern:
- Problematic pattern:

### Clean Architecture Assessment
- Dependency direction:
- Layer responsibility:
- Boundary violations:
- Domain purity:
- Infrastructure leakage:

### Maintainability Assessment
- Coupling:
- Cohesion:
- Complexity:
- Naming:
- Change impact:

### Scalability Assessment
- Module growth risk:
- Data flow growth risk:
- Platform growth risk:
- Performance concern:

### Reusability Assessment
- Reusable candidates:
- Feature-local logic:
- Premature abstraction risk:
- Duplication risk:

### SOLID Assessment
- SRP:
- OCP:
- LSP:
- ISP:
- DIP:

### Technical Debt
- Debt:
- Impact:
- Severity:
- Suggested improvement:

### Recommendation
- Must fix:
- Should fix:
- Optional improvement:

### Testing Impact
- Unit:
- Integration:
- Component:
- E2E:
- Regression:

### Documentation Impact
- ADR needed:
- Docs update needed:
- Handover needed:
```

---

## Phase 3 — Fan-In Architecture Review

After every specialist agent returns its output, send all specialist outputs to:

* `architecture-review`

**Write consolidated review to `docs/arch001001/001-003-001-review-v1.md`**

The `architecture-review` agent must consolidate all findings.

It must:

* Merge duplicate findings
* Detect conflicting recommendations
* Resolve conflicts
* Prioritize improvements
* Identify clean architecture violations
* Identify SOLID violations
* Identify maintainability risks
* Identify scalability risks
* Identify reusability opportunities
* Identify testing gaps
* Identify documentation gaps
* Separate must-fix, should-fix, and optional improvements

Conflict resolution priority:

```text
1. Product correctness
2. Clean Architecture dependency direction
3. Security and data safety
4. Maintainability
5. SOLID
6. Testability
7. Scalability
8. Reusability
9. Healthy existing convention
10. Minimal migration risk
```

---

## Phase 4 — Task Composition

After `architecture-review` is complete, send the reviewed recommendation to:

* `task-composer`

**Write tasks to `docs/arch001001/001-004-001-task-v1.md`**

Tasks must be grouped by:
- Frontend
- Backend
- QA
- DevOps
- Documentation
- Refactor / Architecture
- Security
- Data / Integration

Each task must include:

```text
### [Task ID]
**Title:**
**Role:**
**Layer:**
**Module:**
**Description:**
**Dependency:**
**Acceptance Criteria:**
**Testing Requirement:**
**Documentation Requirement:**
**Risk Level:**
**Priority:**
**Estimated Complexity:**
```

Tasks must preserve dependency order.

Do not create implementation tasks before unresolved architecture conflicts are handled.

---

## Phase 5 — Implementation Readiness

Use:

* `architecture-implementation`

**Write implementation readiness to `docs/arch001001/001-005-001-impl-v1.md`**

Only to produce an implementation readiness plan.

Do not modify files unless explicitly instructed later.

The implementation readiness plan must include:

* Safe implementation sequence
* Files likely affected
* Dependency rule check
* SOLID check
* Test plan
* Rollback plan
* Migration notes
* Quality gates

---

# Skill Usage Policy

Use the top-level skill when the request starts from PRD, feature requirement, or broad delivery planning:

* `prd-to-delivery-workflow`

Use domain skills only when relevant:

* `architecture-workflow`
* `frontend-engineering-workflow`
* `backend-engineering-workflow`
* `qa-engineering-workflow`
* `technical-documentation-workflow`

Use technology-specific skills only when the project stack requires them:

* `react-engineering-workflow`
* `nodejs-engineering-workflow`
* `golang-engineering-workflow`
* `typescript-engineering-workflow`

Do not use every skill blindly.

Use the most specific skill when the task is narrow.
Use `prd-to-delivery-workflow` when the task spans multiple roles, layers, or delivery phases.

---

# Architecture Quality Principles

## Clean Architecture

Respect dependency direction.

Expected direction:

```text
Presentation / UI
  → Application / Use Case
  → Domain

Infrastructure / Data
  → Application / Domain abstraction
```

Forbidden:

```text
Domain → UI framework
Domain → API client
Domain → database
Domain → storage
Domain → routing
Domain → environment config
Use case → concrete HTTP client when repository abstraction exists
UI component → raw API client when use case/hook/service abstraction exists
Infrastructure → presentation logic
Shared utility → feature-specific business rule
```

Business rules must not live inside UI components, screens, pages, controllers, raw API clients, or infrastructure code.

---

## Maintainability

Prefer code that is easy to understand, modify, test, and delete.

Check for:

* Clear module ownership
* Small files with focused responsibilities
* Explicit dependencies
* Minimal hidden side effects
* Predictable data flow
* Clear naming
* Stable boundaries
* Low coupling
* High cohesion

Avoid:

* God files
* Mixed responsibilities
* Circular dependencies
* Duplicate business logic
* Feature logic inside shared utilities
* Inconsistent patterns across similar modules
* Overly clever abstractions
* Implicit global behavior

---

## Scalability

Design for growth without premature complexity.

Scalability means:

* New features can be added without changing unrelated modules.
* Modules can grow independently.
* Shared logic is reusable but not over-generalized.
* Data flow remains understandable as features increase.
* Testing remains manageable.
* Platform-specific concerns remain isolated.

Avoid:

* Flat folders that become dumping grounds
* Global state for feature-local data
* Shared folders filled with unrelated feature logic
* One service handling too many domains
* One component handling too many variants
* Hardcoded environment assumptions
* Tight coupling between modules

---

## Reusability

Create reusable abstractions only when justified.

Good reusable code:

* Has a clear purpose
* Has stable input/output
* Is not coupled to one feature
* Is used by multiple real consumers or has a clear near-term reuse case
* Reduces duplication without hiding business meaning

Bad reusable code:

* Is created too early
* Accepts too many flags
* Has unclear ownership
* Mixes unrelated responsibilities
* Is harder to understand than duplicated simple code
* Forces all features into the same shape when they have different domain rules

Rule:

```text
Do not abstract after one use unless the architecture boundary itself requires it.
Prefer duplication over premature abstraction.
Prefer abstraction over repeated business logic.
```

---

## Clean Code

Apply clean code standards:

* Use clear names.
* Keep functions small and purposeful.
* Keep files focused.
* Avoid unnecessary comments for obvious code.
* Use comments only for intent, constraints, or non-obvious decisions.
* Avoid magic values.
* Avoid deep nesting.
* Avoid hidden mutations.
* Avoid ambiguous boolean flags.
* Avoid mixing query and command behavior.
* Avoid unnecessary indirection.
* Prefer explicit data transformation.
* Prefer simple, readable code over clever code.

Every function should answer:

```text
What does it do?
Why does it exist?
What does it depend on?
What does it return or change?
```

---

## SOLID Principles

Apply SOLID pragmatically.

### Single Responsibility Principle

Each module, class, hook, service, component, package, or function should have one clear reason to change.

### Open / Closed Principle

Prefer extension points over modifying stable core logic repeatedly. Do not create plugin-like abstractions unless real variability exists.

### Liskov Substitution Principle

Repository, adapter, or strategy implementations must honor the same contract.

### Interface Segregation Principle

Prefer small, role-specific interfaces or contracts.

### Dependency Inversion Principle

High-level policy must not depend on low-level details.

Use cases should depend on repository interfaces / contracts, not concrete HTTP clients, database clients, storage mechanisms, or framework-specific APIs.

---

# Existing Convention Policy

Follow existing project conventions when they are healthy.

A convention is healthy if it:

* Supports clear separation of concerns
* Is used consistently
* Is testable
* Does not create excessive coupling
* Does not leak infrastructure into domain
* Does not put business logic into UI
* Does not block scalability
* Is understandable by the team

If a convention is unhealthy:

1. Do not replicate it silently.
2. Mark it as technical debt.
3. Explain the risk.
4. Propose a minimal safe improvement.
5. Avoid big-bang migration unless explicitly requested.

---

# Testing Rules

Every architecture-impacting change must define test coverage.

Recommended mapping:

```text
Domain rule → unit test
Use case / application flow → unit test or integration test
Repository / API integration → integration test
UI component → component test
Critical user journey → E2E test
Security-sensitive flow → negative test + permission test
Regression-prone behavior → regression test
```

Testability is part of architecture.

If a design is hard to test, treat that as an architecture smell.

---

# Documentation Rules

Update or create documentation when the change affects:

* Folder structure
* Module boundary
* Dependency direction
* API contract
* State management
* Data flow
* Security behavior
* Testing strategy
* Build / environment
* Developer onboarding

Create ADR when the decision:

* Introduces a new pattern
* Changes an existing architecture rule
* Affects multiple modules
* Affects security or data contract
* Creates long-term tradeoffs
* Requires migration

ADR format:

```text
## 1. Informasi Umum
## 2. Context
## 3. Decision
## 4. Consequences
## 5. Alternatives considered
## 6. Migration notes
```

---

# Output File Naming Convention

All workflow outputs must be written to `docs/arch0101/` directory.

## Document Structure

Every document MUST start with `## 1. Informasi Umum` section containing a table:

```markdown
## 1. Informasi Umum

| Field | Value |
|-------|-------|
| **Nama Dokumen** | [document name] |
| **Nama Project** | valfuse-node |
| **Modul / Fitur** | [module or feature name] |
| **Dibuat oleh** | Alfin Noviaji |
| **Dibuat pada** | 2026-05-31 |
| **Diubah oleh** | Alfin Noviaji |
| **Diubah pada** | 2026-05-31 |
| **Direview oleh** | - |
| **Direview pada** | - |
| **Versi** | v1 |
| **Status** | draft |
```

No frontmatter. Git metadata in the Informasi Umum table only.

## Naming Format

```
docs/arch001001/{runner number}-{phase number}-{number}-{name}-v{version}
```

Example: `docs/arch001001/001-001-001-report-v1`

| Part | Meaning |
|------|---------|
| `001` | Runner number (workflow identifier) |
| `001` | Phase number (01-05) |
| `001` | Sequence number |
| `report` | Document type |
| `v1` | Version |

## Document Types

| Type | Description |
|------|-------------|
| `report` | Phase 1-2 output |
| `review` | Phase 3 fan-in review |
| `task` | Phase 4 task composition |
| `impl` | Phase 5 implementation readiness |

## Output Files

```
docs/arch001001/
  001-001-001-report-v1.md   ← Phase 1: Baseline
  001-002-001-report-v1.md   ← Phase 2: Specialist fan-out
  001-003-001-review-v1.md   ← Phase 3: Fan-in review
  001-004-001-task-v1.md     ← Phase 4: Task composition
  001-005-001-impl-v1.md     ← Phase 5: Implementation readiness
```

## Naming Rules

1. Output directory: `docs/arch001001/`
2. Use zero-padded three-digit numbers for runner and phase
3. Use lowercase kebab-case for name
4. Version starts at v1, increment on significant changes
5. Never overwrite — new versions get new numbers (v2, v3, etc.)

---

# Hard Rules

* Do not implement code in this run.
* Do not modify files in this run.
* Do not install dependencies in this run.
* Do not introduce new architecture patterns without evidence.
* Do not blindly copy bad existing patterns.
* Do not place business logic in UI, controllers, raw API clients, or infrastructure.
* Do not let domain depend on framework, database, storage, HTTP client, routing, or UI.
* Do not create shared abstractions without clear reuse.
* Do not skip testing strategy.
* Do not skip documentation impact.
* Do not produce final output until fan-in review is complete.