// scripts/features/docs/utils/orchestration/check-readme-files.ts
import type { DocumentationContract } from "@/docs/types";
import type { FileValidationResult } from "../modules/readme";
import { checkReadmeFile } from "../modules/readme";

/**
 * Validates multiple README targets in parallel using a path-to-contract map.
 *
 * @param {Record<string, DocumentationContract>} targets - Map of file paths to their contracts.
 * @returns {Promise<FileValidationResult[]>} The validation results if all targets pass.
 * @throws {AggregateError} If one or more README validation or filesystem errors occur.
 */
export async function checkReadmeFiles(
  targets: Record<string, DocumentationContract>,
): Promise<FileValidationResult[]> {
  const entries = Object.entries(targets);

  const results = await Promise.all(
    entries.map(([path, contract]) => checkReadmeFile({ path, contract })),
  );

  const errors = results
    .map((result) => result.error)
    .filter((error): error is NonNullable<typeof error> => error !== undefined);

  if (errors.length > 0) {
    throw new AggregateError(
      errors,
      `README validation failed for ${errors.length} target(s).`,
    );
  }

  return results;
}
