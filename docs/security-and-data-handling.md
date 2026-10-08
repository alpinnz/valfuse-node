# Security and data handling

Valfuse is a form and localization library. It does not authenticate users,
authorize operations, send application requests, or persist form submissions.
The consuming application remains responsible for those boundaries.

## Validation and errors

- Treat browser validation as user feedback, not as a security boundary.
  Validate and authorize submitted values again in the trusted server or
  service that owns the operation.
- `setErrors` accepts errors supplied by the application. Validate and
  normalize external response data before mapping it into the form API.
- Do not put secrets or sensitive personal information in error messages,
  logs, or user-visible localization strings.

## Localization data and browser storage

- Locale files and generated browser assets are available to application
  users. Keep secrets and private records out of those files.
- React locale storage strategies persist the selected locale. Do not use
  them to store credentials or submitted form values.
- Choose the storage strategy and cookie attributes according to the host
  application's security requirements.

For vulnerability reporting, follow the repository's
[Security Policy](../SECURITY.md).
