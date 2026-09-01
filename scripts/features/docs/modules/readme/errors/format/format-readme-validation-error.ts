import { ReadmeValidationError } from "../readme-validation-error";
import { formatDiagnostics } from "./format-diagnostics";
import { formatMissingSectionsError } from "./format-missing-sections";

/**
 * Formats a single README validation failure into the terminal-style summary used by
 * the CLI error renderer.
 *
 * The output always starts with the path header and then appends the missing-section
 * block and diagnostics block in that exact order whenever their data is present.
 *
 * @param error - The validation failure instance to render.
 * @returns A newline-delimited diagnostic summary for the failing README path.
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
