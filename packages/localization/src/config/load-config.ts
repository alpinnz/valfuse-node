import { readFile } from "node:fs/promises";
import { resolve as absolutePath } from "node:path";
import YAML from "yaml";
import type { LocalizationConfig } from "../types/config";
import { normalizeConfig } from "./normalize-config";
import { validateConfig } from "./validate-config";

/** Shared config file name read by Valfuse CLIs. */
export const CONFIG_FILE_NAME = "valfuse.yaml";

export async function loadConfig(cwd: string): Promise<LocalizationConfig> {
  const configPath = absolutePath(cwd, CONFIG_FILE_NAME);
  const raw = await readFile(configPath, "utf8");
  const parsed: unknown = YAML.parse(raw);
  const section = readLocalizationSection(parsed, configPath) as Partial<LocalizationConfig> & {
    file_extension?: unknown;
    field_rename?: unknown;
  };

  if (section.file_extension !== undefined) {
    throw new Error(
      "Config error: file_extension is no longer supported. Use .json localization files."
    );
  }
  if (section.field_rename !== undefined) {
    throw new Error(
      "Config error: field_rename is no longer supported. Rename mode is fixed to none."
    );
  }

  const normalized = normalizeConfig(section);
  validateConfig(normalized);
  return normalized;
}

function readLocalizationSection(value: unknown, configPath: string): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Config error: ${CONFIG_FILE_NAME} must contain a YAML mapping.`);
  }

  const root = value as Record<string, unknown>;
  if (Object.prototype.hasOwnProperty.call(root, "localization")) {
    const section = root.localization;
    if (!section || typeof section !== "object" || Array.isArray(section)) {
      throw new Error('Config error: section "localization" must be a YAML mapping.');
    }
    return section;
  }

  const legacyKeys = new Set([
    "input_dir",
    "output_dir",
    "framework",
    "class_name",
    "base_locale",
    "fallback_locale",
    "strict",
    "namespace_prefix",
    "generated",
    "validation",
    "reporting",
    "file_extension",
    "field_rename",
  ]);
  if (Object.keys(root).every((key) => legacyKeys.has(key))) return root;

  throw new Error(`Config error: section "localization" is missing in ${configPath}.`);
}
