import type { RegionMapping } from "../types";
import {
  getRegionIdentifier,
  LANDMARK_SELECTOR,
} from "./get-region-identifier";

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"]';

export function drawRegion<T extends Element>(element: T): RegionMapping {
  const tagName = getRegionIdentifier(element);

  // Find direct child landmark regions (HTML tags or explicit ARIA roles)
  const regions = [...element.querySelectorAll(LANDMARK_SELECTOR)].filter(
    (child) => child.parentElement?.closest(LANDMARK_SELECTOR) === element,
  );

  // Find direct child headings
  const directHeadings = [
    ...element.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
  ].filter((heading) => heading.closest(LANDMARK_SELECTOR) === element);

  // Map to detailedHeadings while building legacy string headings
  const headings: string[] = Array(directHeadings.length);
  const detailedHeadings = directHeadings.map((heading, index) => {
    const ariaLevel = heading.getAttribute("aria-level");
    const nativeLevel = heading.tagName.toLowerCase();
    const level = ariaLevel ? `h${ariaLevel}` : nativeLevel;

    headings[index] = level;

    const text =
      heading.textContent?.trim() ||
      heading.getAttribute("aria-label")?.trim() ||
      "";

    return {
      level,
      text,
      element: heading,
    };
  });

  return {
    tagName,
    headings,
    detailedHeadings,
    children: regions.map((region) => drawRegion(region)),
  };
}
