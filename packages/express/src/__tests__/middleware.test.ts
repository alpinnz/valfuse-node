import type { NextFunction, Request, RequestHandler, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { createSchema, t } from "@valfuse-node/validation";
import type { RuntimeManifest } from "@valfuse-node/localization";
import {
  createLocalizationMiddleware,
  validateBody,
  validateCookies,
  validateFile,
  validateFiles,
  validateHeaders,
  validateParams,
  validateQuery,
} from "../index";

function createRequest(values: Partial<Request> & Record<string, unknown> = {}): Request {
  return {
    body: {},
    params: {},
    query: {},
    get: () => undefined,
    acceptsLanguages: () => false,
    ...values,
  } as unknown as Request;
}

function createResponse(): Response {
  const response = {
    locals: {},
    status: vi.fn(function (this: unknown) {
      return this;
    }),
    json: vi.fn(),
  };
  return response as unknown as Response;
}

function invoke(handler: unknown, req: Request) {
  const res = createResponse();
  const next = vi.fn() as unknown as NextFunction;
  (handler as RequestHandler)(req, res, next);
  return { res, next };
}

describe("Express request validation middleware", () => {
  it("transforms and picks only schema fields from a body", () => {
    const schema = createSchema({
      email: {
        type: "string",
        transform: t.pipe(t.trim, t.toLowerCase),
        rules: [{ name: "required", error: { message: "Email is required" } }],
      },
    });
    const { res, next } = invoke(
      validateBody<{ email: string }>(schema),
      createRequest({ body: { email: "  ADA@EXAMPLE.COM ", isAdmin: true } })
    );

    expect(res.locals.validatedBody).toEqual({ email: "ada@example.com" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns a client error for malformed or invalid input", () => {
    const schema = createSchema({
      limit: {
        type: "number",
        transform: t.toInteger,
        rules: [{ name: "min", value: 1, error: { message: "Limit must be positive" } }],
      },
    });
    const { res, next } = invoke(
      validateQuery<{ limit: number }>(schema),
      createRequest({ query: { limit: "0" } })
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errors: { limit: expect.any(Object) } });
    expect(next).not.toHaveBeenCalled();

    const malformed = invoke(validateParams(schema), createRequest({ params: [] as never }));
    expect(malformed.res.status).toHaveBeenCalledWith(400);
    expect(malformed.next).not.toHaveBeenCalled();
  });

  it("validates route params and stores only the declared keys", () => {
    const schema = createSchema({
      userId: {
        type: "string",
        rules: [{ name: "required", error: { message: "ID is required" } }],
      },
    });
    const { res, next } = invoke(
      validateParams<{ userId: string }>(schema),
      createRequest({ params: { userId: "u-1", extra: "discard" } as never })
    );

    expect(res.locals.validatedParams).toEqual({ userId: "u-1" });
    expect(next).toHaveBeenCalledOnce();
  });

  it("validates lowercase headers and parsed cookies into typed locals", () => {
    const headerSchema = createSchema({
      "x-account-id": {
        type: "string",
        rules: [{ name: "required", error: { message: "Account header is required" } }],
      },
    });
    const cookieSchema = createSchema({
      session: {
        type: "string",
        rules: [{ name: "required", error: { message: "Session cookie is required" } }],
      },
    });
    const headers = invoke(
      validateHeaders<{ "x-account-id": string }>(headerSchema),
      createRequest({ headers: { "x-account-id": "acct-1" } as never })
    );
    const cookies = invoke(
      validateCookies<{ session: string }>(cookieSchema),
      createRequest({ cookies: { session: "s-1" } as never })
    );

    expect(headers.res.locals.validatedHeaders).toEqual({ "x-account-id": "acct-1" });
    expect(headers.next).toHaveBeenCalledOnce();
    expect(cookies.res.locals.validatedCookies).toEqual({ session: "s-1" });
    expect(cookies.next).toHaveBeenCalledOnce();
  });

  it("reports cookie parser setup errors and validates parsed upload metadata", () => {
    const cookieSetup = invoke(validateCookies(createSchema({})), createRequest());
    expect(cookieSetup.next).toHaveBeenCalledWith(expect.any(Error));

    const fileSchema = createSchema({
      originalname: { type: "string", rules: [] },
      size: { type: "number", transform: t.toInteger, rules: [] },
    });
    const file = invoke(
      validateFile<{ originalname: string; size: number }>(fileSchema),
      createRequest({
        file: { originalname: "report.csv", size: "12", path: "/private/tmp" } as never,
      })
    );
    const files = invoke(
      validateFiles<{ originalname: string; size: number }>(fileSchema),
      createRequest({
        files: [
          { originalname: "a.csv", size: 3 },
          { originalname: "b.csv", size: 5 },
        ] as never,
      })
    );
    const groupedFiles = invoke(
      validateFiles<{ originalname: string; size: number }>(fileSchema),
      createRequest({ files: { photos: [{ originalname: "photo.png", size: 7 }] } as never })
    );

    expect(file.res.locals.validatedFile).toEqual({ originalname: "report.csv", size: 12 });
    expect(files.res.locals.validatedFiles).toEqual([
      { originalname: "a.csv", size: 3 },
      { originalname: "b.csv", size: 5 },
    ]);
    expect(groupedFiles.res.locals.validatedFiles).toEqual({
      photos: [{ originalname: "photo.png", size: 7 }],
    });
    expect(file.next).toHaveBeenCalledOnce();
    expect(files.next).toHaveBeenCalledOnce();
    expect(groupedFiles.next).toHaveBeenCalledOnce();
  });
});

describe("Express localization middleware", () => {
  it("selects a supported Accept-Language and exposes a request-scoped localizer", () => {
    const manifest: RuntimeManifest = {
      base_locale: "en",
      fallback_locale: "en",
      locales: ["en", "id"],
      entries: [{ key: "common.greeting", placeholders: ["name"] }],
      messages: {
        en: { "common.greeting": "Hello, {name}!" },
        id: { "common.greeting": "Halo, {name}!" },
      },
    };
    const { res, next } = invoke(
      createLocalizationMiddleware(manifest),
      createRequest({
        get: (() => "id") as unknown as Request["get"],
        acceptsLanguages: (() => "id") as Request["acceptsLanguages"],
      })
    );

    expect(res.locals.localization.locale).toBe("id");
    expect(res.locals.localization.format("common.greeting", { name: "Ada" })).toBe("Halo, Ada!");
    expect(next).toHaveBeenCalledOnce();
  });

  it("reads locale from request-aware storage and persists supported changes", () => {
    const manifest: RuntimeManifest = {
      base_locale: "en",
      fallback_locale: "en",
      locales: ["en", "id"],
      entries: [{ key: "common.greeting", placeholders: [] }],
      messages: {
        en: { "common.greeting": "Hello!" },
        id: { "common.greeting": "Halo!" },
      },
    };
    const storage = {
      get: vi.fn(() => "id"),
      set: vi.fn(),
    };
    const { res, next } = invoke(
      createLocalizationMiddleware(manifest, { storage }),
      createRequest({ acceptsLanguages: (() => "en") as Request["acceptsLanguages"] })
    );
    const localizer = res.locals.localization;

    expect(localizer.locale).toBe("id");
    expect(localizer.translate("common.greeting")).toBe("Halo!");
    expect(localizer.setLocale("en")).toBe(true);
    expect(localizer.locale).toBe("en");
    expect(localizer.translate("common.greeting")).toBe("Hello!");
    expect(storage.set).toHaveBeenCalledWith(expect.anything(), res, "en");
    expect(localizer.setLocale("fr")).toBe(false);
    expect(localizer.locale).toBe("en");
    expect(storage.set).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledOnce();
  });
});
