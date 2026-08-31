import fs from "node:fs/promises";

/**
 * Reads a UTF-8 text file from disk, attaching a clean prefix while preserving the original error cause.
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, "utf-8");
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`[IO Error] Failed to read "${filePath}": ${detail}`, {
      cause: err,
    });
  }
}
