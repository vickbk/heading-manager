import type { ParsedReadmeHeading } from "../../../types";
import { cleanHeadingText } from "./clean-heading-text";
import { extractHeadingMatch } from "./extract-heading-match";
import { normalizeHeadingText } from "./normalize-heading-text";

/**
 * Parses a single markdown heading line into the normalized heading model.
 *
 * @param {string} line - A single README line to inspect.
 * @param {number} lineNumber - The source line number for the heading.
 * @returns {ParsedReadmeHeading | null} The parsed heading metadata when the line
 * is a section heading, otherwise null.
 */
export function parseHeadingFromLine(
  line: string,
  lineNumber: number,
): ParsedReadmeHeading | null {
  const trimmed = line.trimStart();
  const headingMatch = extractHeadingMatch(trimmed);

  if (!headingMatch) {
    return null;
  }

  const text = cleanHeadingText(headingMatch.text);
  const normalizedText = normalizeHeadingText(text);

  if (!normalizedText) {
    return null;
  }

  return {
    level: headingMatch.level,
    text,
    normalizedText,
    line: lineNumber,
    raw: line,
  };
}
