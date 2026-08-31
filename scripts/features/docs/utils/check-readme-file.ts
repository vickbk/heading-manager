import { readTextFile } from "@/scripts/core/files";
import { checkReadmeSections } from "../modules/readme";
import type { FileValidationResult, ReadmeTarget } from "../types";

/**
 * Validates a single README file against its contract.
 * Throws manageable domain errors for I/O and parser failures.
 */
export async function checkReadmeFile(
  target: ReadmeTarget,
): Promise<FileValidationResult> {
  const { path, contract } = target;

  const content: string = await readTextFile(path);

  const result = checkReadmeSections(content, contract);
  return { path, result };
}
