import { useState, useEffect } from "react";
import { useValfuseForm, ValfuseController } from "@valfuse-node/react";
import type { ValfuseFormMode, ValfuseFormState } from "@valfuse-node/react";
import { createSchema } from "@valfuse-node/form";

// ─── Schema & types — STABLE references, defined outside the component ─────────
// ⚠️ Defining schema/defaultValues outside (or in useMemo) prevents unnecessary
//    re-renders caused by reference inequality.

const schema = createSchema({
  username: {
    type: "string",
    // transform: applied on register onChange, setValue, and handleSubmit
    transform: (v: unknown) => String(v).toLowerCase().trim(),
    rules: [
      { name: "required", error: { message: "Username wajib diisi", code: "username.required" } },
      { name: "min", value: 3, error: { message: "Username minimal 3 karakter", code: "username.min" } },
      { name: "max", value: 20, error: { message: "Username maksimal 20 karakter", code: "username.max" } },
    ],
  },
  email: {
    type: "string",
    rules: [
      { name: "required", error: { message: "Email wajib diisi", code: "email.required" } },
      { name: "email", error: { message: "Format email tidak valid", code: "email.invalid" } },
    ],
  },
  bio: {
    type: "string",
    // optional field — no "required" rule, only max length
    rules: [
      { name: "max", value: 160, error: { message: "Bio maksimal 160 karakter", code: "bio.max" } },
    ],
  },
  priority: {
    type: "string",
    // controlled via ValfuseController (custom select)
    rules: [
      { name: "required", error: { message: "Priority wajib dipilih", code: "priority.required" } },
    ],
  },
});

type AllFeaturesFormValues = {
  username: string;
  email: string;
  bio: string;
  priority: string;
};

const DEFAULT_VALUES: AllFeaturesFormValues = {
  username: "",
  email: "",
  bio: "",
  priority: "",
};

const PRIORITY_OPTIONS = ["low", "medium", "high", "critical"] as const;

// ─── Watch entry type ─────────────────────────────────────────────────────────

type WatchEntry = {
  name?: string;
  snapshot: AllFeaturesFormValues;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Badge({ v }: { v: boolean }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 7px",
        borderRadius: "10px",
        fontSize: "0.72rem",
        fontWeight: 600,
        background: v ? "#22c55e" : "#ef4444",
        color: "#fff",
      }}
    >
      {String(v)}
    </span>
  );
}

const baseBtn: React.CSSProperties = {
  padding: "0.3rem 0.7rem",
  marginRight: "0.4rem",
  marginBottom: "0.4rem",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.78rem",
  fontFamily: "monospace",
  color: "#fff",
};

const fieldbox: React.CSSProperties = {
  marginBottom: "0.75rem",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: "0.85rem",
  marginBottom: "0.2rem",
  fontWeight: 500,
};

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "0.4rem 0.5rem",
    border: hasError ? "1px solid #ef4444" : "1px solid #cbd5e1",
    borderRadius: "4px",
    boxSizing: "border-box",
    fontSize: "0.875rem",
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" style={{ color: "#ef4444", margin: "2px 0 0", fontSize: "0.78rem" }}>
      {message}
    </p>
  );
}

function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <fieldset
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "0.75rem",
        marginBottom: "0.9rem",
      }}
    >
      <legend style={{ fontFamily: "monospace", fontSize: "0.85rem", padding: "0 4px" }}>{title}</legend>
      {children}
    </fieldset>
  );
}

// ─── formState debug panel ────────────────────────────────────────────────────

