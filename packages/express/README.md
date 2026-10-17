# @valfuse-node/express

> Express middleware for validating request bodies, route params, and query values, and localizing each request with Valfuse.

```bash
npm install @valfuse-node/express @valfuse-node/validation @valfuse-node/localization express
npm install --save-dev @types/express
```

The package supports Express 4.18 and later, including Express 5. Install
`@types/express` in TypeScript projects.

## Validate a request body

`validateBody` applies the schema's value transforms, validates the transformed
object, and stores valid values in `response.locals.validatedBody`. Invalid
input returns HTTP 400 with field errors. The request body is not mutated, and
fields not declared by the schema are omitted from the validated values. The
generic defaults to `Record<string, unknown>`; provide the expected body type
when route handlers need a narrower type.

```ts
import express from "express";
import type { Response } from "express";
import { createSchema, t } from "@valfuse-node/validation";
import { validateBody } from "@valfuse-node/express";
import type { ExpressBodyLocals } from "@valfuse-node/express";

const app = express();
app.use(express.json());

const createUserSchema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [{ name: "email", error: { message: "Enter a valid email." } }],
  },
});

type CreateUserBody = { email: string };

app.post(
  "/users",
  validateBody<CreateUserBody>(createUserSchema),
  (_request, response: Response<unknown, ExpressBodyLocals<CreateUserBody>>) => {
    response.status(201).json({ user: response.locals.validatedBody });
  }
);
```

Mount `express.json()` before `validateBody` so JSON request bodies are parsed
before validation.

## Validate route params and query values

Use `validateParams` and `validateQuery` for the other common route inputs.
Each middleware transforms and validates only fields declared by its schema,
then stores them in `response.locals.validatedParams` or
`response.locals.validatedQuery`. It leaves the Express request object
unchanged.

```ts
import type { Response } from "express";
import { createSchema, t } from "@valfuse-node/validation";
import { validateParams, validateQuery } from "@valfuse-node/express";
import type { ExpressParamsLocals, ExpressQueryLocals } from "@valfuse-node/express";

const userParamsSchema = createSchema({
  userId: {
    type: "string",
    rules: [{ name: "required", error: { message: "User ID is required." } }],
  },
});

const listUsersQuerySchema = createSchema({
  limit: {
    type: "number",
    transform: t.toInteger,
    rules: [
      { name: "required", error: { message: "Limit is required." } },
      { name: "min", value: 1, error: { message: "Limit must be positive." } },
    ],
  },
});

type UserParams = { userId: string };
type ListUsersQuery = { limit: number };

app.get(
  "/users/:userId",
  validateParams<UserParams>(userParamsSchema),
  (_request, response: Response<unknown, ExpressParamsLocals<UserParams>>) => {
    response.json({ userId: response.locals.validatedParams.userId });
  }
);

app.get(
  "/users",
  validateQuery<ListUsersQuery>(listUsersQuerySchema),
  (_request, response: Response<unknown, ExpressQueryLocals<ListUsersQuery>>) => {
    response.json({ limit: response.locals.validatedQuery.limit });
  }
);
```

For `/users?limit=25`, `validatedQuery.limit` is the transformed number `25`.
Validation errors use HTTP 400 and the same `{ errors }` response shape as
`validateBody`.

## Validate headers, cookies, and uploaded file metadata

`validateHeaders` reads Node's normalized lowercase header names and stores the
projected result in `response.locals.validatedHeaders`. Mount a cookie parser
before `validateCookies`; if `request.cookies` is missing, the middleware
forwards a setup error to Express error handling. Parsed cookies are available
in `response.locals.validatedCookies`.

`validateFile` and `validateFiles` validate metadata after an upload middleware
such as Multer has parsed it. They do not parse or store uploads. A single
upload is projected into `response.locals.validatedFile`; array and field-map
uploads are projected into `response.locals.validatedFiles`. Only schema keys
are copied, so fields such as temporary paths or buffers are omitted unless
explicitly declared.

