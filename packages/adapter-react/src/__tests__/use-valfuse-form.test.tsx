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

  // ── setValue ─────────────────────────────────────────────────────────────────

  it("setValue without shouldValidate should NOT trigger validation", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setValue("email", "not-an-email");
    });

    // value updated
    expect(result.current.watch().email).toBe("not-an-email");
    // no errors yet
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("setValue with shouldValidate: true should run validation and set error", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setValue("email", "not-an-email", { shouldValidate: true });
    });

    expect(result.current.watch().email).toBe("not-an-email");
    expect(result.current.formState.errors.email?.message).toBe("Invalid email format");
  });

  it("setValue with shouldValidate: true should clear error when value becomes valid", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    // First: set invalid
    await act(async () => {
      result.current.setValue("email", "bad", { shouldValidate: true });
    });
    expect(result.current.formState.errors.email).toBeDefined();

    // Then: set valid
    await act(async () => {
      result.current.setValue("email", "valid@example.com", { shouldValidate: true });
    });
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  // ── trigger ───────────────────────────────────────────────────────────────────

  it("trigger() with no args should validate all fields and return false when invalid", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    let valid: boolean = true;
    await act(async () => {
      valid = result.current.trigger();
    });

    expect(valid).toBe(false);
    expect(result.current.formState.errors.email?.message).toBe("Email is required");
    expect(result.current.formState.errors.password?.message).toBe("Password is required");
  });

  it("trigger('email') should validate only the email field", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    let valid: boolean = true;
    await act(async () => {
      valid = result.current.trigger("email");
    });

    expect(valid).toBe(false);
    expect(result.current.formState.errors.email?.message).toBe("Email is required");
    // password should NOT be touched
    expect(result.current.formState.errors.password).toBeUndefined();
  });

  it("trigger(['email', 'password']) should validate specified fields", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    let valid: boolean = true;
    await act(async () => {
      valid = result.current.trigger(["email", "password"]);
    });

    expect(valid).toBe(false);
    expect(result.current.formState.errors.email).toBeDefined();
    expect(result.current.formState.errors.password).toBeDefined();
  });

  it("trigger() should return true when all fields are valid", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    let valid: boolean = false;
    await act(async () => {
      valid = result.current.trigger();
    });

    expect(valid).toBe(true);
    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.errors.password).toBeUndefined();
  });

  it("trigger should expose code from schema error", async () => {
    const schemaWithCode = createSchema({
      email: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Email wajib", code: "email.required" } },
        ],
      },
      password: {
        type: "string",
        rules: [
          { name: "required", error: { message: "Password wajib", code: "password.required" } },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValfuseForm({
        schema: schemaWithCode,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.trigger();
    });

    expect(result.current.formState.errors.email?.code).toBe("email.required");
    expect(result.current.formState.errors.password?.code).toBe("password.required");
  });

  // ── mode: onTouched ──────────────────────────────────────────────────────────

  it("mode=onTouched: should NOT validate on change before blur", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
      })
    );

    await act(async () => {
      result.current.register("email").onChange({
        target: { value: "bad" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Not touched yet — no error
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("mode=onTouched: should validate on blur (first interaction)", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
      })
    );

    await act(async () => {
      result.current.register("email").onBlur();
    });

    // After blur → validate
    expect(result.current.formState.errors.email?.message).toBe("Email is required");
  });

  it("mode=onTouched: should validate on change after field is touched", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
        mode: "onTouched",
      })
    );

    // Blur first to mark as touched
    await act(async () => {
      result.current.register("email").onBlur();
    });

    // Now change — should re-validate
    await act(async () => {
      result.current.register("email").onChange({
        target: { value: "valid@example.com" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Valid value → error cleared
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  // ── mode: all ────────────────────────────────────────────────────────────────

  it("mode=all: should validate on change", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
        mode: "all",
      })
    );

    await act(async () => {
      result.current.register("email").onChange({
        target: { value: "bad-email" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.formState.errors.email?.message).toBe("Invalid email format");
  });

  it("mode=all: should validate on blur", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
        mode: "all",
      })
    );

    await act(async () => {
      result.current.register("email").onBlur();
    });

    expect(result.current.formState.errors.email?.message).toBe("Email is required");
  });
});
