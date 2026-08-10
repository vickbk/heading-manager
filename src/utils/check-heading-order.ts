import { RegionMapping } from "../types";
import { parseHeadingLevel } from "./parse-heading-level";

/**
 * Recursively validates that heading levels in a region tree follow semantic HTML rules.
 *
 * - Headings can increase by at most 1 (e.g., H1 -> H2).
 * - Headings can remain the same level (sibling sections).
 * - Headings can decrease to any higher-level parent (e.g., H3 -> H2).
 * - Clamps and rejects levels exceeding H6 or falling below H1.
 */
export function checkHeadingOrder(
  region: RegionMapping,
  currentLevel = 1,
): boolean {
  if (!region) return true;

  const { headings = [], children = [] } = region;
  let runningLevel = currentLevel;

  for (const rawHeading of headings) {
    const level = parseHeadingLevel(rawHeading);

    if (level === null || level < 1 || level > 6) {
      return false;
    }

    const diff = level - runningLevel;
    if (diff > 1) {
      return false;
    }

    runningLevel = level;
  }

  return children.every((child) => checkHeadingOrder(child, runningLevel));
}
