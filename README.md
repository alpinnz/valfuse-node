# valfuse-node

Generic form validation library for Node.js-based frontend ecosystems.

> **Config-first schema validation. Native React adapter. No Zod. No react-hook-form. No localization. No UI dependency.**

---

## Packages

| Package | Version | Description |
|---|---|---|
| [`@valfuse-node/core`](./packages/core/README.md) | `0.0.1` | Native schema validation engine |
| [`@valfuse-node/adapter-react`](./packages/adapter-react/README.md) | `0.0.4` | Native React form adapter |
| [`@valfuse-node/adapter-react-example`](./packages/adapter-react-example/README.md) | — | Reference implementation (private) |

---

## Why valfuse-node?

- **Config-first** — validation rules are plain objects, easy to read and maintain
- **No Zod dependency** — familiar Zod-like rule naming, fully native implementation
- **Zero form library dependency** — `useValfuseForm` is built on React's own primitives (`useState`, `useRef`, `useCallback`)
- **Unified error model** — schema validation, manual, and server errors all flow through `form.formState.errors`
- **No UI coupling** — bring your own components; works with any input style
- **No localization dependency** — error messages live in your schema definition

---

## Installation

```bash
# Core validation only
npm install @valfuse-node/core

# React adapter
npm install @valfuse-node/adapter-react @valfuse-node/core
```

---

## Quick Example

```tsx
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "@valfuse-node/adapter-react";

const loginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email wajib diisi", code: "email.required" } },
      { name: "email", error: { message: "Format email tidak valid", code: "email.invalid" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Password wajib diisi", code: "password.required" } },
      { name: "min", value: 8, error: { message: "Minimal 8 karakter", code: "password.min" } },
    ],
  },
});

export function LoginForm() {
  const form = useValfuseForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await loginApi(values);
    } catch (err) {
      // Inject server errors directly into form state
      form.setErrors({
        email: { message: "Email tidak ditemukan", type: "server", code: "auth.email.not_found" },
      });
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("email")} />
      <p>{form.formState.errors.email?.message}</p>

      <input type="password" {...form.register("password")} />
      <p>{form.formState.errors.password?.message}</p>

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Architecture

```
domain/application:   @valfuse-node/core
presentation adapter: @valfuse-node/adapter-react
presentation example: @valfuse-node/adapter-react-example
```

Dependency direction:

```
adapter-react-example → adapter-react → core
```

`core` has zero dependency on React or any UI framework.  
`adapter-react` has zero dependency on external form libraries.

---

## Development

```bash
npm install       # install all workspace dependencies
npm run build     # build all packages
npm run test      # run all tests
npm run typecheck # TypeScript check all packages
npm run lint      # lint all packages
npm run dev       # start the example playground
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines.

---

## License

MIT — see [LICENSE](./LICENSE)
