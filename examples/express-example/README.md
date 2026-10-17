# @valfuse-node/example-express

Reference app for using Valfuse with Express. It demonstrates validation and
transforms for request bodies, route params, and query values, request-scoped
localization, generated asset paths, and a generated route barrel.

## Run

Build the workspace packages once from the repository root, then start the
example:

```bash
npm install
npm run build
npm run dev:express
```

The server listens on `http://localhost:3000` by default. Set `PORT` to use a
different port.

## Try the routes

Check request localization using the `Accept-Language` header:

```bash
curl -H "Accept-Language: id" http://localhost:3000/health
```

Route params and query values are transformed and validated into typed
`response.locals` values:

```bash
curl http://localhost:3000/users/example-id
curl "http://localhost:3000/users?limit=10"
```

The example has no persistence layer; these routes echo the validated input.

Create a user. The middleware trims the name, trims and lowercases the email,
and returns HTTP 400 with field errors when validation fails:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Accept-Language: id" \
  -d '{"name":" Ada Lovelace ","email":" ADA@example.com "}'
```

The generated asset registry uses `/assets` as its base path, matching the
Express static mount. For example, `/` returns the generated logo URL and the
file is served from `/assets/brand/valfuse.svg`.

## Workspace commands

Run these commands from the example directory, after building the root
workspace packages:

```bash
npm run generate          # assets, route barrel, and localization
npm run generate:check    # verify generated assets, barrel, and locale sources
npm run typecheck
npm run build
```

`valfuse.yaml` configures the same framework-neutral assets and barrel
generators used by the React and Vue examples, plus the Express localization
runtime manifest.

The `barrel:generate` and `barrel:check` scripts call the built workspace CLI
from `@valfuse-node/barrel`. Build the workspace packages from the repository
root before running an example from a clean checkout. Regenerate route exports
through those scripts rather than editing the generated file by hand. With
`recursive: true`, each route subdirectory containing `.ts` or `.tsx` modules
also receives its own `index.ts`.
