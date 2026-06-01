# Parallel Execution Model

Use this reference when a clean architecture request requires more than one specialist agent.

## Solved status checklist

A multi-agent architecture workflow is considered solved only when all items are true:

| Area | Required state |
|---|---|
| Agent files | Every role has one dedicated `.agent.md` file. |
| Filename convention | Files use ordered prefix and suffix: `arch0101-name.agent.md`. |
| Agent identity | YAML `name` remains semantic, e.g. `architecture-orchestrator`. |
| Skill support | `.claude/skills/architecture-workflow/SKILL.md` exists. |
| Sequential baseline | Requirement and codebase baseline happen before fan-out. |
| Parallel fan-out | Independent specialist agents can run from the same shared context. |
| Output contract | All specialists return facts, assumptions, recommendations, risks, and conflicts. |
| Fan-in review | `architecture-review` consolidates and validates all specialist outputs. |
| Conflict resolution | Conflicts are resolved with explicit priority rules. |
| Task conversion | `task-composer` converts reviewed decisions into implementation tasks. |
| Implementation gate | Source changes only happen when explicitly requested. |
| Documentation | README and AGENTS_INDEX explain the workflow and usage. |

## Default phases

### Phase 0 — Intake
Build one shared context packet.

### Phase 1 — Baseline
Run sequentially:
1. `requirement-context-analyst`
2. `existing-codebase-analyst` when repository access exists

### Phase 2 — Parallel specialist analysis
Run relevant specialists in parallel:
- `domain-modeling`
- `layer-architecture`
- `frontend-architecture`
- `backend-architecture`
- `data-integration-architecture`
- `security-architecture`
- `devops-environment-architecture`
- `testing-architecture`
- `documentation-architecture`

### Phase 3 — Fan-in review
Run `architecture-review` with all specialist outputs.

### Phase 4 — Task composition
Run `task-composer` after review.

### Phase 5 — Implementation
Run `architecture-implementation` only when the user explicitly asks for implementation.

## Specialist Output Contract

```md
# <Agent Name> Output
## Scope Covered
## Inputs Used
## Facts Observed
## Assumptions
## Recommendations
## Dependencies On Other Agents
## Conflicts / Open Questions
## Risks
## Acceptance Criteria
```

## Conflict priority
1. Repository evidence.
2. Clean architecture dependency direction.
3. Security and data correctness.
4. Incremental migration safety.
5. Team maintainability.
6. Delivery speed.