function FormStatePanel({
  formState,
}: {
  formState: ValfuseFormState<AllFeaturesFormValues>;
}) {
  const errorEntries = Object.entries(formState.errors) as [
    keyof AllFeaturesFormValues,
    NonNullable<ValfuseFormState<AllFeaturesFormValues>["errors"][keyof AllFeaturesFormValues]>,
  ][];

  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        padding: "0.875rem",
        fontSize: "0.8rem",
      }}
    >
      <h4 style={{ margin: "0 0 0.6rem", fontFamily: "monospace", color: "#1e293b" }}>formState</h4>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {(
            [
              ["isValid", <Badge key="iv" v={formState.isValid} />],
              ["isDirty", <Badge key="id" v={formState.isDirty} />],
              ["isSubmitting", <Badge key="ism" v={formState.isSubmitting} />],
              ["isSubmitted", <Badge key="iss" v={formState.isSubmitted} />],
              ["isSubmitSuccessful", <Badge key="issu" v={formState.isSubmitSuccessful} />],
              ["submitCount", <strong key="sc">{formState.submitCount}</strong>],
              [
                "dirtyFields",
                <code key="df" style={{ fontSize: "0.72rem" }}>
                  {JSON.stringify(formState.dirtyFields)}
                </code>,
              ],
              [
                "touchedFields",
                <code key="tf" style={{ fontSize: "0.72rem" }}>
                  {JSON.stringify(formState.touchedFields)}
                </code>,
              ],
              [
                "defaultValues",
                <code key="dv" style={{ fontSize: "0.72rem" }}>
                  {JSON.stringify(formState.defaultValues)}
                </code>,
              ],
            ] as [string, React.ReactNode][]
          ).map(([key, val]) => (
            <tr key={key} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td
                style={{
                  padding: "3px 8px 3px 0",
                  fontFamily: "monospace",
                  color: "#7c3aed",
                  whiteSpace: "nowrap",
                  verticalAlign: "top",
                }}
              >
                {key}
              </td>
              <td style={{ padding: "3px 0", wordBreak: "break-all" }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* errors */}
      <div style={{ marginTop: "0.6rem" }}>
        <span style={{ fontFamily: "monospace", color: "#7c3aed" }}>errors</span>
        {errorEntries.length === 0 ? (
          <span style={{ marginLeft: "6px", color: "#64748b", fontSize: "0.75rem" }}>
            {"{}"}
          </span>
        ) : (
          <div style={{ marginTop: "4px" }}>
            {errorEntries.map(([field, err]) => (
              <div
                key={field}
                style={{
                  padding: "3px 8px",
                  marginBottom: "2px",
                  background: "#fee2e2",
                  borderRadius: "4px",
                  lineHeight: 1.4,
                }}
              >
                <strong style={{ fontFamily: "monospace" }}>{field}</strong>:{" "}
                {err.message}
                {err.code && (
                  <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "0.72rem" }}>
                    [{err.code}]
                  </span>
                )}
                {err.type && (
                  <span style={{ color: "#94a3b8", marginLeft: "4px", fontSize: "0.72rem" }}>
                    type={err.type}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── mode selector ────────────────────────────────────────────────────────────

const ALL_MODES: ValfuseFormMode[] = ["onSubmit", "onBlur", "onChange", "onTouched", "all"];

const MODE_DESC: Record<ValfuseFormMode, string> = {
  onSubmit: "validasi hanya saat submit",
  onBlur: "validasi saat field blur",
  onChange: "validasi setiap perubahan",
  onTouched: "blur pertama, lalu onChange",
  all: "onChange + onBlur",
};

function ModeSelector({
  value,
  onChange,
}: {
  value: ValfuseFormMode;
  onChange: (m: ValfuseFormMode) => void;
}) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        padding: "0.75rem 1rem",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "8px",
      }}
    >
      <strong style={{ fontSize: "0.875rem" }}>Validation Mode:</strong>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
        {ALL_MODES.map((m) => (
          <label
            key={m}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              cursor: "pointer",
              padding: "4px 10px",
              borderRadius: "6px",
              background: value === m ? "#2563eb" : "#fff",
              color: value === m ? "#fff" : "#374151",
              border: "1px solid",
              borderColor: value === m ? "#2563eb" : "#d1d5db",
              fontSize: "0.82rem",
              fontFamily: "monospace",
            }}
          >
            <input
              type="radio"
              name="af-mode"
              value={m}
              checked={value === m}
              onChange={() => onChange(m)}
              style={{ display: "none" }}
            />
            {m}
          </label>
        ))}
      </div>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.78rem", color: "#1e40af" }}>
        <strong>{value}</strong>: {MODE_DESC[value]} —{" "}
        <em>Mengganti mode akan me-reset form (re-mount via <code>key</code>).</em>
      </p>
    </div>
  );
}

// ─── Inner form (receives mode as prop, remounted when mode changes) ──────────

function AllFeaturesFormInner({ mode }: { mode: ValfuseFormMode }) {
  const form = useValfuseForm<AllFeaturesFormValues>({
    schema,
    defaultValues: DEFAULT_VALUES,
    mode,
  });

  // ── watch: callback subscription ─────────────────────────────────────────
  // form.watch(callback) returns an unsubscribe function. We clean up in useEffect.
  const [watchLog, setWatchLog] = useState<WatchEntry[]>([]);

  useEffect(() => {
    const unsub = form.watch((values, info) => {
      setWatchLog((prev) =>
        [{ name: info.name, snapshot: { ...values } }, ...prev].slice(0, 5)
      );
    });
    return () => unsub();
    // form.watch adalah callback stabil (didefinisikan dengan useCallback di hook)
    // sehingga aman menggunakan deps [] — effect ini hanya dijalankan sekali saat mount.
  }, []);

  // ── watch: snapshot overloads (read on every render) ─────────────────────
  // These read from valuesRef.current — not reactive by themselves,
  // but update whenever watchLog state change triggers a re-render.
  const watchAll = form.watch();
  const watchedUsername = form.watch("username");
  const watchedMultiple = form.watch(["email", "priority"]);

  // ── submit handler ────────────────────────────────────────────────────────
  const [submitResult, setSubmitResult] = useState<string>("");

  const onSubmit = form.handleSubmit(async (values) => {
    // Simulate an async API call
    await new Promise<void>((res) => setTimeout(res, 800));
    setSubmitResult(JSON.stringify(values, null, 2));
  });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
        gap: "2rem",
        alignItems: "start",
      }}
    >
      {/* ── Left column: form + controls ─────────────────────────────────── */}
      <div>

        {/* 1. register() ─────────────────────────────────────────────────── */}
        <Section title={<>register() — native inputs</>}>
          <form id="all-features-form" onSubmit={onSubmit}>
            {/* username */}
            <div style={fieldbox}>
              <label htmlFor="af-username" style={label}>
                Username{" "}
                <span style={{ color: "#7c3aed", fontWeight: 400, fontSize: "0.75rem" }}>
                  (transform: toLowerCase + trim)
                </span>
              </label>
              <input
                id="af-username"
                placeholder="contoh: JohnDoe"
                style={inputStyle(!!form.formState.errors.username)}
                {...form.register("username")}
              />
              <FieldError message={form.formState.errors.username?.message} />
            </div>

            {/* email */}
            <div style={fieldbox}>
              <label htmlFor="af-email" style={label}>Email</label>
              <input
                id="af-email"
                placeholder="user@example.com"
                style={inputStyle(!!form.formState.errors.email)}
                {...form.register("email")}
              />
              <FieldError message={form.formState.errors.email?.message} />
            </div>

            {/* bio — textarea with register() */}
            <div style={fieldbox}>
              <label htmlFor="af-bio" style={label}>
                Bio{" "}
                <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.75rem" }}>
                  (opsional, maks 160 karakter)
                </span>
              </label>
              <textarea
                id="af-bio"
                rows={3}
                placeholder="Ceritakan sedikit tentang dirimu..."
                style={{
                  ...inputStyle(!!form.formState.errors.bio),
                  resize: "vertical",
                }}
                {...form.register("bio")}
              />
              <FieldError message={form.formState.errors.bio?.message} />
            </div>
          </form>
        </Section>

        {/* 2. ValfuseController ──────────────────────────────────────────── */}
        <Section title={<>control + ValfuseController — custom select</>}>
          <ValfuseController
            control={form.control}
            name="priority"
            render={({ field, fieldState }) => (
              <div style={fieldbox}>
                <label htmlFor="af-priority" style={label}>Priority</label>
                <select
                  id="af-priority"
                  value={field.value as string}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value as AllFeaturesFormValues["priority"]
                    )
                  }
                  onBlur={field.onBlur}
                  style={inputStyle(!!fieldState.error)}
                >
                  <option value="">-- Pilih priority --</option>
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />
        </Section>

        {/* handleSubmit ──────────────────────────────────────────────────── */}
        <div style={{ marginBottom: "0.9rem" }}>
          <button
            type="submit"
            form="all-features-form"
            disabled={form.formState.isSubmitting}
            style={{
              padding: "0.55rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            {form.formState.isSubmitting ? "⏳ Menyimpan..." : "Submit"}
          </button>

          {form.formState.isSubmitSuccessful && submitResult && (
            <pre
              style={{
                marginTop: "0.5rem",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "6px",
                padding: "0.6rem",
                fontSize: "0.78rem",
                whiteSpace: "pre-wrap",
              }}
            >
              ✅ Submit berhasil!{"\n"}
              {submitResult}
            </pre>
          )}
        </div>

        {/* 3. setValue() ─────────────────────────────────────────────────── */}
        <Section title="setValue()">
          <button
            style={{ ...baseBtn, background: "#7c3aed" }}
            onClick={() => form.setValue("username", "prefilluser")}
          >
            setValue("username", "prefilluser")
          </button>
          <button
            style={{ ...baseBtn, background: "#7c3aed" }}
            onClick={() =>
              form.setValue("email", "valid@example.com", { shouldValidate: true })
            }
          >
            setValue("email", valid + shouldValidate)
          </button>
          <button
            style={{ ...baseBtn, background: "#dc2626" }}
            onClick={() =>
              form.setValue("email", "bukan-email", { shouldValidate: true })
            }
          >
            setValue("email", invalid + shouldValidate)
          </button>
        </Section>

        {/* 4. trigger() ──────────────────────────────────────────────────── */}
        <Section title="trigger()">
          <button
            style={{ ...baseBtn, background: "#0891b2" }}
            onClick={() => form.trigger()}
          >
            trigger() — semua field
          </button>
          <button
            style={{ ...baseBtn, background: "#0891b2" }}
            onClick={() => form.trigger("email")}
          >
            trigger("email")
          </button>
          <button
            style={{ ...baseBtn, background: "#0891b2" }}
            onClick={() => form.trigger(["username", "email"])}
          >
            trigger(["username","email"])
          </button>
        </Section>

        {/* 5. clearErrors() ──────────────────────────────────────────────── */}
        <Section title="clearErrors()">
          <button
            style={{ ...baseBtn, background: "#059669" }}
            onClick={() => form.clearErrors()}
          >
            clearErrors() — semua
          </button>
          <button
            style={{ ...baseBtn, background: "#059669" }}
            onClick={() => form.clearErrors("email")}
          >
            clearErrors("email")
          </button>
          <button
            style={{ ...baseBtn, background: "#059669" }}
            onClick={() => form.clearErrors(["username", "email"])}
          >
            clearErrors(["username","email"])
          </button>
        </Section>

        {/* 6. setErrors() ────────────────────────────────────────────────── */}
        <Section title="setErrors() — simulasi error API">
          <button
            style={{ ...baseBtn, background: "#b45309" }}
            onClick={() =>
              form.setErrors({
                username: {
                  message: "Username sudah dipakai",
                  type: "server",
                  code: "username.taken",
                },
                email: {
                  message: "Email sudah terdaftar",
                  type: "server",
                  code: "email.duplicate",
                },
              })
            }
          >
            setErrors(username + email)
          </button>
          <button
            style={{ ...baseBtn, background: "#b45309" }}
            onClick={() =>
              form.setErrors({
                priority: {
                  message: "Priority tidak diizinkan",
                  type: "server",
                  code: "priority.forbidden",
                  metadata: { allowed: ["low", "medium"] },
                },
              })
            }
          >
            setErrors(priority + metadata)
          </button>
        </Section>

        {/* 7. reset() ────────────────────────────────────────────────────── */}
        <Section title="reset()">
          <button
            style={{ ...baseBtn, background: "#64748b" }}
            onClick={() => {
              form.reset();
              setSubmitResult("");
            }}
          >
            reset() — ke defaultValues
          </button>
          <button
            style={{ ...baseBtn, background: "#64748b" }}
            onClick={() => {
              form.reset({ username: "johndoe", email: "john@doe.com" });
              setSubmitResult("");
            }}
          >
            reset(partial) — username + email
          </button>
        </Section>
      </div>

      {/* ── Right column: formState panel + watch ────────────────────────────── */}
      <div>
        {/* formState debug panel */}
        <FormStatePanel formState={form.formState} />

        {/* watch: callback subscription log ─────────────────────────────── */}
        <Section title="watch(callback) — log perubahan">
          {watchLog.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: "0.78rem", fontStyle: "italic", margin: 0 }}>
              Belum ada perubahan...
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
              {watchLog.map((entry, i) => (
                <div
                  key={i}
                  style={{
                    background: i === 0 ? "#eff6ff" : "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "4px",
                    padding: "3px 7px",
                    fontSize: "0.73rem",
                    lineHeight: 1.4,
                  }}
                >
                  <span style={{ fontFamily: "monospace", color: "#7c3aed" }}>
                    [{entry.name ?? "—"}]
                  </span>{" "}
                  <code style={{ wordBreak: "break-all" }}>
                    {JSON.stringify(entry.snapshot)}
                  </code>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* watch: snapshot overloads ─────────────────────────────────────── */}
        <Section title="watch() — snapshot overloads">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                <th style={{ textAlign: "left", padding: "3px 6px", fontFamily: "monospace" }}>
                  call
                </th>
                <th style={{ textAlign: "left", padding: "3px 6px" }}>return</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td
                  style={{ padding: "4px 6px", fontFamily: "monospace", color: "#7c3aed" }}
                >
                  watch()
                </td>
                <td style={{ padding: "4px 6px", wordBreak: "break-all" }}>
                  <code style={{ fontSize: "0.72rem" }}>{JSON.stringify(watchAll)}</code>
                </td>
              </tr>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td
                  style={{ padding: "4px 6px", fontFamily: "monospace", color: "#7c3aed" }}
                >
                  watch("username")
                </td>
                <td style={{ padding: "4px 6px" }}>
                  <code style={{ fontSize: "0.72rem" }}>
                    {JSON.stringify(watchedUsername)}
                  </code>
                </td>
              </tr>
              <tr>
                <td
                  style={{ padding: "4px 6px", fontFamily: "monospace", color: "#7c3aed" }}
                >
                  watch(["email","priority"])
                </td>
                <td style={{ padding: "4px 6px", wordBreak: "break-all" }}>
                  <code style={{ fontSize: "0.72rem" }}>
                    {JSON.stringify(watchedMultiple)}
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </div>
    </div>
  );
}

// ─── Public export — wrapper with mode selector ───────────────────────────────

export function AllFeaturesDemo() {
  const [mode, setMode] = useState<ValfuseFormMode>("onSubmit");

  return (
    <div>
      <ModeSelector value={mode} onChange={setMode} />
      {/* key={mode} remounts AllFeaturesFormInner when mode changes */}
      <AllFeaturesFormInner key={mode} mode={mode} />
    </div>
  );
}

