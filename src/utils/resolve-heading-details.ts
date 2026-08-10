import { RegionMapping } from "../types";
import { parseHeadingLevel } from "./parse-heading-level";

/**
 * Resolves heading details for a specific heading index within a region node.
 * Defaults to index 0 for backwards compatibility.
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
