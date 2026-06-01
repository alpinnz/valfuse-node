import { LocalizationProvider, localStorageStrategy } from "@valfuse-node/react";
import { UserObjectForm } from "./features/users/user-object-form";
import { UserIdForm } from "./features/users/user-id-form";
import { AllFeaturesDemo } from "./features/demo/all-features-form";
import { LocalizationDemo } from "./features/localization/localization-demo";
import localizationManifest from "./assets/localizations/localization";

export function App() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "1400px" }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ margin: "0 0 0.5rem" }}>valfuse-node — Demo</h1>
        <p style={{ color: "#64748b", margin: 0 }}>
          Form validation (<code>@valfuse-node/core</code> +{" "}
          <code>@valfuse-node/react</code>) and i18n localization (
          <code>@valfuse-node/localization</code>) in one monorepo.
        </p>
      </section>

      {/* ── Localization demo ───────────────────────────────────────────── */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>Localization Demo</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
          Live translation preview — switch locale to see all keys resolve from the
          generated <code>localization.ts</code> manifest.
        </p>
        <LocalizationProvider
          manifest={localizationManifest}
          storage={localStorageStrategy({ key: "valfuse_locale" })}
          initialLocale="en"
        >
          <LocalizationDemo />
        </LocalizationProvider>
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "2.5rem" }} />

      {/* ── Form — All Features Demo ────────────────────────────────────── */}
      <section style={{ marginBottom: "3rem" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>Form — All Features Demo</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
          All <code>useValfuseForm</code> APIs in one form — observe{" "}
          <code>formState</code> and <code>watch</code> changes in real time.
        </p>
        <AllFeaturesDemo />
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", marginBottom: "2.5rem" }} />

      {/* ── Controller + Object/ID Value ───────────────────────────────── */}
      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.25rem" }}>Controller + Object / ID Value</h2>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "0 0 1.25rem" }}>
          <code>ValfuseController</code> examples: role as object vs ID string.
        </p>
        <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap" }}>
          <section>
            <h3>Object Value</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Role stored as <code>{"{ id, name }"}</code>
            </p>
            <UserObjectForm />
          </section>
          <section>
            <h3>ID Value</h3>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Role stored as ID string
            </p>
            <UserIdForm />
          </section>
        </div>
      </section>
    </main>
  );
}

