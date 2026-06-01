import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LocalizationConfig } from "../types/config";
import type { CompiledProject } from "../compiler/compile-project";

export async function emitRuntimeFiles(
  cwd: string,
  config: LocalizationConfig,
  compiled: CompiledProject
): Promise<void> {
  const outDir = join(cwd, config.output_dir);
  await writeFile(
    join(outDir, config.generated.runtime_entry_file),
    compiled.runtimeEntryFile,
    "utf8"
  );
  await writeFile(
    join(outDir, config.generated.runtime_types_file),
    compiled.runtimeTypesFile,
    "utf8"
  );
  await writeFile(
    join(outDir, config.generated.runtime_manifest_file),
    `${JSON.stringify(compiled.manifest, null, 2)}\n`,
    "utf8"
  );
}

