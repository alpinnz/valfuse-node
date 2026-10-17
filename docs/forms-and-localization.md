# Forms and localization

This repository keeps form state, schema validation, and localization tooling
in separate packages. Their detailed APIs and configuration formats are
maintained in the [form](../packages/form/README.md),
[validation](../packages/validation/README.md), and
[localization](../packages/localization/README.md) package READMEs.

## Form state and validation

`@valfuse-node/validation` defines framework-neutral schemas, built-in and
custom rules, value transformations, and validation results. React and Vue
form adapters use `@valfuse-node/form` for UI state and the validation package
for field rules. Express uses the same validation engine at the API boundary.
A typical flow is:

1. Define a schema with `createSchema`.
2. Transform raw values when the schema specifies transformations.
3. Validate values with `validateSchema`.
4. Display the resulting field errors in the consuming UI.

Validation in a browser is useful for user feedback, but it does not replace
validation or authorization on a trusted server. See
[Security and data handling](./security-and-data-handling.md).

## Localization

`@valfuse-node/localization` provides a Node.js compiler and CLI for locale
files, validation of locale consistency, and a browser-safe runtime for
interpolation and message lookup. The compiler configuration belongs to the
consumer project. Generated locale assets are then loaded by that application
at build time or runtime according to its setup.

The React adapter provides `LocalizationProvider`, React hooks, and built-in
locale preference storage strategies. The Vue adapter provides
`LocalizationProvider`, `useLocalization()`, and `useLocalizationTree()` with
an optional app-provided storage adapter. Both use the browser-safe runtime
from `@valfuse-node/localization/runtime`.

The Express adapter consumes the generated runtime manifest in
`createLocalizationMiddleware()` and creates localization state per request.
The same locale sources can therefore serve browser and Express applications.

## Errors and network boundaries

Form errors are data returned by validation or supplied by the application.
Adapters expose methods such as `setErrors` so an application can map a
server response into field errors. Valfuse does not make HTTP requests or
define a server error protocol; the consuming application owns that mapping.
Express middleware validates request data with its API schema and the shared
validation engine. Authentication and authorization remain responsibilities
of the server app.
