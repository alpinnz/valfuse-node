import { LocalizationProvider, localStorageStrategy } from "@valfuse-node/core";
import { UserIdForm } from "./features/users/user-id-form";
import { UserObjectForm } from "./features/users/user-object-form";
import {
  AllFeaturesDemo,
  AssetsDemo,
  FormDomainDemo,
  GeneratorDemo,
  LocalizationDemo,
} from "./features/demo";
import localizationManifest from "./assets/localizations/localization";

const sectionStyle = { marginBottom: "3rem" };
const descriptionStyle = { color: "#64748b", marginTop: 0 };

export function App() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        margin: "0 auto",
        maxWidth: "1400px",
        padding: "2rem",
      }}
    >
      <header style={sectionStyle}>
        <p style={{ color: "#64748b", fontFamily: "monospace", marginBottom: "0.5rem" }}>
          @valfuse-node examples / React
        </p>
        <h1 style={{ margin: "0 0 0.5rem" }}>Library playground</h1>
        <p style={descriptionStyle}>
          Structured, runnable examples for the form domain, React adapter, localization runtime,
          asset registry, barrel generator, and core facade.
        </p>
      </header>

      <nav
        aria-label="Library demonstrations"
        style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}
      >
        <a href="#assets">Assets</a>
        <a href="#form-domain">Form domain</a>
        <a href="#localization">Localization</a>
        <a href="#react-adapter">React adapter</a>
        <a href="#generators">Generators and core</a>
      </nav>

      <section id="assets" style={sectionStyle}>
        <h2>Typed public assets</h2>
        <AssetsDemo />
      </section>

      <section id="form-domain" style={sectionStyle}>
        <h2>Framework-neutral form APIs</h2>
        <FormDomainDemo />
      </section>

      <section id="localization" style={sectionStyle}>
        <h2>Localization runtime</h2>
        <p style={descriptionStyle}>
          The React adapter adds the provider, hook, locale storage strategies, and typed accessors.
        </p>
        <LocalizationProvider
          manifest={localizationManifest}
          storage={localStorageStrategy({ key: "valfuse_locale" })}
          initialLocale="en"
        >
          <LocalizationDemo />
        </LocalizationProvider>
      </section>

      <section id="react-adapter" style={sectionStyle}>
        <h2>React adapter and core facade</h2>
        <p style={descriptionStyle}>
          The full feature form uses <code>useReactValfuseForm</code> from the core facade. The
          object form imports <code>useValfuseForm</code> and <code>ValfuseController</code>{" "}
          directly from <code>@valfuse-node/react</code>.
        </p>
        <AllFeaturesDemo />

        <h3>Controlled fields: object value and ID value</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3rem" }}>
          <section>
            <h4>Role object</h4>
            <UserObjectForm />
          </section>
          <section>
            <h4>Role ID</h4>
            <UserIdForm />
          </section>
        </div>
      </section>

      <section id="generators" style={sectionStyle}>
        <h2>Build-time generators and core codegen subpaths</h2>
        <GeneratorDemo />
      </section>
    </main>
  );
}
