// Combine native HTML5 sectioning elements with WAI-ARIA landmark roles
const HTML_LANDMARKS =
  "main, header, footer, nav, aside, section, article, legend";
const ARIA_ROLES = `[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], [role="complementary"], [role="region"], [role="search"], [role="form"], [role="article"]`;

/**
 * Combined CSS selector matching all native HTML5 sectioning elements and WAI-ARIA landmark roles.
 *
 * @description Matches HTML elements (`main`, `header`, `footer`, `nav`, `aside`, `section`, `article`, `legend`)
 * and explicit ARIA role attributes (`role="main"`, `role="navigation"`, etc.).
 */
export const LANDMARK_SELECTOR = `${HTML_LANDMARKS}, ${ARIA_ROLES}`;

/**
 * Resolves an element's structural region identifier string, favoring an explicit ARIA role if present.
 *
 * @description Returns `tag[role="roleName"]` if an explicit `role` attribute exists (e.g. `div[role="navigation"]`),
 * or the lowercase HTML tag name (e.g. `section`).
 *
 * @param element - The DOM element to inspect.
 * @returns Formatted identifier string used in `RegionMapping` path tracking.
 *
 * @example
 * ```ts
 * const identifier = getRegionIdentifier(element); // "div[role=\"navigation\"]"
 * ```
 *
 * @a11y Ensures explicit ARIA roles take precedence over generic host container tags.
 */
export function getRegionIdentifier(element: Element): string {
  const role = element.getAttribute("role")?.trim().toLowerCase();
  const tag = element.tagName.toLowerCase();

  if (role) {
    // Returns "role:navigation" or "div[role=navigation]" to distinguish explicit ARIA roles
    return `${tag}[role="${role}"]`;
  }
  return tag;
}
