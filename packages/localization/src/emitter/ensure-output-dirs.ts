import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { LocalizationConfig } from "../types/config";

export async function ensureOutputDirs(cwd: string, config: LocalizationConfig): Promise<void> {
  await mkdir(join(cwd, config.output_dir), { recursive: true });
  await mkdir(join(cwd, config.reporting.output_dir), { recursive: true });
  await mkdir(dirname(join(cwd, config.output_dir, config.generated.runtime_entry_file)), {
    recursive: true,
  });
}
