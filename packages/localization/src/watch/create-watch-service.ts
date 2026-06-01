import chokidar from "chokidar";
import { join } from "node:path";
import type { LocalizationConfig } from "../types/config";
import { DEFAULT_WATCH_IGNORE_PATTERNS } from "./ignore-patterns";

export function createWatchService(
  cwd: string,
  config: LocalizationConfig,
  runGenerate: () => Promise<void>
): () => Promise<void> {
  const watcher = chokidar.watch(join(cwd, config.input_dir), {
    ignored: DEFAULT_WATCH_IGNORE_PATTERNS,
    ignoreInitial: true,
  });

  watcher.on("add", () => runGenerate());
  watcher.on("change", () => runGenerate());
  watcher.on("unlink", () => runGenerate());

  return async () => watcher.close();
}

