# Dependencies

Every dependency creates maintenance cost.

## Before adding

Evaluate whether the requirement can be handled by:

- existing project functionality
- standard library / platform capability
- already-installed dependencies
- a small local implementation

## Evaluate new dependencies for

- maintenance status
- release activity
- security history
- license
- transitive dependencies
- runtime cost
- bundle size
- API stability
- project compatibility

## Duplicate responsibilities

Avoid introducing multiple libraries for the same responsibility without a
concrete migration reason. Examples of duplication to avoid:

- multiple HTTP clients
- multiple state managers
- multiple date libraries
- multiple schema validators
- multiple UI libraries

Do not install or uninstall dependencies without a concrete requirement.