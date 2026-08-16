import { LANDMARK_SELECTOR } from "@/src/shared/dom";
import type { HeadingDetail, RegionMapping } from "../types";
import { getHeadingLevel } from "./get-heading-level";

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"]';

/**
 * Extracts headings that belong directly to a landmark region.
 *
 * A heading belongs to the supplied region when its closest landmark
 * ancestor is the supplied `element`. Headings nested inside another
 * landmark are therefore excluded.
 *
 * Heading levels are normalized through `getHeadingLevel()`. Valid
 * `aria-level` values take precedence over the native heading level;
 * invalid values fall back to the native level, or to ARIA's default
 * level for an element with `role="heading"`.
 *
 * @param element - The landmark region whose headings should be extracted.
 * @returns The normalized heading levels and detailed heading metadata.
 */
export function getRegionHeadings(
  element: Element,
): Pick<RegionMapping, "headings" | "detailedHeadings"> {
  const directHeadings = [
    ...element.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
  ].filter((heading) => heading.closest(LANDMARK_SELECTOR) === element);

  const headings: string[] = [];
  const detailedHeadings: HeadingDetail[] = [];

  for (const heading of directHeadings) {
    const level = getHeadingLevel(heading);

    headings.push(level);

    const text =
      heading.textContent?.trim() ||
      heading.getAttribute("aria-label")?.trim() ||
      "";

    detailedHeadings.push({
      level,
      text,
      element: heading,
    });
  }

  return { headings, detailedHeadings };
}
