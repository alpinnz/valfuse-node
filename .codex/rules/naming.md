# Naming

Naming is especially important. Names must communicate exact domain meaning
and responsibility.

## Avoid ambiguous naming

Discourage vague words such as:

- resolve, resolver
- process, processor
- handle
- execute, run
- manage, manager
- perform, do
- data, item, object, value, info, result
- temp, tmp
- misc, general, common
- utils, helper

unless their exact domain meaning is already unambiguous.

## Special rule: `resolve`

Do not use `resolveX` when the actual operation has a more precise name.

Avoid:

- resolveUser
- resolveData
- resolveValue
- resolveStatus

Prefer precise verbs: find, fetch, load, derive, select, calculate,
normalize, validate, map, convert, merge, create, update, delete, publish,
parse, format, build, determine.

Examples:

- resolveUser → findUserByEmail
- resolveData → fetchCustomerProfile
- resolveStatus → deriveAccountStatus
- processOrder → calculateOrderTotal
- handleValue → validatePaymentAmount

## Boolean names

Read naturally as predicates: isActive, hasPermission, canSubmit,
shouldRetry, wasImported, requiresApproval.

## Collections

Use plural, domain-specific names.

## Functions

Use `verb + domain object`. Do not hide multiple responsibilities behind
vague names.

## Checking naming

When a name is vague, ask:

1. What domain noun is this really about?
2. What single verb is the operation?
3. Does the name read precisely without context?

If not, rename it.