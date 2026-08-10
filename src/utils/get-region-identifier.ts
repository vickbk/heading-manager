// Combine native HTML5 sectioning elements with WAI-ARIA landmark roles
const HTML_LANDMARKS =
  "main, header, footer, nav, aside, section, article, legend";
const ARIA_ROLES = `[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], [role="complementary"], [role="region"], [role="search"], [role="form"], [role="article"]`;

export const LANDMARK_SELECTOR = `${HTML_LANDMARKS}, ${ARIA_ROLES}`;

/**
 * Resolves an element's identifier, favoring an explicit ARIA role if present.
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
