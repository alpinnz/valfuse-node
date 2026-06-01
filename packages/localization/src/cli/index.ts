import { runInit } from "./init";
import { runGenerate } from "./generate";
import { runValidate } from "./validate";
import { runClean } from "./clean";
import { runCoverage } from "./coverage";

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);

  switch (command) {
    case "init":
      await runInit();
      return;

    case "generate":
      await runGenerate({ watch: rest.includes("--watch") });
      return;

    case "validate":
      await runValidate();
      return;

    case "clean":
      await runClean();
      return;

    case "coverage": {
      const formatArg = rest.find((arg) => arg.startsWith("--format="));
      const outputArg = rest.find((arg) => arg.startsWith("--output="));
      await runCoverage({
        format: formatArg
          ? (formatArg.replace("--format=", "") as "json" | "html")
          : undefined,
        output: outputArg ? outputArg.replace("--output=", "") : undefined,
      });
      return;
    }

    default:
      throw new Error(
        `Unknown command: ${command ?? "<none>"}. ` +
          `Available: init, generate, validate, clean, coverage.`
      );
  }
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});

