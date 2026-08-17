import { RegionMapping } from "../modules/region";
import { parseHeadingLevel } from "./parse-heading-level";

/**
 * Resolves heading metadata for a given index, falling back to raw string arrays if necessary.
 *
 * @deprecated Legacy helper used by `processHeadingLevel`. Modern pipelines consume `HeadingDetail` directly.
 */
export function resolveHeadingDetail(
  node: RegionMapping,
  index = 0,
): {
  rawHeading: string;
  parsedLevel: number | null;
  text?: string;
  element?: unknown;
} | null {
  if (node.detailedHeadings && node.detailedHeadings.length > index) {
    const detail = node.detailedHeadings[index];
    return {
      rawHeading: String(detail.level),
      parsedLevel: parseHeadingLevel(detail.level),
      text: detail.text,
      element: detail.element,
    };
  }

  if (node.headings && node.headings.length > index) {
    const rawHeading = node.headings[index];
    return {
      rawHeading,
      parsedLevel: parseHeadingLevel(rawHeading),
    };
  }

  return null;
}
