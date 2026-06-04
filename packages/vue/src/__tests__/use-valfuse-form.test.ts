import { effectScope, nextTick } from "vue";
import { describe, expect, it } from "vitest";
import { createSchema } from "@valfuse-node/form";
import { useValfuseForm } from "../composables/use-valfuse-form";

// ─── Schema ───────────────────────────────────────────────────────────────────

const testSchema = createSchema({
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email is required" } },
      { name: "email", error: { message: "Invalid email", code: "email.invalid" } },
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

type TestValues = { email: string; password: string };

// Helper: run a function inside a Vue effect scope and tear it down.
function inScope<T>(fn: () => T): T {
  const scope = effectScope();
  try {
    return scope.run(fn)!;
  } finally {
    scope.stop();
  }
}

// ─── Existing contract (regression tests) ─────────────────────────────────────

describe("useValfuseForm — existing contract", () => {
  it("returns the full public API surface", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );

    expect(form.formState).toBeDefined();
    expect(form.control).toBeDefined();
    expect(form.register).toBeDefined();
    expect(form.handleSubmit).toBeDefined();
    expect(form.setErrors).toBeDefined();
    expect(form.clearErrors).toBeDefined();
    expect(form.setValue).toBeDefined();
    expect(form.getValue).toBeDefined();
    expect(form.getValues).toBeDefined();
    expect(form.trigger).toBeDefined();
    expect(form.reset).toBeDefined();
    expect(form.watch).toBeDefined();
  });

  it("register returns Vue v-model props", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "init@example.com", password: "" },
      })
    );
    const reg = form.register("email");
    expect(reg.name).toBe("email");
    expect(reg.modelValue).toBe("init@example.com");
    expect(typeof reg["onUpdate:modelValue"]).toBe("function");
    expect(typeof reg.onBlur).toBe("function");
  });

  it("updates the value via onUpdate:modelValue and marks dirty", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    const reg = form.register("email");

    reg["onUpdate:modelValue"]("new@example.com");
    await nextTick();

    expect(form.getValue("email")).toBe("new@example.com");
    expect(form.formState.dirtyFields.email).toBe(true);
    expect(form.formState.isDirty).toBe(true);
  });

  it("marks field touched on onBlur", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    const reg = form.register("email");
    expect(form.formState.touchedFields.email).toBeUndefined();

    reg.onBlur();
    await nextTick();

    expect(form.formState.touchedFields.email).toBe(true);
  });
});

// ─── formState: new fields (alignment with form contract) ────────────────────

describe("useValfuseForm — formState contract parity", () => {
  it("exposes isDirty=false initially", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(form.formState.isDirty).toBe(false);
  });

  it("exposes isDirty=true after a value changes from default", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    form.setValue("email", "x@y.com");
    await nextTick();
    expect(form.formState.isDirty).toBe(true);
  });

  it("exposes defaultValues on formState", () => {
    const defaults = { email: "a@b.com", password: "" };
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: defaults,
      })
    );
    expect(form.formState.defaultValues).toEqual(defaults);
  });

  it("exposes submitCount, isSubmitted, isSubmitSuccessful, isSubmitting (initial zeros)", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(form.formState.submitCount).toBe(0);
    expect(form.formState.isSubmitted).toBe(false);
    expect(form.formState.isSubmitSuccessful).toBe(false);
    expect(form.formState.isSubmitting).toBe(false);
  });

  it("increments submitCount on each submit attempt", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "valid@example.com", password: "longenough" },
      })
    );
    const handler = form.handleSubmit(async () => {});
    await handler(new Event("submit"));
    expect(form.formState.submitCount).toBe(1);
    expect(form.formState.isSubmitted).toBe(true);
    expect(form.formState.isSubmitSuccessful).toBe(true);

    await handler(new Event("submit"));
    expect(form.formState.submitCount).toBe(2);
  });

  it("sets isSubmitSuccessful=false on validation failure", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    const handler = form.handleSubmit(async () => {});
    await handler(new Event("submit"));
    expect(form.formState.isSubmitSuccessful).toBe(false);
    expect(form.formState.errors.email).toBeDefined();
  });

  it("exposes dirtyFields and touchedFields as Record shape (not Set)", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    // Should NOT be a Set
    expect(form.formState.dirtyFields).not.toBeInstanceOf(Set);
    expect(form.formState.touchedFields).not.toBeInstanceOf(Set);
    // Should be plain objects
    expect(typeof form.formState.dirtyFields).toBe("object");
    expect(typeof form.formState.touchedFields).toBe("object");
  });
});

// ─── control object (new — for ValfuseController Vue equivalent) ──────────────

