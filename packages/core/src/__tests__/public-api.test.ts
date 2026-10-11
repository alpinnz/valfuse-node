import { describe, it, expect } from "vitest";
import {
  createSchema,
  validateSchema,
  useReactValfuseForm,
  useVueValfuseForm,
  ValfuseController,
  VueLocalizationProvider,
  VueValfuseController,
  useVueValfuseController,
  vueLocalStorageStrategy,
  vueSessionStorageStrategy,
  vueCookieStrategy,
  vueMemoryStrategy,
  composeVueStorage,
  provideVueLocalization,
  useVueLocalization,
  useVueLocalizationTree,
} from "..";
import {
  createLocalizationMiddleware,
  validateBody,
  validateParams,
  validateQuery,
  validateHeaders,
  validateCookies,
  validateFile,
  validateFiles,
} from "../express";

describe("@valfuse-node/core form API", () => {
  it("re-exports the framework-agnostic schema helpers", () => {
    expect(typeof createSchema).toBe("function");
    expect(typeof validateSchema).toBe("function");
  });

  it("validates a required + format schema through the umbrella entry", () => {
    const schema = createSchema({
      email: {
        type: "string",
        rules: [
          { name: "required", error: { message: "required", code: "email.required" } },
          { name: "email", error: { message: "invalid", code: "email.format" } },
        ],
      },
    });

    expect(validateSchema(schema, { email: "" })).toEqual({
      email: { message: "required", code: "email.required" },
    });
    expect(validateSchema(schema, { email: "nope" })).toEqual({
      email: { message: "invalid", code: "email.format" },
    });
    expect(validateSchema(schema, { email: "user@example.com" })).toEqual({});
  });
});

describe("core umbrella adapter re-exports", () => {
  it("renames the form hook per adapter to avoid collisions", () => {
    expect(typeof useReactValfuseForm).toBe("function");
    expect(typeof useVueValfuseForm).toBe("function");
    expect(useReactValfuseForm).not.toBe(useVueValfuseForm);
  });

  it("keeps the react controller and localization primitives available", () => {
    expect(ValfuseController).toBeDefined();
  });

  it("exposes Vue localization APIs with framework-prefixed names", () => {
    expect(VueLocalizationProvider).toBeDefined();
    expect(typeof provideVueLocalization).toBe("function");
    expect(typeof useVueLocalization).toBe("function");
    expect(typeof useVueLocalizationTree).toBe("function");
    expect(VueValfuseController).toBeDefined();
    expect(typeof useVueValfuseController).toBe("function");
    expect(typeof vueLocalStorageStrategy).toBe("function");
    expect(typeof vueSessionStorageStrategy).toBe("function");
    expect(typeof vueCookieStrategy).toBe("function");
    expect(typeof vueMemoryStrategy).toBe("function");
    expect(typeof composeVueStorage).toBe("function");
  });

  it("keeps Express middleware behind the dedicated facade", () => {
    expect(typeof createLocalizationMiddleware).toBe("function");
    expect(typeof validateBody).toBe("function");
    expect(typeof validateParams).toBe("function");
    expect(typeof validateQuery).toBe("function");
    expect(typeof validateHeaders).toBe("function");
    expect(typeof validateCookies).toBe("function");
    expect(typeof validateFile).toBe("function");
    expect(typeof validateFiles).toBe("function");
  });
});
