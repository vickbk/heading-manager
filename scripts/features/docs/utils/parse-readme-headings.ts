import { ParsedReadmeHeading } from "../types";
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
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1].charAt(0) as "`" | "~";

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

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (!headingMatch) {
      continue;
    }

    const rawText = headingMatch[2].trim();
    const normalizedText = normalizeHeadingText(rawText);

    if (!normalizedText) {
      continue;
    }

    headings.push({
      level: headingMatch[1].length,
      text: rawText,
      normalizedText,
      line: index + 1,
      raw: line,
    });
  }

  return headings;
}