describe("useValfuseForm — control object", () => {
  it("exposes _values, _errors, _touchedFields, _updateField, _touchField", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "a@b.com", password: "secret123" },
      })
    );
    expect(form.control).toBeDefined();
    expect(form.control._values).toBeDefined();
    expect(form.control._updateField).toBeDefined();
    expect(form.control._touchField).toBeDefined();
  });

  it("_values reflects current field values", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "init", password: "" },
      })
    );
    expect(form.control._values.email).toBe("init");
  });

  it("_updateField updates the value and marks dirty", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    form.control._updateField("email", "set-via-control@example.com");
    await nextTick();

    expect(form.getValue("email")).toBe("set-via-control@example.com");
    expect(form.formState.dirtyFields.email).toBe(true);
  });

  it("_touchField marks the field as touched", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    form.control._touchField("email");
    await nextTick();
    expect(form.formState.touchedFields.email).toBe(true);
  });
});

// ─── trigger (new — for parity with React) ───────────────────────────────────

describe("useValfuseForm — trigger", () => {
  it("returns true when all fields are valid", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "valid@example.com", password: "longenough" },
      })
    );
    expect(form.trigger()).toBe(true);
  });

  it("returns false when fields are invalid and populates errors", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    expect(form.trigger()).toBe(false);
    expect(form.formState.errors.email?.message).toBe("Email is required");
    expect(form.formState.errors.password?.message).toBe("Password is required");
  });

  it("trigger(name) validates a single field", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "valid@example.com", password: "" },
      })
    );
    expect(form.trigger("password")).toBe(false);
    expect(form.formState.errors.password?.message).toBe("Password is required");
    // email was not re-validated — its error should remain undefined
    expect(form.formState.errors.email).toBeUndefined();
  });

  it("trigger([names]) validates an array of fields", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "valid@example.com", password: "" },
      })
    );
    expect(form.trigger(["email", "password"])).toBe(false);
    expect(form.formState.errors.password).toBeDefined();
  });
});

// ─── multi-overload watch (new — for parity with React) ──────────────────────

describe("useValfuseForm — watch overloads", () => {
  it("watch() returns all current values as a snapshot", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "a@b.com", password: "secret" },
      })
    );
    const all = form.watch();
    expect(all).toEqual({ email: "a@b.com", password: "secret" });
  });

  it("watch(name) returns the single current value", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "a@b.com", password: "secret" },
      })
    );
    expect(form.watch("email")).toBe("a@b.com");
    expect(form.watch("password")).toBe("secret");
  });

  it("watch([names]) returns values in order", () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "a@b.com", password: "secret" },
      })
    );
    const arr = form.watch(["email", "password"]);
    expect(arr).toEqual(["a@b.com", "secret"]);
  });

  it("watch(callback) subscribes to all changes and returns unsubscribe", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    const received: Array<{ values: TestValues; name?: string }> = [];
    const unsub = form.watch((values, info) => {
      received.push({ values: values as TestValues, name: info?.name });
    });

    form.setValue("email", "first@example.com");
    await nextTick();
    expect(received.length).toBeGreaterThan(0);
    expect(received[received.length - 1].values.email).toBe("first@example.com");
    expect(received[received.length - 1].name).toBe("email");

    const beforeUnsub = received.length;
    unsub();
    form.setValue("email", "second@example.com");
    await nextTick();
    expect(received.length).toBe(beforeUnsub);
  });

  it("watch(name, callback) legacy form subscribes to a single field", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "", password: "" },
      })
    );
    const received: string[] = [];
    const unsub = form.watch("email", (v) => received.push(String(v)));

    form.setValue("email", "watched@example.com");
    await nextTick();
    expect(received).toContain("watched@example.com");

    const beforeUnsub = received.length;
    unsub();
    form.setValue("email", "ignored@example.com");
    await nextTick();
    expect(received.length).toBe(beforeUnsub);
  });
});

// ─── reset (now also resets submit state) ────────────────────────────────────

describe("useValfuseForm — reset", () => {
  it("resets submit state along with values", async () => {
    const form = inScope(() =>
      useValfuseForm({
        schema: testSchema,
        defaultValues: { email: "valid@example.com", password: "longenough" },
      })
    );
    const handler = form.handleSubmit(async () => {});
    await handler(new Event("submit"));
    expect(form.formState.submitCount).toBe(1);
    expect(form.formState.isSubmitted).toBe(true);

    form.reset();
    expect(form.formState.submitCount).toBe(0);
    expect(form.formState.isSubmitted).toBe(false);
    expect(form.formState.isSubmitSuccessful).toBe(false);
    expect(form.formState.dirtyFields).toEqual({});
    expect(form.formState.touchedFields).toEqual({});
  });
});
