import { assets, type AssetPath } from "../../assets/assets";

const assetExamples: Array<{ label: string; path: AssetPath }> = [
  { label: "Brand mark from public/assets", path: assets.brand.valfuse },
  { label: "Nested icon from public/assets", path: assets.icons.check },
];

export function AssetsDemo() {
  return (
    <div>
      <p>
        <code>@valfuse-node/assets</code> scans public files and generates a typed URL registry in
        <code>src/assets/assets.ts</code>.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {assetExamples.map(({ label, path }) => (
          <figure
            key={path}
            style={{
              alignItems: "center",
              border: "1px solid #cbd5e1",
              borderRadius: "0.75rem",
              display: "flex",
              gap: "0.75rem",
              margin: 0,
              maxWidth: "25rem",
              padding: "1rem",
            }}
          >
            <img src={path} alt="" width="48" height="48" />
            <figcaption>
              <strong>{label}</strong>
              <br />
              <code>{path}</code>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
