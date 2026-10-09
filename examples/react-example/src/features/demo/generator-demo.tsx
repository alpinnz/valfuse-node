const generators = [
  {
    packageName: "@valfuse-node/assets",
    command: "npm run assets:generate",
    output: "src/assets/assets.ts",
  },
  {
    packageName: "@valfuse-node/barrel",
    command: "npm run barrel:generate",
    output: "src/features/demo/index.ts",
  },
  {
    packageName: "@valfuse-node/localization",
    command: "npm run localization:generate",
    output: "src/assets/localizations/",
  },
  {
    packageName: "@valfuse-node/core/assets + @valfuse-node/core/barrel",
    command: "npm run codegen:core",
    output: "the same generated asset and barrel files through the Node.js API",
  },
];

export function GeneratorDemo() {
  return (
    <div>
      <p>
        The standalone Node.js CLIs run before dev, build, and typecheck. Their output is used by
        this app; the barrel file is also the import point for the demo sections above. The
        <code>codegen:core</code> command runs the same generation through core's Node.js subpaths.
      </p>
      <ul>
        {generators.map(({ packageName, command, output }) => (
          <li key={packageName} style={{ marginBottom: "0.75rem" }}>
            <strong>{packageName}</strong>
            <br />
            <code>{command}</code> generates <code>{output}</code>.
          </li>
        ))}
      </ul>
      <p>
        The umbrella package exposes the runtime APIs from <code>@valfuse-node/core</code>. Its
        filesystem generators are explicit Node.js subpaths: <code>@valfuse-node/core/assets</code>
        and <code>@valfuse-node/core/barrel</code>.
      </p>
      <pre
        style={{
          background: "#f1f5f9",
          borderRadius: "0.5rem",
          overflowX: "auto",
          padding: "1rem",
        }}
      >
        {`import { generateAssets } from "@valfuse-node/core/assets";
import { generateBarrel } from "@valfuse-node/core/barrel";`}
      </pre>
      <p>
        Run <code>npm run generate:check</code> or <code>npm run codegen:core:check</code> to verify
        generated output without writing it.
      </p>
    </div>
  );
}
