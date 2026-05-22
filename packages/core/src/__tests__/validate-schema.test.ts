import { describe, expect, it } from "vitest";
import { createSchema } from "../create-schema";
import { validateSchema } from "../validate-schema";

describe("validateSchema", () => {
  // ─── String: required ──────────────────────────────────────────────────────

  it("should return required error when string value is empty", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          {
            name: "required",
            error: { message: "Name is required", code: "name.required" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "" });
    expect(errors.name?.message).toBe("Name is required");
    expect(errors.name?.code).toBe("name.required");
  });

  it("should return required error when string value is whitespace only", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          {
            name: "required",
            error: { message: "Name is required", code: "name.required" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "   " });
    expect(errors.name?.message).toBe("Name is required");
  });

  it("should not return error when string value is present", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Name is required" } },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "John" });
    expect(errors.name).toBeUndefined();
  });

  // ─── String: min ───────────────────────────────────────────────────────────

  it("should return min error when string length is below minimum", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          {
            name: "min",
            value: 3,
            error: { message: "Name must be at least 3 characters" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "Jo" });
    expect(errors.name?.message).toBe("Name must be at least 3 characters");
  });

  it("should not return min error when string length meets minimum", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          {
            name: "min",
            value: 3,
            error: { message: "Name must be at least 3 characters" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "John" });
    expect(errors.name).toBeUndefined();
  });

  // ─── String: max ───────────────────────────────────────────────────────────

  it("should return max error when string length exceeds maximum", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          {
            name: "max",
            value: 5,
            error: { message: "Name must be at most 5 characters" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "Jonathan" });
    expect(errors.name?.message).toBe("Name must be at most 5 characters");
  });

  // ─── String: email ─────────────────────────────────────────────────────────

  it("should return email error when value is not a valid email", () => {
    const schema = createSchema({
      email: {
        type: "string",
        rules: [
          {
            name: "email",
            error: { message: "Invalid email format" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { email: "not-an-email" });
    expect(errors.email?.message).toBe("Invalid email format");
  });

  it("should not return email error when value is a valid email", () => {
    const schema = createSchema({
      email: {
        type: "string",
        rules: [
          {
            name: "email",
            error: { message: "Invalid email format" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { email: "user@example.com" });
    expect(errors.email).toBeUndefined();
  });

  // ─── String: regex ─────────────────────────────────────────────────────────

  it("should return regex error when value does not match RegExp", () => {
    const schema = createSchema({
      username: {
        type: "string",
        rules: [
          {
            name: "regex",
            value: /^[a-zA-Z0-9_]+$/,
            error: { message: "Only alphanumeric and underscore allowed" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { username: "user name!" });
    expect(errors.username?.message).toBe(
      "Only alphanumeric and underscore allowed"
    );
  });

  it("should return regex error when value does not match pattern config", () => {
    const schema = createSchema({
      username: {
        type: "string",
        rules: [
          {
            name: "regex",
            value: { pattern: "^[a-zA-Z0-9_]+$" },
            error: { message: "Only alphanumeric and underscore allowed" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { username: "user name!" });
    expect(errors.username?.message).toBe(
      "Only alphanumeric and underscore allowed"
    );
  });

  it("should not return regex error when value matches the pattern", () => {
    const schema = createSchema({
      username: {
        type: "string",
        rules: [
          {
            name: "regex",
            value: /^[a-zA-Z0-9_]+$/,
            error: { message: "Only alphanumeric and underscore allowed" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { username: "valid_user" });
    expect(errors.username).toBeUndefined();
  });

  // ─── Object: required ──────────────────────────────────────────────────────

  it("should return required error when object value is null", () => {
    const schema = createSchema({
      role: {
        type: "object",
        rules: [
          {
            name: "required",
            error: { message: "Role is required" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { role: null });
    expect(errors.role?.message).toBe("Role is required");
  });

  it("should not return required error when object value is present", () => {
    const schema = createSchema({
      role: {
        type: "object",
        rules: [
          {
            name: "required",
            error: { message: "Role is required" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { role: { id: "admin", name: "Admin" } });
    expect(errors.role).toBeUndefined();
  });

  // ─── Generic: custom ─────────────────────────────────────────────��─────────

  it("should return custom error when custom validate returns false", () => {
    const schema = createSchema({
      age: {
        type: "number",
        rules: [
          {
            name: "custom",
            validate: (value) => typeof value === "number" && value >= 18,
            error: { message: "Must be at least 18 years old" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { age: 16 });
    expect(errors.age?.message).toBe("Must be at least 18 years old");
  });

  it("should not return custom error when custom validate returns true", () => {
    const schema = createSchema({
      age: {
        type: "number",
        rules: [
          {
            name: "custom",
            validate: (value) => typeof value === "number" && value >= 18,
            error: { message: "Must be at least 18 years old" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { age: 20 });
    expect(errors.age).toBeUndefined();
  });

  // ─── Generic: matchField ───────────────────────────────────────────────────

  it("should return matchField error when values do not match", () => {
    const schema = createSchema({
      password: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Password is required" } },
        ],
      },
      confirmPassword: {
        type: "string",
        rules: [
          {
            name: "matchField",
            value: "password",
            error: { message: "Passwords do not match" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, {
      password: "secret123",
      confirmPassword: "different",
    });
    expect(errors.confirmPassword?.message).toBe("Passwords do not match");
  });

  it("should not return matchField error when values match", () => {
    const schema = createSchema({
      password: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Password is required" } },
        ],
      },
      confirmPassword: {
        type: "string",
        rules: [
          {
            name: "matchField",
            value: "password",
            error: { message: "Passwords do not match" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, {
      password: "secret123",
      confirmPassword: "secret123",
    });
    expect(errors.confirmPassword).toBeUndefined();
  });

  // ─── Multiple rules: stops at first error ──────────────────────────────────

  it("should return only the first error when multiple rules fail", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Name is required" } },
          {
            name: "min",
            value: 3,
            error: { message: "Name is too short" },
          },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "" });
    expect(errors.name?.message).toBe("Name is required");
  });

  // ─── Multiple fields ───────────────────────────────────────────────────────

  it("should return errors for all invalid fields simultaneously", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [{ name: "required", error: { message: "Name is required" } }],
      },
      email: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Email is required" } },
        ],
      },
    });

    const errors = validateSchema(schema, { name: "", email: "" });
    expect(errors.name?.message).toBe("Name is required");
    expect(errors.email?.message).toBe("Email is required");
  });

  it("should return empty errors object when all fields are valid", () => {
    const schema = createSchema({
      name: {
        type: "string",
        rules: [{ name: "required", error: { message: "Name is required" } }],
      },
    });

    const errors = validateSchema(schema, { name: "John" });
    expect(Object.keys(errors)).toHaveLength(0);
  });
});

