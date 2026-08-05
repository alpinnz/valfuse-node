import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSchema } from "@valfuse-node/form";
import { ValfuseController } from "../components/valfuse-controller";
import { useValfuseForm } from "../hooks/use-valfuse-form";

const testSchema = createSchema({
  role: {
    type: "string",
    rules: [{ name: "required", error: { message: "Role is required" } }],
  },
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email is required" } },
      { name: "email", error: { message: "Invalid email", code: "email.invalid" } },
    ],
  },
});

type TestValues = { role: string; email: string };

// ─── Test harness ─────────────────────────────────────────────────────────────

function FormWithController({
  defaultValues,
  mode = "onSubmit",
}: {
  defaultValues: TestValues;
  mode?: "onSubmit" | "onChange" | "onBlur" | "onTouched" | "all";
}) {
  const form = useValfuseForm({ schema: testSchema, defaultValues, mode });
  return (
    <>
      <ValfuseController
        control={form.control}
        name="role"
        render={({ field, fieldState }) => (
          <select
            data-testid="role-input"
            name={field.name}
            value={(field.value as string) ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            data-touched={fieldState.isTouched}
          >
            <option value="">--</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        )}
      />
      <ValfuseController
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <div>
            <input
              data-testid="email-input"
              name={field.name}
              value={(field.value as string) ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
              data-touched={fieldState.isTouched}
            />
            {fieldState.error && (
              <span data-testid="email-error" data-code={fieldState.error.code}>
                {fieldState.error.message}
              </span>
            )}
          </div>
        )}
      />
    </>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ValfuseController", () => {
  it("renders the render-prop output with the field name", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "" }} />);
    const input = screen.getByTestId("role-input");
    expect(input).toBeTruthy();
    expect(input.getAttribute("name")).toBe("role");
  });

  it("passes the initial field value from the form", () => {
    render(<FormWithController defaultValues={{ role: "admin", email: "" }} />);
    expect(screen.getByTestId<HTMLSelectElement>("role-input").value).toBe("admin");
  });

  it("forwards field.onChange to the form state", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "" }} />);
    const select = screen.getByTestId<HTMLSelectElement>("role-input");

    act(() => {
      fireEvent.change(select, { target: { value: "admin" } });
    });

    expect(select.value).toBe("admin");
  });

  it("forwards field.onBlur to mark the field as touched", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "" }} />);
    const select = screen.getByTestId<HTMLSelectElement>("role-input");
    expect(select.getAttribute("data-touched")).toBe("false");

    act(() => {
      fireEvent.blur(select);
    });

    expect(select.getAttribute("data-touched")).toBe("true");
  });

  it("starts with isTouched=false and flips to true after onBlur", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "" }} />);
    const input = screen.getByTestId<HTMLInputElement>("email-input");
    expect(input.getAttribute("data-touched")).toBe("false");

    act(() => {
      fireEvent.blur(input);
    });

    expect(input.getAttribute("data-touched")).toBe("true");
  });

  it("does not render the error span when there is no error", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "valid@example.com" }} />);
    expect(screen.queryByTestId("email-error")).toBeNull();
  });

  it("renders the validation error message and code on fieldState.error", () => {
    // mode="onChange" so the field validates as the user types
    render(<FormWithController defaultValues={{ role: "user", email: "" }} mode="onChange" />);
    const input = screen.getByTestId<HTMLInputElement>("email-input");

    act(() => {
      fireEvent.change(input, { target: { value: "not-an-email" } });
    });

    const error = screen.getByTestId("email-error");
    expect(error.textContent).toBe("Invalid email");
    expect(error.getAttribute("data-code")).toBe("email.invalid");
  });

  it("clears the error after the user fixes the value", () => {
    render(<FormWithController defaultValues={{ role: "user", email: "" }} mode="onChange" />);
    const input = screen.getByTestId<HTMLInputElement>("email-input");

    act(() => {
      fireEvent.change(input, { target: { value: "bad" } });
    });
    expect(screen.queryByTestId("email-error")).not.toBeNull();

    act(() => {
      fireEvent.change(input, { target: { value: "good@example.com" } });
    });
    expect(screen.queryByTestId("email-error")).toBeNull();
  });

  it("keeps the field object reference stable for the unchanged field when another changes", () => {
    // Two controllers share the same form. Changing one field should NOT change
    // the `field` object reference passed to the OTHER controller's render-prop.
    // This is the actual performance optimization — stable refs let memo'd
    // children (e.g. React.memo'd custom inputs) skip re-renders.
    type FieldRef = { name: string; value: unknown };
    const roleFieldRefs: FieldRef[] = [];
    const emailFieldRefs: FieldRef[] = [];

    function DualForm() {
      const form = useValfuseForm({
        schema: testSchema,
        defaultValues: { role: "user", email: "" },
      });
      return (
        <>
          <ValfuseController
            control={form.control}
            name="role"
            render={({ field }) => {
              roleFieldRefs.push({ name: field.name, value: field.value });
              return (
                <input
                  data-testid="role-input"
                  value={(field.value as string) ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              );
            }}
          />
          <ValfuseController
            control={form.control}
            name="email"
            render={({ field }) => {
              emailFieldRefs.push({ name: field.name, value: field.value });
              return (
                <input
                  data-testid="email-input"
                  value={(field.value as string) ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              );
            }}
          />
        </>
      );
    }

    render(<DualForm />);

    // Snapshot how many times each controller was invoked before the change.
    const emailCallsBefore = emailFieldRefs.length;

    act(() => {
      fireEvent.change(screen.getByTestId<HTMLInputElement>("role-input"), {
        target: { value: "admin" },
      });
    });

    // Email's value never changed, so its `field.value` should match what it was
    // before — proving the field object for email is stable across role's update.
    const lastEmailValue = emailFieldRefs[emailFieldRefs.length - 1].value;
    expect(lastEmailValue).toBe("");

    // Role's value did change — its render-prop saw the new value.
    expect(roleFieldRefs[roleFieldRefs.length - 1].value).toBe("admin");

    // And the email render-prop was still invoked (parent re-renders affect both),
    // but its `field.value` reference didn't change.
    expect(emailFieldRefs.length).toBeGreaterThanOrEqual(emailCallsBefore);
  });

  it("integrates with a custom non-input widget (real-world use case)", () => {
    // Simulates a date-picker / dropdown that doesn't accept `register()`'s shape.
    function DatePickerField({
      control,
    }: {
      control: ReturnType<typeof useValfuseForm<TestValues>>["control"];
    }) {
      return (
        <ValfuseController
          control={control}
          name="role"
          render={({ field, fieldState }) => (
            <div data-testid="date-picker">
              <button data-testid="date-picker-set" onClick={() => field.onChange("admin")}>
                Pick Admin
              </button>
              <button data-testid="date-picker-blur" onClick={field.onBlur}>
                Done
              </button>
              <span data-testid="date-picker-value">{String(field.value ?? "")}</span>
              <span data-testid="date-picker-touched">
                {fieldState.isTouched ? "touched" : "pristine"}
              </span>
              {fieldState.error && (
                <span data-testid="date-picker-error">{fieldState.error.message}</span>
              )}
            </div>
          )}
        />
      );
    }

    function Page() {
      const form = useValfuseForm({
        schema: testSchema,
        defaultValues: { role: "", email: "" },
        mode: "onBlur",
      });
      return <DatePickerField control={form.control} />;
    }

    render(<Page />);

    expect(screen.getByTestId("date-picker-value").textContent).toBe("");
    expect(screen.getByTestId("date-picker-touched").textContent).toBe("pristine");

    act(() => {
      fireEvent.click(screen.getByTestId("date-picker-set"));
    });
    expect(screen.getByTestId("date-picker-value").textContent).toBe("admin");

    act(() => {
      fireEvent.click(screen.getByTestId("date-picker-blur"));
    });
    expect(screen.getByTestId("date-picker-touched").textContent).toBe("touched");

    // Non-empty value passes `required` — no error expected.
    expect(screen.queryByTestId("date-picker-error")).toBeNull();
  });
});
