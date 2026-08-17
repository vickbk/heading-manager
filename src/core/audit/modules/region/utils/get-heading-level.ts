/**
 * Resolves the normalized numeric heading level for a heading element as a string.
 *
 * @param heading - The target DOM heading element (`<h1>`–`<h6>` or element with `role="heading"`).
 * @returns The normalized numeric heading level (e.g., `"1"`, `"2"`, `"6"`).
 *
 * @remarks
 * **WAI-ARIA Resolution Rules:**
 * 1. An explicit positive integer in `aria-level` takes precedence over native tag names.
 * 2. Invalid or non-numeric `aria-level` values are ignored, falling back to native tag names (`<h1>`–`<h6>`).
 * 3. Elements with `role="heading"` lacking a valid `aria-level` default to level `"2"` per the WAI-ARIA specification.
 *
 * @example
 * ```ts
 * const nativeH2 = document.createElement("h2");
 * getHeadingLevel(nativeH2); // "2"
 *
 * const customHeading = document.createElement("div");
 * customHeading.setAttribute("role", "heading");
 * customHeading.setAttribute("aria-level", "4");
 * getHeadingLevel(customHeading); // "4"
 *
 * const defaultAriaHeading = document.createElement("div");
 * defaultAriaHeading.setAttribute("role", "heading");
 * getHeadingLevel(defaultAriaHeading); // "2"
 * ```
 */
export function getHeadingLevel(heading: HTMLElement): string {
  const ariaLevel = heading.getAttribute("aria-level");

  if (ariaLevel !== null) {
    const normalizedLevel = ariaLevel.trim();

    if (/^[1-9]\d*$/.test(normalizedLevel)) {
      return normalizedLevel;
    }
  }

  const nativeLevel = /^h([1-6])$/i.exec(heading.tagName);

  if (nativeLevel) {
    return nativeLevel[1];
  }

  return "2";
}
