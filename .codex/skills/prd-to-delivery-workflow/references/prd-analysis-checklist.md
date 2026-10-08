# PRD Analysis Checklist

Use this checklist before creating delivery tasks.

## Product Understanding
- What user problem is being solved?
- Who are the primary actors?
- What is the expected behavior?
- What is explicitly out of scope?
- What acceptance criteria are stated?
- What assumptions are unstated?

## Technical Scope
- Which platforms are affected?
- Which modules are affected?
- Which existing flows are impacted?
- Does this require new API, model, state, permission, or documentation?

## Architecture Risk
- Does this change module boundaries?
- Does this introduce new dependencies?
- Does this affect domain logic?
- Does this affect security or sensitive data?
- Does this require migration or backward compatibility?

## Delivery Readiness
- Can frontend start independently?
- Can backend start independently?
- Are API contracts clear?
- Are test cases derivable?
- Is documentation needed?
