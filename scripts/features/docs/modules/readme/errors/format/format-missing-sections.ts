import { ReadmeValidationError } from "../readme-validation-error";

export function formatMissingSectionsError(
  { result }: ReadmeValidationError,
  lines: string[],
) {
  if (result.missingRequiredSections.length > 0) {
    lines.push(`  Missing Required Sections:`);
    result.missingRequiredSections.forEach((sectionId) => {
      lines.push(`    - ${sectionId}`);
    });
  }
}
