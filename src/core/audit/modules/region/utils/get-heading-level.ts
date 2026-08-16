/**
 * Resolves the normalized heading level for a heading element.
 *
 * An explicit `aria-level` is used when it contains a valid positive integer.
 * Invalid `aria-level` values are ignored and the element's native heading
 * level is used when available.
 *
 * For elements with `role="heading"` that do not have a valid `aria-level`,
 * ARIA defines level 2 as the default heading level.
 *
 * @param heading - The heading element whose level should be resolved.
 * @returns The normalized heading level in `hN` form.
 */
export function getHeadingLevel(heading: HTMLElement): string {
  const ariaLevel = heading.getAttribute("aria-level");

  if (ariaLevel !== null) {
    const normalizedLevel = ariaLevel.trim();

    if (/^[1-9]\d*$/.test(normalizedLevel)) {
      return `h${normalizedLevel}`;
    }
  }

  const nativeLevel = /^h([1-6])$/i.exec(heading.tagName);

  if (nativeLevel) {
    return `h${nativeLevel[1]}`;
  }

  return "h2";
}
