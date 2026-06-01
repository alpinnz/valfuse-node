---
name: qa-engineering-workflow
description: Use this skill for focused quality assurance and testing work including test strategy, test case generation, unit/integration/component/E2E scope, regression planning, negative cases, risk-based testing, security/permission testing, quality gates, and release readiness. Use only when the request is primarily QA/testing-specific. For broad PRD-to-delivery work, use prd-to-delivery-workflow.
---

# QA Engineering Workflow

## Purpose
Convert requirements, architecture plans, or implementation details into a risk-based test strategy and executable test cases.

## Scope
Use for:
- QA strategy
- Test case generation
- Unit test scope
- Integration test scope
- Component test scope
- E2E test scope
- Regression testing
- Negative cases
- Permission/security test cases
- Quality gates
- Release readiness

## Testing Mapping
- Domain/business rule -> unit test
- Use case/application flow -> unit or integration test
- Repository/API integration -> integration/contract test
- UI behavior -> component test
- Critical user journey -> E2E test
- Security-sensitive flow -> negative and permission tests
- Risky existing behavior -> regression test

## Required Output

```markdown
# QA Engineering Plan

## 1. Requirement / Feature Summary

## 2. Risk-Based Test Strategy

## 3. Test Coverage Matrix
| Area | Unit | Integration | Component | E2E | Regression | Notes |
|---|---|---|---|---|---|---|

## 4. Test Cases
| ID | Scenario | Precondition | Steps | Expected Result | Type | Priority |
|---|---|---|---|---|---|---|

## 5. Negative / Edge Cases

## 6. Permission / Security Cases

## 7. Quality Gate

## 8. Release Readiness Notes
```

## Reference Files
- `references/qa-checklist.md`
- `references/test-case-template.md`
