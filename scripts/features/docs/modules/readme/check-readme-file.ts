// scripts/features/docs/utils/orchestration/check-readme-file.ts
import { readTextFile } from "@/scripts/core/files";
import { checkReadmeSections } from "./check-readme-sections";
import { ReadmeValidationError } from "./errors/readme-validation-error";
import type { FileValidationResult, ReadmeTarget } from "./types";

/**
 * Validates a single README file against its assigned documentation contract.
 *
 * @param {ReadmeTarget} target - The file path and contract pair to validate.
 * @returns {Promise<FileValidationResult>} The file-level validation result.
 * @throws {ReadmeValidationError} If the README section validation fails contract checks.
 */
export async function checkReadmeFile({
  path,
  contract,
}: ReadmeTarget): Promise<FileValidationResult> {
  try {
    const content: string = await readTextFile(path);
    const result = checkReadmeSections(content, contract);

    if (!result.isValid) {
      throw new ReadmeValidationError(path, result);
    }

    return { path, result };
  } catch (error) {
    return {
      path,
      error,
    };
  }
}
