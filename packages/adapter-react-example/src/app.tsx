import { UserObjectForm } from "./features/users/user-object-form";
import { UserIdForm } from "./features/users/user-id-form";

export function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <section style={{ marginBottom: "2rem" }}>
        <h1>Valfuse Adapter React Example</h1>
        <p>
          Example penggunaan native schema, <code>register()</code>, <code>Controller</code>, dan{" "}
          <code>setErrors()</code>.
        </p>
      </section>

      <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
        <section>
          <h2>Object Value Example</h2>
          <p style={{ color: "#666", fontSize: "0.875rem" }}>
            Role disimpan sebagai object <code>{"{ id, name }"}</code>
          </p>
          <UserObjectForm />
        </section>

        <section>
          <h2>ID Value Example</h2>
          <p style={{ color: "#666", fontSize: "0.875rem" }}>
            Role disimpan sebagai ID string
          </p>
          <UserIdForm />
        </section>
      </div>
    </main>
  );
}

