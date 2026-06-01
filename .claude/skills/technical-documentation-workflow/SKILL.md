---
name: technical-documentation-workflow
description: Use this skill for focused technical documentation work including ADRs, architecture documentation, implementation notes, API handover, QA documentation, developer onboarding, release handover, folder structure documentation, and decision records. Use only when the request is primarily documentation-specific. For broad PRD-to-delivery work, use prd-to-delivery-workflow.
---

# Technical Documentation Workflow

## Purpose
Create clear, maintainable technical documentation that supports architecture consistency, onboarding, implementation handover, QA handoff, and long-term maintainability.

## Scope
Use for:
- ADR creation
- Architecture documentation
- Implementation notes
- API handover
- QA documentation
- Developer onboarding
- Release handover
- Folder structure and module boundary docs

## Documentation Rules
Document when changes affect:
- Folder structure
- Module boundary
- Dependency direction
- API contract
- State management
- Data flow
- Security behavior
- Testing strategy
- Build/environment
- Developer onboarding

Create ADR when a decision:
- Introduces a new pattern
- Changes architecture rules
- Affects multiple modules
- Affects security/data contracts
- Creates long-term tradeoffs
- Requires migration

## Required Output

```markdown
# Technical Documentation Package

## 1. Documentation Purpose

## 2. Audience

## 3. Architecture / Implementation Summary

## 4. Key Decisions

## 5. How It Works

## 6. Files / Modules Affected

## 7. Testing and QA Notes

## 8. Operational / Release Notes

## 9. ADRs Needed

## 10. Maintenance Notes
```

## Reference Files
- `references/adr-template.md`
- `references/technical-handover-template.md`
