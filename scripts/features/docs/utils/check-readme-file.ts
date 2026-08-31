import { readTextFile } from "@/scripts/core/files";
import { checkReadmeSections } from "../modules/readme";
import type { FileValidationResult, ReadmeTarget } from "../types";

/**
 * Validates a single README file against its assigned documentation contract.
 *
 * @param {ReadmeTarget} target - The file path and contract pair to validate.
 * @returns {Promise<FileValidationResult>} The file-level validation result,
 * including the resolved README output or validation errors.
 */
export async function checkReadmeFile(
  target: ReadmeTarget,
): Promise<FileValidationResult> {
  const { path, contract } = target;

  const content: string = await readTextFile(path);

  const result = checkReadmeSections(content, contract);
  return { path, result };
}
