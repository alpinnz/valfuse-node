# Architecture decisions

Decision records explain choices with long-term effects on package boundaries
or public APIs. New records should use the [template](./0000-template.md) and
receive the next available number.

| Record                                                                      | Status     | Decision                                                                                   |
| --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| [0001 — Core umbrella facade](./0001-core-umbrella-facade.md)               | Accepted   | `core` re-exports the public APIs of the form, localization, React, and Vue packages       |
| [0002 — Shared utilities extraction](./0002-shared-utilities-extraction.md) | Superseded | The earlier proposal to make `core` a shared utility package was replaced by decision 0001 |
