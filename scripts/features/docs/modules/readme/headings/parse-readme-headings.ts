import type { ParsedReadmeHeading } from "../../../types";
import { createCodeFenceTracker } from "./parse-code-fence";
import { parseHeadingFromLine } from "./parse-heading-line";

/**
 * Extracts all section headings from a README while ignoring fenced code blocks.
 *
 * @param {string} readme - The raw README content.
 * @returns {ParsedReadmeHeading[]} The parsed headings in file order, including
 * the normalized comparison form and source line metadata.
 */
export function parseReadmeHeadings(readme: string): ParsedReadmeHeading[] {
  const lines = readme.split(/\r?\n/);
  const headings: ParsedReadmeHeading[] = [];
  const codeFenceTracker = createCodeFenceTracker();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (codeFenceTracker.shouldSkipLine(line)) {
      continue;
    }

    const heading = parseHeadingFromLine(line, index + 1);
    if (heading) {
      headings.push(heading);
    }
  }

  return headings;
}
