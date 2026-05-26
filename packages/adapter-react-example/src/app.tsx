import { UserObjectForm } from "./features/users/user-object-form";
import { UserIdForm } from "./features/users/user-id-form";
import { AllFeaturesDemo } from "./features/demo/all-features-form";

export function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "1400px" }}>
      <section style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem" }}>Valfuse Adapter React — Example</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Demonstrasi lengkap semua API <code>useValfuseForm</code>:{" "}
          <code>register</code>, <code>control</code>, <code>handleSubmit</code>,{" "}
          <code>formState</code>, <code>setErrors</code>, <code>clearErrors</code>,{" "}
          <code>setValue</code>, <code>trigger</code>, <code>watch</code>, <code>reset</code>,
          dan semua <em>validation mode</em>.
        </p>
      </section>

      {/* ── All-features demo ──────────────────────────────────────────────── */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>All Features Demo</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
          Semua case <code>useValfuseForm</code> dalam satu form — gunakan panel kanan untuk
          mengamati perubahan <code>formState</code> dan <code>watch</code> secara real-time.
        </p>
        <AllFeaturesDemo />
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "2.5rem" }} />

      {/* ── Existing examples ─────────────────────────────────────────────── */}
      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>Controller + Object / ID Value</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
          Contoh <code>ValfuseController</code> dengan nilai role sebagai object vs ID string.
        </p>
        <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
          <section>
            <h3>Object Value</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Role disimpan sebagai object <code>{"{ id, name }"}</code>
            </p>
            <UserObjectForm />
          </section>

          <section>
            <h3>ID Value</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Role disimpan sebagai ID string
            </p>
            <UserIdForm />
          </section>
        </div>
      </section>
    </main>
  );
}

