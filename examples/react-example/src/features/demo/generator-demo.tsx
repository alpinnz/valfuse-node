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
];

export function GeneratorDemo() {
  return (
    <div>
      <p>
        The standalone Node.js CLIs run before dev, build, and typecheck. Their output is used by
        this app; the barrel file is also the import point for the demo sections above.
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
        The umbrella package exposes runtime APIs from <code>@valfuse-node/core</code>. Run{" "}
        <code>npm run generate:check</code> to verify generated output without writing it.
      </p>
    </div>
  );
}
