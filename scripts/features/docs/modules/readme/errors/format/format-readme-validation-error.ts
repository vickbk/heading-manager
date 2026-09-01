import { ReadmeValidationError } from "../readme-validation-error";
import { formatDiagnostics } from "./format-diagnostics";
import { formatMissingSectionsError } from "./format-missing-sections";

/**
 * Formats a single ReadmeValidationError into a detailed terminal diagnostic block.
 */
export function formatReadmeValidationError(
  error: ReadmeValidationError,
): string {
  const { path } = error;
  const lines: string[] = [`[README Validation Failed] Path: ${path}`];

  formatMissingSectionsError(error, lines);

  formatDiagnostics(error, lines);

  return lines.join("\n");
}
