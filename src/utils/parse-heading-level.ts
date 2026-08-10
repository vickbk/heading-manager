/**
 * Extracts a numerical heading level from a tag or descriptor string.
 */
export function parseHeadingLevel(headingStr: string | number): number | null {
  if (typeof headingStr === "number") {
    return headingStr;
  }
  if (!headingStr) return null;

  const hMatch = headingStr.match(/^h(\d+)/i);
  if (hMatch) return Number(hMatch[1]);

  const digitsMatch = headingStr.match(/\d+/);
  if (digitsMatch) return Number(digitsMatch[0]);

  return null;
}
