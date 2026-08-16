/**
 * 0-based heading context index mapping to HTML heading levels 1 through 6.
 *
 * `0` = H1, `1` = H2, `2` = H3, `3` = H4, `4` = H5, `5` = H6.
 *
 * @description Represents the zero-indexed context level maintained by HeadingCtx.
 * @see https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 0;
