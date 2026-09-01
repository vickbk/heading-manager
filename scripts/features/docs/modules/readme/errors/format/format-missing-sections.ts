import { ReadmeValidationError } from "../readme-validation-error";

/**
 * Appends the missing-required-sections block for a validation failure.
 *
 * The section ids are emitted in their original order without deduplication or
 * sorting, preserving the exact runtime result data.
 *
 * @param error - The validation error whose result contains the missing section ids.
 * @param lines - The output buffer to append the missing-section list to.
 * @returns void because it mutates the provided lines array in place.
 */
export function formatMissingSectionsError(
  { result }: ReadmeValidationError,
  lines: string[],
): void {
  if (result.missingRequiredSections.length > 0) {
    lines.push(`  Missing Required Sections:`);
    result.missingRequiredSections.forEach((sectionId) => {
      lines.push(`    - ${sectionId}`);
    });
  }
}
