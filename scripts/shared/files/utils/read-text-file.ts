import { readTextFileAsync } from "./read-text-file-async";

/**
 * Reads a UTF-8 text file from disk, attaching a clean prefix while preserving the original error cause.
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await readTextFileAsync({ filePath });
}
