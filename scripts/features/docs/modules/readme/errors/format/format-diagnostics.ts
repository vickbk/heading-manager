import { ReadmeValidationError } from "../readme-validation-error";

/**
 * Appends the diagnostics block for a README validation failure.
 *
 * Optional metadata is rendered only when present: section ids are appended as
 * `[section: ...]` and line numbers as `(line N)`. Both are omitted when the
 * corresponding property is falsy, matching the actual runtime checks.
 *
 * @param error - The validation error whose result contains the diagnostic list.
 * @param lines - The output buffer to append formatted diagnostics to.
 * @returns void because it mutates the provided lines array in place.
 */
export function formatDiagnostics(
  { result }: ReadmeValidationError,
  lines: string[],
): void {
  if (result.diagnostics.length > 0) {
    lines.push(`  Diagnostics:`);
    result.diagnostics.forEach((diag) => {
      const lineInfo = diag.line ? ` (line ${diag.line})` : "";
      const sectionInfo = diag.sectionId ? ` [section: ${diag.sectionId}]` : "";
      lines.push(
        `    - [${diag.code}] ${diag.message}${sectionInfo}${lineInfo}`,
      );
    });
  }
}
