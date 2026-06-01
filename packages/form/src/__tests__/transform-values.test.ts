import { describe, it, expect } from "vitest";
import { transformValues } from "../transformation/transform-values";
import { t } from "../shared/transformers";
import type { ValfuseSchema } from "../types";

describe("transformValues", () => {
  const schema: ValfuseSchema = {
    email: {
      type: "string",
      transform: t.pipe(t.trim, t.toLowerCase),
      rules: [],
    },
    age: {
      type: "number",
      transform: t.toNumber,
      rules: [],
    },
    name: {
      type: "string",
      // no transform
      rules: [],
    },
  };

  it("applies transform to matching fields", () => {
    const result = transformValues(schema, {
      email: "  HELLO@EMAIL.COM  ",
      age: "25",
      name: "  Alice  ",
    });
    expect(result.email).toBe("hello@email.com");
    expect(result.age).toBe(25);
  });

  it("leaves fields without transform unchanged", () => {
    const result = transformValues(schema, {
      email: "test@test.com",
      age: "30",
      name: "  Alice  ",
    });
    expect(result.name).toBe("  Alice  "); // no transform defined
  });

  it("does not mutate the original values object", () => {
    const input = { email: "  HI@TEST.COM  ", age: "5", name: "Bob" };
    transformValues(schema, input);
    expect(input.email).toBe("  HI@TEST.COM  ");
  });

  it("ignores fields in schema that are not in values", () => {
    const result = transformValues(schema, { name: "Bob" });
    expect(result).toEqual({ name: "Bob" });
  });

  it("ignores fields in values that are not in schema", () => {
    const result = transformValues(schema, {
      email: "  TEST@TEST.COM  ",
      unknown: "extra",
    });
    expect(result.unknown).toBe("extra");
    expect(result.email).toBe("test@test.com");
  });

  it("returns all values even when schema is empty", () => {
    const result = transformValues({}, { email: "test@test.com" });
    expect(result).toEqual({ email: "test@test.com" });
  });
});

