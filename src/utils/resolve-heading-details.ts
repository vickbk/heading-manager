import { RegionMapping } from "../types";
import { parseHeadingLevel } from "./parse-heading-level";

/**
 * Resolves heading details prioritizing `detailedHeadings` over `headings`.
 */
export function resolveHeadingDetail(node: RegionMapping): {
  rawHeading: string;
  parsedLevel: number | null;
  text?: string;
  element?: unknown;
} | null {
  if (node.detailedHeadings && node.detailedHeadings.length > 0) {
    const detail = node.detailedHeadings[0];
    return {
      rawHeading: String(detail.level),
      parsedLevel: parseHeadingLevel(detail.level),
      text: detail.text,
      element: detail.element,
    };
  }

  if (node.headings && node.headings.length > 0) {
    const rawHeading = node.headings[0];
    return {
      rawHeading,
      parsedLevel: parseHeadingLevel(rawHeading),
    };
  }

  return null;
}
