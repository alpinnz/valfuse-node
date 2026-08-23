import { describe, it, expect } from "vitest";
import {
  createSchema,
  validateSchema,
  useReactValfuseForm,
  useVueValfuseForm,
  ValfuseController,
} from "..";

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
});
