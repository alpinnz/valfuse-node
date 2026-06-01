import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSchema, t } from "@valfuse-node/form";
import { useValfuseForm } from "../hooks/use-valfuse-form";

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
    const receivedNames: Array<string | undefined> = [];

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

  it("isValid should be false on init when defaultValues fail schema", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    // isValid is computed from schema — empty strings fail required rules
    expect(result.current.formState.isValid).toBe(false);
  });

  it("isValid should be true on init when defaultValues pass schema", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );
    // isValid is computed from schema — valid defaultValues pass immediately
    expect(result.current.formState.isValid).toBe(true);
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

  it("isValid should reflect schema after reset() with valid defaultValues", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    await act(async () => { result.current.trigger(); });
    expect(result.current.formState.isValid).toBe(true);

    await act(async () => { result.current.reset(); });
    // After reset, values go back to valid defaultValues — isValid stays true
    expect(result.current.formState.isValid).toBe(true);
  });

  it("isValid should be false after reset() with invalid defaultValues", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    // Set valid values first
    await act(async () => { result.current.setValue("email", "valid@example.com"); });
    await act(async () => { result.current.setValue("password", "securepass"); });
    expect(result.current.formState.isValid).toBe(true);

    // After reset, values go back to invalid defaultValues — isValid is false
    await act(async () => { result.current.reset(); });
    expect(result.current.formState.isValid).toBe(false);
  });

  it("setErrors (API error) should make isValid false, then setValue auto-clears it", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: testLoginSchema,
        defaultValues: { email: "valid@example.com", password: "securepass" },
      })
    );

    // Initially valid
    expect(result.current.formState.isValid).toBe(true);

    // API returns error
    await act(async () => { result.current.setErrors({ email: "Email already taken" }); });
    expect(result.current.formState.errors.email?.message).toBe("Email already taken");
    expect(result.current.formState.isValid).toBe(false);

    // User changes the field → stale API error auto-cleared
    await act(async () => { result.current.setValue("email", "another@example.com"); });
    expect(result.current.formState.errors.email).toBeUndefined();
    expect(result.current.formState.isValid).toBe(true);
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

// ── transform integration ─────────────────────────────────────────────────────

const transformSchema = createSchema({
  email: {
    type: "string",
    transform: t.pipe(t.trim, t.toLowerCase),
    rules: [
      { name: "required", error: { message: "Email is required" } },
      { name: "email",    error: { message: "Invalid email" } },
    ],
  },
  name: {
    type: "string",
    transform: t.trim,
    rules: [
      { name: "required", error: { message: "Name is required" } },
      { name: "min", value: 3, error: { message: "Name too short" } },
    ],
  },
});

describe("useValfuseForm — transform", () => {
  it("register.onChange stores the transformed value", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({ schema: transformSchema, defaultValues: { email: "", name: "" } })
    );

    await act(async () => {
      result.current.register("email").onChange({
        target: { value: "  HELLO@EXAMPLE.COM  " },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.watch("email")).toBe("hello@example.com");
  });

  it("register.onChange validates with transformed value (mode=onChange)", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({ schema: transformSchema, defaultValues: { email: "", name: "" }, mode: "onChange" })
    );

    await act(async () => {
      result.current.register("email").onChange({
        target: { value: "  HELLO@EXAMPLE.COM  " },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // After trim + toLowerCase → "hello@example.com" — valid, no error
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("register.onBlur validates with transformed defaultValue (mode=onBlur)", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "  HELLO@EXAMPLE.COM  ", name: "Alice" },
        mode: "onBlur",
      })
    );

    await act(async () => {
      result.current.register("email").onBlur();
    });

    // Transform applied to raw defaultValue: "hello@example.com" is valid
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("register.onBlur reports error for invalid transformed value", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "   ", name: "Alice" },
        mode: "onBlur",
      })
    );

    await act(async () => {
      result.current.register("email").onBlur();
    });

    // t.pipe(t.trim, t.toLowerCase)("   ") → "" — fails required
    expect(result.current.formState.errors.email?.message).toBe("Email is required");
  });

  it("setValue applies transform before storing", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({ schema: transformSchema, defaultValues: { email: "", name: "" } })
    );

    await act(async () => {
      result.current.setValue("email", "  HELLO@EXAMPLE.COM  ");
    });

    expect(result.current.watch("email")).toBe("hello@example.com");
  });

  it("trigger validates with transformed values", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "  HELLO@EXAMPLE.COM  ", name: "Alice" },
      })
    );

    let valid = false;
    await act(async () => {
      valid = result.current.trigger("email");
    });

    // Transform → "hello@example.com" — valid
    expect(valid).toBe(true);
    expect(result.current.formState.errors.email).toBeUndefined();
  });

  it("trigger reports error when transformed value is invalid", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "   ", name: "Alice" },
      })
    );

    let valid = true;
    await act(async () => {
      valid = result.current.trigger("email");
    });

    // "   " → "" after trim → fails required
    expect(valid).toBe(false);
    expect(result.current.formState.errors.email?.message).toBe("Email is required");
  });

  it("handleSubmit passes transformed values to onValid", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "  HELLO@EXAMPLE.COM  ", name: "  Alice  " },
      })
    );

    let submitted: Record<string, unknown> | undefined;
    await act(async () => {
      await result.current.handleSubmit((values) => {
        submitted = values as Record<string, unknown>;
      })();
    });

    expect(submitted?.email).toBe("hello@example.com");
    expect(submitted?.name).toBe("Alice"); // t.trim
    expect(result.current.formState.isSubmitSuccessful).toBe(true);
  });

  it("isValid uses transformed values", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "  HELLO@EXAMPLE.COM  ", name: "Alice" },
      })
    );

    // Raw defaultValues would fail (spaces, uppercase) but after transform they pass
    expect(result.current.formState.isValid).toBe(true);
  });

  it("isValid is false when transformed value still fails", () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: transformSchema,
        defaultValues: { email: "   ", name: "Alice" },
      })
    );

    // "   " → "" after trim → fails required → isValid false
    expect(result.current.formState.isValid).toBe(false);
  });
});

