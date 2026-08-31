import type { ParsedReadmeHeading } from "../../../types";
import { createCodeFenceTracker } from "./parse-code-fence";
import { parseHeadingFromLine } from "./parse-heading-line";

/**
 * Extract markdown headings while ignoring headings inside fenced code blocks.
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
