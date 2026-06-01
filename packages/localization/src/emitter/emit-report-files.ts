import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { LocalizationConfig } from "../types/config";
import type { CompiledProject } from "../compiler/compile-project";
import { buildCoverageJson } from "../coverage/build-coverage-json";

export async function emitReportFiles(
  cwd: string,
  config: LocalizationConfig,
  compiled: CompiledProject
): Promise<void> {
  const reportDir = join(cwd, config.reporting.output_dir);
  const coverage = buildCoverageJson(compiled.manifest);
  await writeFile(
    join(reportDir, "coverage.json"),
    `${JSON.stringify(coverage, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    join(reportDir, "diagnostics.json"),
    `${JSON.stringify(compiled.diagnostics, null, 2)}\n`,
    "utf8"
  );
  await writeFile(
    join(reportDir, "placeholders.json"),
    `${JSON.stringify(compiled.placeholders, null, 2)}\n`,
    "utf8"
  );
}

