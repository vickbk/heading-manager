/**
 * Zero-based heading depth index used by the ambient heading context.
 *
 * - `0` = H1
 * - `1` = H2
 * - `2` = H3
 * - `3` = H4
 * - `4` = H5
 * - `5` = H6
 *
 * @see {@link https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html WCAG 2.1 SC 1.3.1 Info and Relationships}
 *
 * @example
 * ```ts
 * const rootLevel: HeadingLevel = 0; // H1
 * const subLevel: HeadingLevel = 1; // H2
 * ```
 */
export type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5;
