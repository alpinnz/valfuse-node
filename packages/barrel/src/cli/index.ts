import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import YAML from "yaml";
import { generateBarrel } from "../generator";
import type { BarrelGeneratorConfigInput } from "../types";

interface CliOptions {
  configFile?: string;
  check: boolean;
  help: boolean;
}

const HELP = [
  "valfuse-barrel - generate a TypeScript barrel from one directory",
  "",
  "Usage:",
  "  valfuse-barrel [--config <file>] [--check]",
  "",
  "Options:",
  "  --config <file>  Read generator options from a YAML file",
  "  --check          Exit with an error when the generated file is stale",
  "  --help, -h       Show this help",
  "",
  "The default config file is valfuse-barrel.yaml. Defaults for omitted options:",
  "  input_dir:   src",
  "  output_file: src/index.ts",
  "  include:     all eligible direct-child .ts/.tsx files",
  "  exclude:     []",
].join("\n");

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    // eslint-disable-next-line no-console
    console.log(HELP);
    return;
  }

  const cwd = process.cwd();
  const config = await readConfig(cwd, options.configFile);
  const result = await generateBarrel({ cwd, config, check: options.check });

  // eslint-disable-next-line no-console
  console.log(
    (options.check
      ? "Barrel is up to date"
      : result.changed
        ? "Generated barrel"
        : "Barrel is up to date") +
      ": " +
      relative(cwd, result.outputFile) +
      " (" +
      result.moduleCount +
      " modules)"
  );
}

function parseArguments(args: string[]): CliOptions {
  const options: CliOptions = { check: false, help: false };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--check") {
      options.check = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    if (argument === "--config") {
      const configFile = args[index + 1];
      if (!configFile || configFile.startsWith("--")) {
        throw new Error('Option "--config" requires a file path.');
      }
      options.configFile = configFile;
      index += 1;
      continue;
    }
    if (argument.startsWith("--config=")) {
      const configFile = argument.slice("--config=".length);
      if (!configFile) throw new Error('Option "--config" requires a file path.');
      options.configFile = configFile;
      continue;
    }
    throw new Error('Unknown option "' + argument + '". Use --help to see available options.');
  }

  return options;
}

async function readConfig(cwd: string, configFile?: string): Promise<BarrelGeneratorConfigInput> {
  const filePath = resolve(cwd, configFile ?? "valfuse-barrel.yaml");
  let content: string;
  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(
        "Barrel config file not found: " +
          relative(cwd, filePath) +
          ". Create it or pass --config <file>.",
        { cause: error }
      );
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(content);
  } catch (error) {
    const detail = error instanceof Error ? ": " + error.message : "";
    throw new Error(
      "Could not parse YAML barrel config " + relative(cwd, filePath) + detail + ".",
      { cause: error }
    );
  }

  return parseConfigObject(parsed, filePath);
}

function parseConfigObject(value: unknown, filePath: string): BarrelGeneratorConfigInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Barrel config must be a YAML mapping: " + filePath);
  }

  const config: BarrelGeneratorConfigInput = {};
  for (const [key, entry] of Object.entries(value)) {
    if (key === "input_dir" || key === "output_file") {
      if (typeof entry !== "string" || entry.trim() === "") {
        throw new Error('Barrel config option "' + key + '" must be a non-empty string.');
      }
      if (key === "input_dir") config.inputDir = entry;
      if (key === "output_file") config.outputFile = entry;
      continue;
    }

    if (key === "include" || key === "exclude") {
      if (!Array.isArray(entry) || !entry.every((fileName) => typeof fileName === "string")) {
        throw new Error('Barrel config option "' + key + '" must be a list of file names.');
      }
      if (key === "include") config.include = entry;
      if (key === "exclude") config.exclude = entry;
      continue;
    }

    throw new Error('Unknown barrel config option "' + key + '" in ' + filePath + ".");
  }

  return config;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error("valfuse-barrel: " + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
