# Forms and localization

This repository keeps the form domain and localization tooling in separate
packages. Their detailed APIs and configuration formats are maintained in
the [form](../packages/form/README.md) and
[localization](../packages/localization/README.md) package READMEs.

## Form domain

`@valfuse-node/form` defines framework-neutral schemas, built-in and custom
rules, value transformations, validation results, normalized field errors,
and form-related types. Applications can use it directly or through an
adapter. A typical flow is:

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

## Errors and network boundaries

Form errors are data returned by validation or supplied by the application.
Adapters expose methods such as `setErrors` so an application can map a
server response into field errors. Valfuse does not make HTTP requests or
define a server error protocol; the consuming application owns that mapping.
