# Framework adapters and state

React and Vue adapters connect the form-state package and validation engine to
framework-native components. The Express adapter connects the validation
engine to request middleware. They do not add a router, persistence layer, or
application-wide state manager.

## Form state ownership

Each form instance owns its values, validation errors, touched and dirty
fields, and submission status. Consumers read derived state from the
adapter's `formState` and update fields through the form API. Keep one form
instance as the source of truth instead of mirroring its values in unrelated
component state.

## React

`@valfuse-node/react` provides `useValfuseForm`, `ValfuseController`, and a
React localization integration. Use `register` for compatible native inputs
and `ValfuseController` for controlled components. Localization state can be
shared through `LocalizationProvider` and its hooks.

Locale preference strategies include local storage, session storage, cookies,
memory, and composition. They store the selected locale preference. They are
not intended to store form submissions or credentials.

## Express

`@valfuse-node/express` provides middleware for validating request bodies,
params, query values, headers, and cookies with API schemas from the shared
validation engine. Its
localization middleware creates request-scoped locale state from the generated
runtime manifest. It does not add routing, authentication, or persistence.

## Vue

`@valfuse-node/vue` provides the `useValfuseForm` composable. Bind compatible
inputs with `v-bind="form.register('field')"`. For custom inputs, the current
adapter exposes value accessors such as `getValue` and `setValue`; it does not
currently provide a Vue equivalent of `ValfuseController`.

See the [React](../packages/react/README.md) and
[Vue](../packages/vue/README.md) READMEs for complete API contracts and
examples. For server middleware, see the
[Express README](../packages/express/README.md).
