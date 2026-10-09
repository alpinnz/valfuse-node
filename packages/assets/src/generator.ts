import { lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import type {
  AssetGeneratorConfig,
  AssetGeneratorConfigInput,
  GenerateAssetsOptions,
  GenerateAssetsResult,
} from "./types";

export const DEFAULT_ASSET_GENERATOR_CONFIG: Readonly<AssetGeneratorConfig> = Object.freeze({
  inputDir: "public/assets",
  outputFile: "src/assets/assets.ts",
  basePath: "/assets",
});

interface AssetTreeNode {
  originalName: string;
  children: Map<string, AssetTreeNode>;
  url?: string;
}

interface AssetFile {
  relativePath: string;
}

const IGNORED_SYSTEM_FILES = new Set([".DS_Store", "Thumbs.db", "desktop.ini"]);

/** Generate a stable, typed registry of asset URLs from a directory tree. */
export async function generateAssets(
  options: GenerateAssetsOptions = {}
): Promise<GenerateAssetsResult> {
  const cwd = resolve(options.cwd ?? process.cwd());
  const config = normalizeConfig(options.config);
  const inputDir = resolve(cwd, config.inputDir);
  const outputFile = resolve(cwd, config.outputFile);
  let inputStats;
  try {
    inputStats = await lstat(inputDir);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new Error(`Asset input directory not found: ${inputDir}`, { cause: error });
    }
    throw error;
  }
  if (!inputStats.isDirectory()) {
    throw new Error(`Asset input must be a directory and cannot be a symlink: ${inputDir}`);
  }
  const files = await collectAssetFiles(inputDir, outputFile);
  const tree = createAssetTree(files, config.basePath);
  const source = renderAssetModule(tree);
  const existingSource = await readExistingFile(outputFile);
  const changed = existingSource !== source;

  if (options.check) {
    if (changed) {
      throw new Error(
        `Generated asset registry is missing or out of date: ${relative(cwd, outputFile)}. ` +
          `Run "npx valfuse-assets" to regenerate it.`
      );
    }

    return { assetCount: files.length, outputFile, changed: false };
  }

  if (changed) {
    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, source, "utf8");
  }

  return { assetCount: files.length, outputFile, changed };
}

function normalizeConfig(input: AssetGeneratorConfigInput = {}): AssetGeneratorConfig {
  const config = { ...DEFAULT_ASSET_GENERATOR_CONFIG, ...input };

  for (const [key, value] of Object.entries(config)) {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error(`Config "${key}" must be a non-empty string.`);
    }
  }

  if (/[?#\\]/.test(config.basePath)) {
    throw new Error('Config "basePath" cannot contain a query, fragment, or backslash.');
  }

  if (!config.basePath.startsWith("/") && !/^https?:\/\//i.test(config.basePath)) {
    throw new Error('Config "basePath" must start with "/" or be an absolute HTTP(S) URL.');
  }

  if (/^https?:\/\//i.test(config.basePath)) {
    const url = new URL(config.basePath);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error('Config "basePath" must use HTTP or HTTPS.');
    }
  }

  if (extname(config.outputFile).toLowerCase() !== ".ts") {
    throw new Error('Config "outputFile" must have a .ts extension.');
  }

  return config;
}

async function collectAssetFiles(inputDir: string, outputFile: string): Promise<AssetFile[]> {
  const files: AssetFile[] = [];

  async function visit(directory: string, relativeDirectory: string): Promise<void> {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => compareNames(left.name, right.name));

    for (const entry of entries) {
      if (IGNORED_SYSTEM_FILES.has(entry.name)) continue;

      const absolutePath = resolve(directory, entry.name);
      const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        await visit(absolutePath, relativePath);
        continue;
      }

      // Symlinks and special filesystem entries are skipped so a scan stays
      // inside the configured asset tree and only registers regular files.
      if (!entry.isFile() || pathsEqual(absolutePath, outputFile)) continue;

      files.push({ relativePath });
    }
  }

  await visit(inputDir, "");
  return files;
}

function createAssetTree(files: AssetFile[], basePath: string): AssetTreeNode {
  const root: AssetTreeNode = { originalName: "", children: new Map() };
  const normalizedBasePath = basePath === "/" ? "" : basePath.replace(/\/+$/, "");

  for (const file of files) {
    const segments = file.relativePath.split("/");
    const url = buildAssetUrl(normalizedBasePath, segments);
    let parent = root;

    for (let index = 0; index < segments.length; index += 1) {
      const originalName = segments[index];
      const isFile = index === segments.length - 1;
      const key = toAssetKey(originalName, isFile);
      let child = parent.children.get(key);

      if (child && child.originalName !== originalName) {
        throw new Error(
          `Asset names "${child.originalName}" and "${originalName}" both map to "${key}". ` +
            `Rename one path segment so generated keys stay unique.`
        );
      }

      if (!child) {
        child = { originalName, children: new Map() };
        parent.children.set(key, child);
      }

      if (isFile) {
        if (child.url !== undefined || child.children.size > 0) {
          throw new Error(
            `Asset path "${file.relativePath}" collides with another generated asset key.`
          );
        }

        child.url = url;
      } else if (child.url !== undefined) {
        throw new Error(
          `Asset directory "${file.relativePath}" collides with another generated asset key.`
        );
      }

      parent = child;
    }
  }

  return root;
}

function toAssetKey(pathSegment: string, isFile: boolean): string {
  const name = isFile
    ? pathSegment.slice(0, pathSegment.length - extname(pathSegment).length)
    : pathSegment;
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
  const words = normalized.match(/[A-Za-z0-9]+/g);

  if (!words || words.length === 0) {
    throw new Error(`Asset path segment "${pathSegment}" cannot be converted to a TypeScript key.`);
  }

  const [first, ...rest] = words;
  const key =
    first.toLowerCase() +
    rest.map((word) => `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`).join("");

  return /^[0-9]/.test(key) ? `_${key}` : key;
}

function buildAssetUrl(basePath: string, segments: string[]): string {
  const encodedPath = segments.map((segment) => encodeURIComponent(segment)).join("/");
  return basePath ? `${basePath}/${encodedPath}` : `/${encodedPath}`;
}

function renderAssetModule(root: AssetTreeNode): string {
  const lines = [
    "/**",
    " * Generated by @valfuse-node/assets. Do not edit manually.",
    " */",
    `export const assets = ${renderObject(root, 0)} as const;`,
    "",
    "type AssetLeaves<T> = T extends string",
    "  ? T",
    "  : T extends Readonly<Record<string, unknown>>",
    "    ? AssetLeaves<T[keyof T]>",
    "    : never;",
    "",
    "export type AssetPath = AssetLeaves<typeof assets>;",
    "",
    "export default assets;",
    "",
  ];

  return lines.join("\n");
}

function renderObject(node: AssetTreeNode, depth: number): string {
  const children = [...node.children.entries()].sort(([left], [right]) =>
    compareNames(left, right)
  );
  if (children.length === 0) return "{}";

  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);
  const properties = children.map(([key, child]) => {
    const value =
      child.url === undefined ? renderObject(child, depth + 1) : JSON.stringify(child.url);
    return `${childIndent}[${JSON.stringify(key)}]: ${value},`;
  });

  return `({\n${properties.join("\n")}\n${indent}})`;
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