```ts
import { validateCookies, validateFile, validateHeaders } from "@valfuse-node/express";

app.post(
  "/profile/photo",
  cookieParser(), // Application-provided parser; required before validateCookies.
  upload.single("photo"), // Application-provided upload parser.
  validateCookies<{ session: string }>(sessionSchema),
  validateHeaders<{ "content-type": string }>(contentTypeSchema),
  validateFile<{ originalname: string; mimetype: string; size: number }>(photoMetadataSchema),
  (request, response) => {
    response.json({
      session: response.locals.validatedCookies.session,
      contentType: response.locals.validatedHeaders["content-type"],
      photo: response.locals.validatedFile,
    });
  }
);
```

## Localize a request

`createLocalizationMiddleware` uses a generated `RuntimeManifest` and adds a
request-scoped localizer to `response.locals.localization`. By default it
selects a supported locale from `Accept-Language`, then falls back to the
manifest's base locale. Pass an `ExpressLocaleStorage` to read and persist a
locale through request-scoped application state such as a session or cookie.
The storage receives the current request and response, so it does not keep
mutable locale state shared between requests. Unsupported stored locales fall
back to the manifest's base locale. The existing `getLocale` callback remains
available for read-only/custom selection when the storage has no saved locale.

```ts
import express from "express";
import type { Request } from "express";
import manifest from "./assets/localizations/localization.manifest.json";
import { createLocalizationMiddleware, type ExpressLocaleStorage } from "@valfuse-node/express";

const app = express();
app.use(express.json());
app.use(sessionMiddleware); // Application-provided session middleware.

type SessionRequest = Request & { session: { locale?: string } };
const localeStorage: ExpressLocaleStorage = {
  get(request) {
    return (request as SessionRequest).session.locale;
  },
  set(request, _response, locale) {
    (request as SessionRequest).session.locale = locale;
  },
  remove(request) {
    delete (request as SessionRequest).session.locale;
  },
};

app.use(createLocalizationMiddleware(manifest, { storage: localeStorage }));

app.get("/health", (_request, response) => {
  response.json({ message: response.locals.localization.translate("common.ready") });
});

app.post("/locale", (request, response) => {
  const locale: unknown = request.body?.locale;
  if (typeof locale !== "string" || !manifest.locales.includes(locale)) {
    return response.status(400).json({ code: "UNSUPPORTED_LOCALE" });
  }

  response.locals.localization.setLocale(locale);
  return response.json({
    locale: response.locals.localization.locale,
    message: response.locals.localization.translate("common.ready"),
  });
});
```

Change the stored locale from an application route with
`response.locals.localization.setLocale(locale)`. It returns `false` for a
locale absent from the manifest and applies a supported locale to the current
response as well as the configured storage. Keep application-specific input
validation on the route that changes the preference.

The localizer also exposes `format`, `plural`, `gender`, `context`, and
`namespace` helpers. Its locale state is created per request, so concurrent
requests do not share mutable localization state.

## Share Valfuse configuration

The `@valfuse-node/validation` schema contract works independently of Express,
React, and Vue. Keep each form or API schema in a framework-neutral module and
pass it to the matching adapter when the input contract is the same.
The asset and barrel generators are framework-neutral too; configure
`base_path` to match the URL prefix mounted by `express.static`, and use the
barrel generator for server modules when it fits the project's layout.

The localization compiler accepts `framework: express` and emits the same
portable manifest format used by React, Vue, and Express applications.

## Core subpath

The middleware can also be imported through the core facade without loading
the React or Vue adapters:

```ts
import {
  validateBody,
  validateParams,
  validateQuery,
  validateHeaders,
  validateCookies,
  validateFile,
  validateFiles,
  createLocalizationMiddleware,
} from "@valfuse-node/core/express";
```

## License

MIT
