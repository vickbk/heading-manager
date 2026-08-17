import { LANDMARK_SELECTOR } from "@/src/shared/dom";
import type { HeadingDetail, RegionMapping } from "../types";
import { getHeadingLevel } from "./get-heading-level";

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6, [role="heading"]';

/**
 * Extracts heading elements that belong directly to a specific landmark region scope.
 *
 * @param element - The landmark DOM container element to inspect.
 * @returns Object containing string level tags (`headings`) and detailed metadata (`detailedHeadings`).
 *
 * @remarks
 * **Landmark Isolation:** Headings nested inside child landmarks are excluded so that each heading
 * is associated exclusively with its immediate containing landmark region.
 *
 * @example
 * ```ts
 * const mainElement = document.querySelector("main")!;
 * const { headings, detailedHeadings } = getRegionHeadings(mainElement);
 *
 * console.log(headings); // ["h1", "h2"]
 * console.log(detailedHeadings[0].text); // "Main Page Title"
 * ```
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

    const strLevel = `h${level}`;
    headings.push(strLevel);

    const text =
      heading.textContent?.trim() ||
      heading.getAttribute("aria-label")?.trim() ||
      "";

    detailedHeadings.push({
      level: strLevel,
      numLevel: Number(level),
      text,
      element: heading,
    });
  }

  return { headings, detailedHeadings };
}
