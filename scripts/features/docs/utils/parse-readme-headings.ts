import { ParsedReadmeHeading } from "../types";
import { cleanHeadingText } from "./clean-heading-text";
import { extractHeadingMatch } from "./extract-heading-match";
import { isCodeFence } from "./is-code-fence";
import { normalizeHeadingText } from "./normalize-heading-text";

/**
 * Extract markdown headings while ignoring headings inside fenced code blocks.
 */
export function parseReadmeHeadings(readme: string): ParsedReadmeHeading[] {
  const lines = readme.split(/\r?\n/);
  const headings: ParsedReadmeHeading[] = [];
  let inFence = false;
  let fenceCharacter: "`" | "~" | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trimStart();

    if (isCodeFence(trimmed)) {
      const marker = trimmed.match(/^(`{3,}|~{3,})/)?.[1]?.charAt(0) as
        | "`"
        | "~"
        | undefined;

      if (!marker) {
        continue;
      }

      if (!inFence) {
        inFence = true;
        fenceCharacter = marker;
      } else if (fenceCharacter === marker) {
        inFence = false;
        fenceCharacter = null;
      }

      continue;
    }

    if (inFence) {
      continue;
    }

    const headingMatch = extractHeadingMatch(trimmed);
    if (!headingMatch) {
      continue;
    }

    const text = cleanHeadingText(headingMatch.text);
    const normalizedText = normalizeHeadingText(text);

    if (!normalizedText) {
      continue;
    }

    headings.push({
      level: headingMatch.level,
      text,
      normalizedText,
      line: index + 1,
      raw: line,
    });
  }

  return headings;
}
