import { RegionMapping } from "../modules/region";
import { parseHeadingLevel } from "./parse-heading-level";

/**
 * Resolves heading metadata for a specific heading index inside a `RegionMapping` node.
 *
 * @description Prioritizes rich `detailedHeadings` metadata (including accessible inner text and DOM element references)
 * and falls back to the legacy string `headings` array if detailed metadata is absent.
 *
 * @param node - The `RegionMapping` tree node to inspect.
 * @param index - Zero-based index of the target heading within the region (defaults to `0`).
 * @returns A metadata object containing `rawHeading`, `parsedLevel`, optional `text`, and optional `element`, or `null` if the index is out of bounds.
 *
 * @example
 * ```ts
 * const details = resolveHeadingDetail(regionNode, 0);
 * if (details) {
 *   console.log(details.parsedLevel, details.text);
 * }
 * ```
 *
 * @a11y Provides normalized heading details for WCAG SC 1.3.1 reporting.
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
