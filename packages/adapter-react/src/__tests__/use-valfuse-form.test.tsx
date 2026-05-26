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

  it("watch('email') should return current value of a single field", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "hello@example.com", password: "pass1234" },
      })
    );

    expect(result.current.watch("email")).toBe("hello@example.com");
    expect(result.current.watch("password")).toBe("pass1234");
  });

  it("watch(['email', 'password']) should return array of values in order", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "a@b.com", password: "secret99" },
      })
    );

    const [email, password] = result.current.watch(["email", "password"]);
    expect(email).toBe("a@b.com");
    expect(password).toBe("secret99");
  });

  it("watch(callback) should be called with updated values after setValue", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    const received: Array<{ email: string; password: string }> = [];
    let receivedNames: Array<string | undefined> = [];

    act(() => {
      result.current.watch((values, info) => {
        received.push(values as { email: string; password: string });
        receivedNames.push(info.name);
      });
    });

    await act(async () => {
      result.current.setValue("email", "watched@example.com");
    });

    expect(received.length).toBeGreaterThan(0);
    expect(received[received.length - 1].email).toBe("watched@example.com");
    expect(receivedNames[receivedNames.length - 1]).toBe("email");
  });

  it("watch(callback) unsubscribe should stop future notifications", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    const calls: string[] = [];
    let unsubscribe: (() => void) | undefined;

    act(() => {
      unsubscribe = result.current.watch((values) => {
        calls.push((values as { email: string }).email);
      });
    });

    await act(async () => {
      result.current.setValue("email", "first@example.com");
    });

    const countAfterFirst = calls.length;
    expect(countAfterFirst).toBeGreaterThan(0);

    // Unsubscribe
    act(() => { unsubscribe?.(); });

    await act(async () => {
      result.current.setValue("email", "second@example.com");
    });

    // Should NOT have been called again after unsubscribe
    expect(calls.length).toBe(countAfterFirst);
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

  // ── formState: isDirty / dirtyFields ─────────────────────────────────────────

  it("isDirty should be false on init", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(result.current.formState.isDirty).toBe(false);
    expect(result.current.formState.dirtyFields).toEqual({});
  });

  it("isDirty should be true after setValue changes a field", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.setValue("email", "changed@example.com");
    });

    expect(result.current.formState.isDirty).toBe(true);
    expect(result.current.formState.dirtyFields).toEqual({ email: true });
  });

  it("isDirty should be false again after reset", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => { result.current.setValue("email", "x@x.com"); });
    expect(result.current.formState.isDirty).toBe(true);

    await act(async () => { result.current.reset(); });
    expect(result.current.formState.isDirty).toBe(false);
  });

  // ── formState: isValid ───────────────────────────────────────────────────────

  it("isValid should be false on init (no validation has run yet)", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    // isValid is false until at least one validation has run
    expect(result.current.formState.isValid).toBe(false);
  });

  it("isValid should be false after validation errors are set", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      result.current.trigger();
    });

    expect(result.current.formState.isValid).toBe(false);
  });

  it("isValid should return true when all fields pass validation", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    await act(async () => { result.current.trigger(); });
    expect(result.current.formState.isValid).toBe(true);
  });

  it("isValid should go back to false after reset()", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    await act(async () => { result.current.trigger(); });
    expect(result.current.formState.isValid).toBe(true);

    await act(async () => { result.current.reset(); });
    // After reset, hasValidated is cleared — isValid goes back to false
    expect(result.current.formState.isValid).toBe(false);
  });

  // ── formState: isSubmitted / isSubmitSuccessful / submitCount ─────────────────

  it("isSubmitted should be false before any submit", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(result.current.formState.isSubmitted).toBe(false);
    expect(result.current.formState.submitCount).toBe(0);
  });

  it("isSubmitted should be true after failed submit (validation errors)", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => {
      await result.current.handleSubmit(() => {})();
    });

    expect(result.current.formState.isSubmitted).toBe(true);
    expect(result.current.formState.isSubmitSuccessful).toBe(false);
    expect(result.current.formState.submitCount).toBe(1);
  });

  it("isSubmitSuccessful should be true after valid submit", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    await act(async () => {
      await result.current.handleSubmit(() => {})();
    });

    expect(result.current.formState.isSubmitted).toBe(true);
    expect(result.current.formState.isSubmitSuccessful).toBe(true);
    expect(result.current.formState.submitCount).toBe(1);
  });

  it("submitCount should increment on each submit attempt", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => { await result.current.handleSubmit(() => {})(); });
    await act(async () => { await result.current.handleSubmit(() => {})(); });

    expect(result.current.formState.submitCount).toBe(2);
  });

  it("reset should clear isSubmitted, isSubmitSuccessful and submitCount", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    await act(async () => { await result.current.handleSubmit(() => {})(); });
    expect(result.current.formState.isSubmitted).toBe(true);

    await act(async () => { result.current.reset(); });

    expect(result.current.formState.isSubmitted).toBe(false);
    expect(result.current.formState.isSubmitSuccessful).toBe(false);
    expect(result.current.formState.submitCount).toBe(0);
  });

  // ── formState: touchedFields ──────────────────────────────────────────────────

  it("touchedFields should be empty on init", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(result.current.formState.touchedFields).toEqual({});
  });

  it("touchedFields should contain field after onBlur", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => { result.current.register("email").onBlur(); });

    expect(result.current.formState.touchedFields.email).toBe(true);
    expect(result.current.formState.touchedFields.password).toBeUndefined();
  });

  it("touchedFields should reset after reset()", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    await act(async () => { result.current.register("email").onBlur(); });
    expect(result.current.formState.touchedFields.email).toBe(true);

    await act(async () => { result.current.reset(); });
    expect(result.current.formState.touchedFields).toEqual({});
  });

  // ── formState: defaultValues ──────────────────────────────────────────────────

  it("defaultValues should be exposed in formState", () => {
    const defaults = { email: "default@example.com", password: "" };
    const { result } = renderHook(() =>
      useValfuseForm({ schema: testLoginSchema, defaultValues: defaults })
    );
    expect(result.current.formState.defaultValues).toEqual(defaults);
  });
});
