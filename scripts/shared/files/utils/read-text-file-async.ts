import fs from "node:fs/promises";
import path from "node:path";
import { ReadTextFileOptions } from "../types";

/**
 * Asynchronously reads a text file, enforcing path bounds (if baseDir is provided)
 * and wrapping I/O errors with original cause preservation.
 */
export async function readTextFileAsync({
  filePath,
  baseDir,
  encoding = "utf8",
}: ReadTextFileOptions): Promise<string> {
  const fullPath = baseDir
    ? path.resolve(baseDir, filePath)
    : path.resolve(filePath);

  if (baseDir) {
    const resolvedBase = path.resolve(baseDir);
    const relative = path.relative(resolvedBase, fullPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(`Access denied: Target path outside "${resolvedBase}"`);
    }
  }

  try {
    return await fs.readFile(fullPath, { encoding });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`[IO Error] Failed to read "${fullPath}": ${detail}`, {
      cause: err,
    });
  }
}
