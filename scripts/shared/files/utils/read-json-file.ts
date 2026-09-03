import path from "node:path";
import { ReadTextFileOptions } from "../types";
import { readTextFileAsync } from "./read-text-file-async";

/**
 * Asynchronously reads and parses a JSON file, wrapping syntax errors with
 * file context while preserving the original cause.
 */
export async function readJsonFile<T>(
  options: ReadTextFileOptions,
): Promise<T> {
  const data = await readTextFileAsync(options);

  try {
    return JSON.parse(data) as T;
  } catch (err) {
    const targetPath = options.baseDir
      ? path.resolve(options.baseDir, options.filePath)
      : options.filePath;

    const detail = err instanceof Error ? err.message : String(err);

    throw new Error(
      `[JSON Parse Error] Failed to parse JSON from "${targetPath}": ${detail}`,
      { cause: err },
    );
  }
}
