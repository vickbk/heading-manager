import { ReadmeValidationError } from "../readme-validation-error";

export function formatDiagnostics(
  { result }: ReadmeValidationError,
  lines: string[],
) {
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
