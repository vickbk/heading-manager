/**
 * Detects whether a line is a markdown heading and extracts its level and text.
 *
 * @param {string} line - The source line to inspect.
 * @returns {{ level: number; text: string } | null} The heading metadata when the
 * line is a valid heading, otherwise null.
 */
export function extractHeadingMatch(
  line: string,
): { level: number; text: string } | null {
  const trimmed = line.trimStart();
  const match = trimmed.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);

  if (!match) {
    return null;
  }

  const text = match[2].trim();

  if (!text) {
    return null;
  }

  return {
    level: match[1].length,
    text,
  };
}
