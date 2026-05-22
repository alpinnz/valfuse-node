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
    const { result } = renderHook(() => {
      const form = useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      });
      // subscribe to errors in render phase
      void form.formState.errors;
      return form;
    });

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
    const { result } = renderHook(() => {
      const form = useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      });
      // subscribe to errors in render phase
      void form.formState.errors;
      return form;
    });

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
    const { result } = renderHook(() => {
      const form = useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      });
      void form.formState.errors;
      return form;
    });

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

  it("should set error type from ValfuseError when calling setErrors", async () => {
    const { result } = renderHook(() => {
      const form = useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      });
      void form.formState.errors;
      return form;
    });

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
    const { result } = renderHook(() => {
      const form = useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      });
      void form.formState.errors;
      return form;
    });

    await act(async () => {
      result.current.setErrors({ email: "Some error" });
    });

    expect(result.current.formState.errors.email?.message).toBe("Some error");

    await act(async () => {
      result.current.clearErrors();
    });

    expect(result.current.formState.errors.email).toBeUndefined();
  });
});
