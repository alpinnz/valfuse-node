import { describe, it, expect } from "vitest";
import { buildFieldError, mapToFieldErrors } from "../../helpers/field-error";

// ── buildFieldError ───────────────────────────────────────────────────────────

describe("buildFieldError", () => {
  it("returns null when field has no error", () => {
    expect(buildFieldError({}, "email")).toBeNull();
  });

  it("returns null when other fields have errors but the target does not", () => {
    const errors = { password: { message: "Required" } };
    expect(buildFieldError(errors, "email")).toBeNull();
  });

  it("maps message and defaults type to 'validation'", () => {
    const errors = { email: { message: "Invalid email" } };
    expect(buildFieldError(errors, "email")).toEqual({
      message: "Invalid email",
      type: "validation",
    });
  });

  it("preserves explicit type when provided", () => {
    const errors = { email: { message: "Required", type: "required" } };
    expect(buildFieldError(errors, "email")).toEqual({
      message: "Required",
      type: "required",
    });
  });

  it("includes code when provided", () => {
    const errors = { email: { message: "Required", code: "email.required" } };
    expect(buildFieldError(errors, "email")).toEqual({
      message: "Required",
      type: "validation",
      code: "email.required",
    });
  });

  it("omits code when undefined", () => {
    const errors = { email: { message: "Required" } };
    const result = buildFieldError(errors, "email");
    expect(result).not.toHaveProperty("code");
  });
});

// ── mapToFieldErrors ──────────────────────────────────────────────────────────

describe("mapToFieldErrors", () => {
  it("returns empty object when no errors", () => {
    expect(mapToFieldErrors({})).toEqual({});
  });

  it("maps multiple fields", () => {
    const raw = {
      email: { message: "Invalid email" },
      password: { message: "Too short", type: "minLength" },
    };
    expect(mapToFieldErrors(raw)).toEqual({
      email: { message: "Invalid email", type: "validation" },
      password: { message: "Too short", type: "minLength" },
    });
  });

  it("includes metadata when provided (full-form errors only)", () => {
    const raw = {
      email: {
        message: "Required",
        metadata: { field: "email", rule: "required" },
      },
    };
    expect(mapToFieldErrors(raw)).toEqual({
      email: {
        message: "Required",
        type: "validation",
        metadata: { field: "email", rule: "required" },
      },
    });
  });

  it("omits metadata when undefined", () => {
    const raw = { email: { message: "Required" } };
    const result = mapToFieldErrors(raw);
    expect(result.email).not.toHaveProperty("metadata");
  });
});

