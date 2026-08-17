import { getRegionIdentifier, LANDMARK_SELECTOR } from "@/src/shared/dom";
import type { RegionMapping } from "../types";
import { getRegionHeadings } from "./get-region-headings";

/**
 * Recursively parses a DOM element subtree and constructs a structured `RegionMapping` tree.
 *
 * @param element - The root DOM element to scan and map.
 * @returns A structured `RegionMapping` node containing landmark identifiers, direct headings, and nested child regions.
 *
 * @remarks
 * **Accessibility (WCAG 2.1 SC 1.3.1):** Scans HTML sectioning elements (`main`, `section`, `article`, etc.)
 * and explicit ARIA landmark roles (`[role="main"]`) to evaluate regional heading hierarchy structure.
 *
 * @example
 * ```ts
 * const regionTree = drawRegion(document.body);
 * console.log(regionTree.tagName); // "body"
 * console.log(regionTree.children); // Array of nested child RegionMapping objects
 * ```
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
