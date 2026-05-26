import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSchema } from "@valfuse-node/core";
import { useValfuseForm } from "../use-valfuse-form";

const testLoginSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email is required" } },
      { name: "email", error: { message: "Invalid email format" } },
    ],
  },
  password: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Password is required" } },
      { name: "min", value: 8, error: { message: "Password too short" } },
    ],
  },
});

describe("useValfuseForm", () => {
  it("should initialize with empty formState errors", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.errors.password).toBeUndefined();
  });

  it("should expose register, control, handleSubmit, formState, setErrors", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    expect(result.current.register).toBeDefined();
    expect(result.current.control).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.formState).toBeDefined();
    expect(result.current.setErrors).toBeDefined();
    expect(result.current.setValue).toBeDefined();
    expect(result.current.watch).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.clearErrors).toBeDefined();
  });

  it("should set field errors when setErrors is called with string errors", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({
        email: "Email tidak ditemukan",
        password: "Password salah",
      });
    });

    expect(result.current.formState.errors.email?.message).toBe(
      "Email tidak ditemukan"
    );
    expect(result.current.formState.errors.password?.message).toBe(
      "Password salah"
    );
  });

  it("should set field errors when setErrors is called with ValfuseError objects", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({
        email: {
          message: "Email salah",
          type: "server",
          code: "login.form.email.error.not_valid",
        },
        password: {
          message: "Password salah",
          type: "server",
          code: "login.form.password.error.mismatch",
        },
      });
    });

    expect(result.current.formState.errors.email?.message).toBe("Email salah");
    expect(result.current.formState.errors.password?.message).toBe(
      "Password salah"
    );
  });

  it("should forward code from setErrors to formState.errors", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({
        email: {
          message: "Email not found",
          type: "server",
          code: "auth.email.not_found",
        },
      });
    });

    expect(result.current.formState.errors.email?.code).toBe("auth.email.not_found");
  });

  it("should forward code from schema validation to formState.errors", async () => {
    const schemaWithCode = createSchema({
      email: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Email wajib diisi", code: "email.required" } },
        ],
      },
      password: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Password wajib diisi", code: "password.required" } },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValfuseForm({
        schema: schemaWithCode,
        defaultValues: { email: "", password: "" },
        mode: "onSubmit",
      })
    );

    await act(async () => {
      await result.current.handleSubmit(() => {})();
    });

    expect(result.current.formState.errors.email?.code).toBe("email.required");
    expect(result.current.formState.errors.password?.code).toBe("password.required");
  });

  it("should set error type from ValfuseError when calling setErrors", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({
        email: {
          message: "Email salah",
          type: "server",
        },
      });
    });

    expect(result.current.formState.errors.email?.type).toBe("server");
  });

  it("should clear errors after clearErrors is called", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({ email: "Some error" });
    });

    expect(result.current.formState.errors.email?.message).toBe("Some error");

    await act(async () => {
      result.current.clearErrors();
    });

    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("should reset form to defaultValues", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setErrors({ email: "Some error" });
    });

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.watch().email).toBe("");
  });

  it("should return current values from watch()", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "test@example.com", password: "" },
      })
    );

    expect(result.current.watch().email).toBe("test@example.com");
  });
});
