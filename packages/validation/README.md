# @valfuse-node/validation

Framework-agnostic schema validation and value transformation for browser and
server applications. It has no React, Vue, Express, or other runtime framework
dependency.

```bash
npm install @valfuse-node/validation
```

## Define and validate a schema

```ts
import { createSchema, t, transformValues, validateSchema } from "@valfuse-node/validation";

const createUserSchema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Email is required." } },
      { name: "email", error: { message: "Enter a valid email." } },
    ],
  },
  age: {
    type: "number",
    transform: t.toInteger,
    rules: [{ name: "min", value: 18, error: { message: "Must be 18 or older." } }],
  },
});

const values = transformValues(createUserSchema, {
  email: "  ADA@EXAMPLE.COM ",
  age: "25",
});
const errors = validateSchema(createUserSchema, values);
// values: { email: "ada@example.com", age: 25 }
// errors: {}
```

`validateSchema` returns the first error for each invalid field. Its rules cover
strings, numbers, booleans, arrays, objects, and cross-field checks. `t` exports
built-in transforms such as `trim`, `toLowerCase`, `toInteger`, and `toNumber`.

## Use with forms or backend APIs

React and Vue adapters use this package for local field validation. Express
middleware uses it to validate parsed request data. Applications may define a
different schema for a form and an API request when their value shapes or rules
differ; both schemas can use the same validation engine.

```ts
import { createSchema } from "@valfuse-node/validation";
import { validateBody } from "@valfuse-node/express";

const createUserRequestSchema = createSchema({
  email: {
    type: "string",
    rules: [{ name: "required", error: { message: "Email is required." } }],
  },
});

app.post("/users", validateBody(createUserRequestSchema), createUserHandler);
```

Validation is synchronous and does not check database-backed rules such as
email uniqueness. Keep those checks in the backend service or domain layer.

## Compatibility

`@valfuse-node/form` continues to re-export the validation API for existing
consumers. New code should import schema, rule, transformer, and validation
APIs from this package.

## License

MIT
