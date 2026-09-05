// scripts/features/docs/utils/orchestration/check-readme-file.ts
import { readTextFile } from "@/scripts/shared/files";
import { checkReadmeSections } from "./check-readme-sections";
import { ReadmeValidationError } from "./errors/readme-validation-error";
import type { FileValidationResult, ReadmeTarget } from "./types";

/**
 * Validates a single README file against its assigned documentation contract.
 *
 * The function returns a FileValidationResult for both success and failure paths:
 * valid files include a populated result, while invalid reads or validation failures
 * are captured in the error field instead of being thrown.
 *
 * @param target - The file path and contract pair to validate.
 * @returns A file-level validation result with either the successful validation data
 * or the captured error value.
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
