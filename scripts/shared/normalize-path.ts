/**
 * Strips OS drive letters (e.g., "D:", "C:") and normalizes backslashes to forward slashes.
 */
export function normalizePath(filePath: string, replaceSlashes = true): string {
  let normalized = filePath.replace(/^[a-zA-Z]:/, "");
  if (replaceSlashes) normalized = normalized.replace(/\\/g, "/");
  return normalized;
}
