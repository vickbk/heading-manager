import { getRegionIdentifier, LANDMARK_SELECTOR } from "@/src/shared/dom";
import type { RegionMapping } from "../types";
import { getRegionHeadings } from "./get-region-headings";

/**
 * Parses a DOM element tree and constructs a `RegionMapping` representation of landmark sections and headings.
 *
 * @description Scans `element` for HTML sectioning landmarks (`main`, `section`, `article`, etc.) and explicit ARIA roles (`[role="main"]`),
 * extracting direct child headings and recursively building child region mappings.
 *
 * @param element - The root DOM element to scan and map.
 * @returns A `RegionMapping` object representing the parsed landmark tree.
 *
 * @example
 * ```ts
 * const regionTree = drawRegion(document.body);
 * ```
 *
 * @a11y Inspects HTML sectioning elements and ARIA roles for accessibility hierarchy auditing per WCAG 2.1 SC 1.3.1.
 */
export function drawRegion<T extends Element>(element: T): RegionMapping {
  const tagName = getRegionIdentifier(element);

  const regions = [...element.querySelectorAll(LANDMARK_SELECTOR)].filter(
    (child) => child.parentElement?.closest(LANDMARK_SELECTOR) === element,
  );

  return {
    ...getRegionHeadings(element),
    tagName,
    children: regions.map(drawRegion),
  };
}
