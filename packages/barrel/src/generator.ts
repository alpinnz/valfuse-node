import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { basename, dirname, extname, relative, resolve } from "node:path";
import type {
  BarrelGeneratorConfig,
  BarrelGeneratorConfigInput,
  GenerateBarrelOptions,
  GenerateBarrelResult,
} from "./types";

export const DEFAULT_BARREL_GENERATOR_CONFIG: Readonly<BarrelGeneratorConfig> = Object.freeze({
  inputDir: "src",
  outputFile: "src/index.ts",
  include: Object.freeze([]),
  exclude: Object.freeze([]),
});

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);
const DEFAULT_EXCLUDED_FILE = /(?:\.test|\.spec|\.stories)\.(?:ts|tsx)$/;

/** Generate a deterministic TypeScript barrel from direct child modules. */
export async function generateBarrel(
  options: GenerateBarrelOptions = {}
): Promise<GenerateBarrelResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const config = normalizeConfig(options.config);
  const inputDir = resolve(cwd, config.inputDir);
  const outputFile = resolve(cwd, config.outputFile);

  let inputStats;
  try {
    inputStats = await lstat(inputDir);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error("Barrel input directory not found: " + inputDir, { cause: error });
    }
    throw error;
  }

  if (!inputStats.isDirectory()) {
    throw new Error("Barrel input must be a directory and cannot be a symlink: " + inputDir);
  }

  const modules = await collectModules(inputDir, outputFile, config);
  if (modules.length === 0) {
    throw new Error(
      "No TypeScript modules found in " +
        relative(cwd, inputDir) +
        '. Add eligible .ts/.tsx modules or configure "include".'
    );
  }

  const source = renderBarrel(modules, outputFile);
  const existingSource = await readExistingFile(outputFile);
  const changed = existingSource !== source;

  if (options.check) {
    if (changed) {
      throw new Error(
        "Generated barrel is missing or out of date: " +
          relative(cwd, outputFile) +
          '. Run "npx valfuse-barrel" to regenerate it.'
      );
    }

    return { moduleCount: modules.length, outputFile, changed: false };
  }

  if (changed) {
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, source, "utf8");
  }

  return { moduleCount: modules.length, outputFile, changed };
}

function normalizeConfig(input: BarrelGeneratorConfigInput = {}): BarrelGeneratorConfig {
  const include = input.include ?? DEFAULT_BARREL_GENERATOR_CONFIG.include;
  const exclude = input.exclude ?? DEFAULT_BARREL_GENERATOR_CONFIG.exclude;
  const config: BarrelGeneratorConfig = {
    ...DEFAULT_BARREL_GENERATOR_CONFIG,
    ...input,
    include: Array.isArray(include) ? [...include] : include,
    exclude: Array.isArray(exclude) ? [...exclude] : exclude,
  };

  for (const key of ["inputDir", "outputFile"] as const) {
    const value = config[key];
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error('Config "' + key + '" must be a non-empty string.');
    }
  }

  if (extname(config.outputFile).toLowerCase() !== ".ts") {
    throw new Error('Config "outputFile" must have a .ts extension.');
  }

  validateFileNames("include", config.include);
  validateFileNames("exclude", config.exclude);

  const excludedFiles = new Set(config.exclude);
  for (const fileName of config.include) {
    if (excludedFiles.has(fileName)) {
      throw new Error('Module "' + fileName + '" cannot appear in both "include" and "exclude".');
    }
  }

  return config;
}

function validateFileNames(option: "include" | "exclude", fileNames: readonly string[]): void {
  if (!Array.isArray(fileNames)) {
    throw new Error('Config "' + option + '" must be a list of TypeScript file names.');
  }

  const seen = new Set<string>();
  for (const fileName of fileNames) {
    if (
      typeof fileName !== "string" ||
      fileName.trim() === "" ||
      basename(fileName) !== fileName ||
      !SOURCE_EXTENSIONS.has(extname(fileName).toLowerCase()) ||
      !isEligibleModule(fileName)
    ) {
      throw new Error(
        'Config "' + option + '" entries must be eligible .ts/.tsx file names without directories.'
      );
    }
    if (seen.has(fileName))
      throw new Error('Duplicate module "' + fileName + '" in "' + option + '".');
    seen.add(fileName);
  }
}

async function collectModules(
  inputDir: string,
  outputFile: string,
  config: BarrelGeneratorConfig
): Promise<string[]> {
  const entries = await readdir(inputDir, { withFileTypes: true });
  entries.sort((left, right) => compareNames(left.name, right.name));

  const availableFiles = entries
    .filter((entry) => entry.isFile() && isEligibleModule(entry.name))
    .map((entry) => entry.name)
    .filter((fileName) => !pathsEqual(resolve(inputDir, fileName), outputFile));
  const availableSet = new Set(availableFiles);

  for (const fileName of config.include) {
    if (!availableSet.has(fileName)) {
      throw new Error("Included TypeScript module not found: " + resolve(inputDir, fileName));
    }
  }

  const includedFiles = config.include.length > 0 ? config.include : availableFiles;
  const excludedFiles = new Set(config.exclude);
  return includedFiles
    .filter((fileName) => !excludedFiles.has(fileName))
    .sort(compareNames)
    .map((fileName) => resolve(inputDir, fileName));
}

function isEligibleModule(fileName: string): boolean {
  const extension = extname(fileName).toLowerCase();
  return (
    SOURCE_EXTENSIONS.has(extension) &&
    !fileName.startsWith(".") &&
    !/^index\.(?:ts|tsx)$/i.test(fileName) &&
    !/\.d\.ts$/i.test(fileName) &&
    !DEFAULT_EXCLUDED_FILE.test(fileName)
  );
}

function renderBarrel(moduleFiles: string[], outputFile: string): string {
  const outputDirectory = dirname(outputFile);
  const exports = moduleFiles.map((moduleFile) => {
    const relativePath = relative(outputDirectory, moduleFile)
      .replace(/\.(?:ts|tsx)$/i, "")
      .replace(/\\/g, "/");
    const modulePath = relativePath.startsWith(".") ? relativePath : "./" + relativePath;
    return "export * from " + JSON.stringify(modulePath) + ";";
  });

  return [
    "/**",
    " * Generated by @valfuse-node/barrel. Do not edit manually.",
    " */",
    ...exports,
    "",
  ].join("\n");
}

async function readExistingFile(filePath: string): Promise<string | undefined> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function pathsEqual(left: string, right: string): boolean {
  const resolvedLeft = resolve(left);
  const resolvedRight = resolve(right);
  return process.platform === "win32"
    ? resolvedLeft.toLowerCase() === resolvedRight.toLowerCase()
    : resolvedLeft === resolvedRight;
}

function compareNames(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
