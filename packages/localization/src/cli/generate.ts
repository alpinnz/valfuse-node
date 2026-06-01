import { resolve as absolutePath } from "node:path";
import { loadConfig } from "../config/load-config";
import { compileProject } from "../compiler/compile-project";
import { emitRuntimeFiles } from "../emitter/emit-runtime-files";
import { emitReportFiles } from "../emitter/emit-report-files";
import { ensureOutputDirs } from "../emitter/ensure-output-dirs";
import { createWatchService } from "../watch/create-watch-service";
import { renderTerminalReport } from "../diagnostics/render-terminal-report";

export async function runGenerate(
  options: { cwd?: string; watch?: boolean } = {}
): Promise<void> {
  const cwd = absolutePath(options.cwd ?? process.cwd());
  const config = await loadConfig(cwd);

  const generateOnce = async (): Promise<void> => {
    await ensureOutputDirs(cwd, config);
    const compiled = await compileProject(cwd, config);
    await emitRuntimeFiles(cwd, config, compiled);
    await emitReportFiles(cwd, config, compiled);

    if (compiled.diagnostics.length > 0) {
      // eslint-disable-next-line no-console
      console.error(renderTerminalReport(compiled.diagnostics));
    }
    if (
      compiled.diagnostics.some((d) => d.severity === "error") &&
      config.strict
    ) {
      throw new Error("Localization generation failed with diagnostics.");
    }
  };

  await generateOnce();

  if (options.watch) {
    const stopWatching = createWatchService(cwd, config, generateOnce);
    // Graceful shutdown on SIGINT (Ctrl+C).
    process.once("SIGINT", () => {
      stopWatching().then(() => process.exit(0)).catch(() => process.exit(1));
    });
    // Keep process alive for watch mode.
    await new Promise<never>(() => undefined);
  }
}

