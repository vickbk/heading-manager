/**
 * Extracts a 1-based numerical heading level from a tag name string or numerical descriptor.
 *
 * @description Parses input strings such as `"h2"`, `"H3"`, or `"2"` into a 1-based integer (`2`, `3`, etc.).
 * Returns `null` if the input is unparseable or empty.
 *
 * @param headingStr - The tag name or level descriptor to parse.
 * @returns 1-based integer heading level (e.g. `2` for `"h2"`), or `null` if unparseable.
 *
 * @example
 * ```ts
 * parseHeadingLevel("h2"); // 2
 * parseHeadingLevel(3);    // 3
 * ```
 *
 * @a11y Normalizes raw HTML tag strings for WCAG 2.1 SC 1.3.1 hierarchy verification.
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
