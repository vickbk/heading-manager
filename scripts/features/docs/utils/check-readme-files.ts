import type { FileValidationResult, ReadmeTarget } from "../types";
import { checkReadmeFile } from "./check-readme-file";

/**
 * Validates multiple README targets in parallel.
 *
 * @param {...ReadmeTarget} targets - The README files and their assigned
 * contracts to validate.
 * @returns {Promise<FileValidationResult[]>} The validation results in the same
 * order as the provided targets.
 */
export async function checkReadmeFiles(
  ...targets: ReadmeTarget[]
): Promise<FileValidationResult[]> {
  return await Promise.all(targets.map((target) => checkReadmeFile(target)));
}
