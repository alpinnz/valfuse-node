import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import YAML from "yaml";
import { generateAssets } from "../generator";
import type { AssetGeneratorConfigInput } from "../types";

interface CliOptions {
  configFile?: string;
  check: boolean;
  help: boolean;
}

const HELP = `valfuse-assets - generate typed TypeScript asset paths

Usage:
  valfuse-assets [--config <file>] [--check]

Options:
  --config <file>  Read generator options from a YAML file
  --check          Exit with an error when the generated file is stale
  --help, -h       Show this help

The default config file is valfuse-assets.yaml. Defaults for omitted options:
  input_dir:   public/assets
  output_file: src/assets/assets.ts
  base_path:   /assets
`;

async function main(): Promise<void> {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    // eslint-disable-next-line no-console
    console.log(HELP);
    return;
  }

  const cwd = process.cwd();
  const config = await readConfig(cwd, options.configFile);
  const result = await generateAssets({ cwd, config, check: options.check });

  // eslint-disable-next-line no-console
  console.log(
    `${options.check ? "Asset registry is up to date" : result.changed ? "Generated asset registry" : "Asset registry is up to date"}: ` +
      `${relative(cwd, result.outputFile)} (${result.assetCount} assets)`
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

    throw new Error(`Unknown option "${argument}". Use --help to see available options.`);
  }

  return options;
}

async function readConfig(cwd: string, configFile?: string): Promise<AssetGeneratorConfigInput> {
  const filePath = resolve(cwd, configFile ?? "valfuse-assets.yaml");
  let content: string;

  try {
    content = await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(
        `Asset config file not found: ${relative(cwd, filePath)}. Create it or pass --config <file>.`,
        { cause: error }
      );
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = YAML.parse(content);
  } catch (error) {
    const detail = error instanceof Error ? `: ${error.message}` : "";
    throw new Error(`Could not parse YAML asset config ${relative(cwd, filePath)}${detail}.`, {
      cause: error,
    });
  }

  return parseConfigObject(parsed, filePath);
}

function parseConfigObject(value: unknown, filePath: string): AssetGeneratorConfigInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Asset config must be a YAML mapping: ${filePath}`);
  }

  const config: AssetGeneratorConfigInput = {};

  for (const [key, entry] of Object.entries(value)) {
    if (key !== "input_dir" && key !== "output_file" && key !== "base_path") {
      throw new Error(`Unknown asset config option "${key}" in ${filePath}.`);
    }
    if (typeof entry !== "string" || entry.trim() === "") {
      throw new Error(`Asset config option "${key}" must be a non-empty string.`);
    }

    if (key === "input_dir") config.inputDir = entry;
    if (key === "output_file") config.outputFile = entry;
    if (key === "base_path") config.basePath = entry;
  }

  return config;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

main().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(`valfuse-assets: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