// ── setValue + trigger stale-ref regression ───────────────────────────────────
//
// Reproduces the bug where calling setValue(name, value) followed immediately by
// trigger([name]) would produce a false validation error because trigger() was
// reading valuesRef.current which hadn't been updated yet (still held the
// previous render's value). The fix syncs valuesRef.current inside setValue
// BEFORE scheduling the React state update.
describe("setValue + trigger stale-ref regression", () => {
  const termsSchema = createSchema({
    isTermsAccepted: {
      type: "boolean",
      rules: [
        {
          name: "custom",
          validate: (value: unknown) => value === true,
          error: { message: "You must accept the terms" },
        },
      ],
    },
    name: {
      type: "string",
      rules: [
        { name: "required", error: { message: "Name is required" } },
      ],
    },
  });

  it("setValue(true) + trigger() should NOT produce an error for isTermsAccepted", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: termsSchema,
        defaultValues: { isTermsAccepted: false, name: "Alice" },
      })
    );

    await act(async () => {
      result.current.setValue("isTermsAccepted", true);
      result.current.trigger(["isTermsAccepted"]);
    });

    expect(result.current.formState.errors.isTermsAccepted).toBeUndefined();
  });

  it("setValue(false) + trigger() should produce an error for isTermsAccepted", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: termsSchema,
        defaultValues: { isTermsAccepted: true, name: "Alice" },
      })
    );

    await act(async () => {
      result.current.setValue("isTermsAccepted", false);
      result.current.trigger(["isTermsAccepted"]);
    });

    expect(result.current.formState.errors.isTermsAccepted).toBeDefined();
    expect(result.current.formState.errors.isTermsAccepted?.message).toBe("You must accept the terms");
  });

  it("multiple sequential setValue + trigger calls should always read the latest value", async () => {
    const { result } = renderHook(() =>
      useValfuseForm({
        schema: termsSchema,
        defaultValues: { isTermsAccepted: false, name: "" },
      })
    );

    // Toggle true → no error
    await act(async () => {
      result.current.setValue("isTermsAccepted", true);
      result.current.trigger(["isTermsAccepted"]);
    });
    expect(result.current.formState.errors.isTermsAccepted).toBeUndefined();

    // Toggle back false → has error
    await act(async () => {
      result.current.setValue("isTermsAccepted", false);
      result.current.trigger(["isTermsAccepted"]);
    });
    expect(result.current.formState.errors.isTermsAccepted).toBeDefined();

    // Toggle true again → no error
    await act(async () => {
      result.current.setValue("isTermsAccepted", true);
      result.current.trigger(["isTermsAccepted"]);
    });
    expect(result.current.formState.errors.isTermsAccepted).toBeUndefined();
  });

  it("setValue uses accepted rule for boolean checkbox scenario", async () => {
    const checkboxSchema = createSchema({
      agreed: {
        type: "boolean",
        rules: [
          { name: "accepted", error: { message: "Must be accepted" } },
        ],
      },
    });

    const { result } = renderHook(() =>
      useValfuseForm({
        schema: checkboxSchema,
        defaultValues: { agreed: false },
      })
    );

    await act(async () => {
      result.current.setValue("agreed", true);
      result.current.trigger(["agreed"]);
    });
    expect(result.current.formState.errors.agreed).toBeUndefined();

    await act(async () => {
      result.current.setValue("agreed", false);
      result.current.trigger(["agreed"]);
    });
    expect(result.current.formState.errors.agreed).toBeDefined();
  });
});

