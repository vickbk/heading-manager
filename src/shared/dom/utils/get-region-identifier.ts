const HTML_LANDMARKS =
  "main, header, footer, nav, aside, section, article, legend";
const ARIA_ROLES = `[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], [role="complementary"], [role="region"], [role="search"], [role="form"], [role="article"]`;

/**
 * Combined CSS selector string matching native HTML5 sectioning elements and WAI-ARIA landmark roles.
 *
 * @example
 * ```ts
 * const landmarks = document.querySelectorAll(LANDMARK_SELECTOR);
 * ```
 */
export const LANDMARK_SELECTOR = `${HTML_LANDMARKS}, ${ARIA_ROLES}`;

/**
 * Resolves an element's structural region identifier string, prioritizing explicit ARIA roles over HTML tag names.
 *
 * @param element - The DOM element to inspect.
 * @returns Formatted selector string (e.g. `div[role="navigation"]` or `section`).
 *
 * @remarks
 * **Accessibility:** Ensures explicit ARIA role declarations take precedence over host container tags.
 *
 * @example
 * ```ts
 * const nav = document.createElement("div");
 * nav.setAttribute("role", "navigation");
 * getRegionIdentifier(nav); // "div[role=\"navigation\"]"
 *
 * const section = document.createElement("section");
 * getRegionIdentifier(section); // "section"
 * ```
 */
export function getRegionIdentifier(element: Element): string {
  const role = element.getAttribute("role")?.trim().toLowerCase();
  const tag = element.tagName.toLowerCase();

  if (role) {
    return `${tag}[role="${role}"]`;
  }
  return tag;
}
