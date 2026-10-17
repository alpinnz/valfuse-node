# @valfuse-node/form

Framework-agnostic form-state primitives and adapter contracts for React and
Vue. It does not contain the schema validation engine; that is available from
[`@valfuse-node/validation`](../validation/README.md).

```bash
npm install @valfuse-node/form @valfuse-node/validation
```

Use `@valfuse-node/react` or `@valfuse-node/vue` for framework integrations.
Those adapters use `@valfuse-node/form` for form state and
`@valfuse-node/validation` for schema rules and value transforms.

For React, install the adapter and its framework peers as well:

```bash
npm install @valfuse-node/react @valfuse-node/form @valfuse-node/validation react react-dom
```

```ts
import { createSchema } from "@valfuse-node/validation";
import { useValfuseForm } from "@valfuse-node/react";

const schema = createSchema({
  email: {
    type: "string",
    rules: [{ name: "email", error: { message: "Enter a valid email." } }],
  },
});

const form = useValfuseForm({
  schema,
  defaultValues: { email: "" },
  mode: "onBlur",
});
```

`@valfuse-node/form` still re-exports the validation API for compatibility.
Import new schema and validation code from `@valfuse-node/validation` to keep
form-state and validation responsibilities explicit.

See the [React adapter](../react/README.md) and [Vue adapter](../vue/README.md)
for complete integration examples.

## License

MIT
