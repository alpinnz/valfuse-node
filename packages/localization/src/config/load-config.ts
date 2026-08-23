import { readFile } from "node:fs/promises";
import { resolve as absolutePath } from "node:path";
import YAML from "yaml";
import type { LocalizationConfig } from "../types/config";
import { normalizeConfig } from "./normalize-config";
import { validateConfig } from "./validate-config";

/** Config file name read by the CLI. */
export const CONFIG_FILE_NAME = "valfuse-localization.yaml";

export async function loadConfig(cwd: string): Promise<LocalizationConfig> {
  const configPath = absolutePath(cwd, CONFIG_FILE_NAME);
  const raw = await readFile(configPath, "utf8");
  const parsed = YAML.parse(raw) as Partial<LocalizationConfig> & {
    file_extension?: unknown;
    field_rename?: unknown;
  };

  if (parsed.file_extension !== undefined) {
    throw new Error(
      "Config error: file_extension is no longer supported. Use .json localization files."
    );
  }
  if (parsed.field_rename !== undefined) {
    throw new Error(
      "Config error: field_rename is no longer supported. Rename mode is fixed to none."
    );
  }

  const normalized = normalizeConfig(parsed);
  validateConfig(normalized);
  return normalized;
}
