/**
 * Metadata descriptor for an individual heading element discovered during DOM auditing.
 *
 * @example
 * ```ts
 * const detail: HeadingDetail = {
 *   level: "h2",
 *   numLevel: 2,
 *   text: "Main Features",
 *   element: domElementRef,
 * };
 * ```
 */
export type HeadingDetail = {
  /**
   * Normalized heading level string in `hN` format (e.g., `"h1"`, `"h2"`, `"h7"`).
   *
   * @remarks
   * Retained as a string for backward compatibility with earlier package versions.
   */
  level: string;

  /**
   * Canonical numeric representation of the heading level (e.g., `1`, `2`, `7`).
   *
   * Use this field for numeric level comparisons and hierarchy validation logic.
   */
  numLevel: number;

  /**
   * Accessible text content of the heading, falling back to `aria-label` or `aria-labelledby` if text content is empty.
   */
  text: string;

  /**
   * Reference to the underlying DOM node handle.
   *
   * @remarks
   * Typed as `unknown` to keep the core auditing logic environment-neutral (e.g., SSR, virtual DOM, or browser environments).
   */
  element?: unknown;
};

/**
 * Tree representation of an HTML5 sectioning landmark or ARIA structural region.
 *
 * @remarks
 * **Accessibility:** Maps sectioning elements (`main`, `section`, `article`, `nav`) and explicit ARIA roles (`role="navigation"`)
 * to evaluate nested heading hierarchies within their surrounding region scope.
 *
 * @example
 * ```ts
 * const mainRegion: RegionMapping = {
 *   tagName: "main",
 *   headings: ["h1"],
 *   detailedHeadings: [
 *     { level: "h1", numLevel: 1, text: "Dashboard Overview" }
 *   ],
 *   children: [
 *     {
 *       tagName: "section",
 *       headings: ["h2"],
 *       detailedHeadings: [
 *         { level: "h2", numLevel: 2, text: "Analytics" }
 *       ],
 *       children: []
 *     }
 *   ]
 * };
 * ```
 */
export type RegionMapping = {
  /** Structural identifier of the region node (e.g., `"main"`, `"section"`, or `"div[role=\"navigation\"]"`). */
  tagName: string;

  /** Array of normalized string heading levels discovered directly within this region scope (e.g., `["h1", "h2"]`). */
  headings: string[];

  /** Rich metadata descriptors for each heading discovered within this region scope. */
  detailedHeadings: HeadingDetail[];

  /** Direct child landmark regions nested within this structural scope. */
  children: RegionMapping[];
};
