/**
 * Metadata descriptor for an individual heading element discovered in the DOM.
 *
 * @description Captures level, accessible text content, and DOM element handle.
 */
export type HeadingDetail = {
  /**
   * Normalized heading level represented in `hN` format.
   *
   * Examples: `h1`, `h2`, `h7`, `h10`.
   *
   * Kept as a string for backwards API compatibility.
   */
  level: string;

  /**
   * Normalized numeric heading level.
   *
   * This is the canonical value to use for heading hierarchy
   * comparisons and validation.
   *
   * Examples: `1`, `2`, `7`, `10`.
   */
  numLevel: number;

  /**
   * Trimmed heading text, falling back to `aria-label`.
   */
  text: string;

  /**
   * Original DOM heading element.
   *
   * Can be inspected to distinguish native HTML headings
   * (`h1`-`h6`) from ARIA headings (`role="heading"`).
   */
  element?: unknown;
};

/**
 * Tree representation of an HTML5 landmark sectioning element or ARIA region.
 *
 * @description Data structure emitted by `drawRegion` representing sectioning tree depth.
 * @a11y Maps HTML sectioning landmarks (main, section, article) and ARIA roles for hierarchy checking.
 */
export type RegionMapping = {
  /** Identifier of the region node (e.g. "main", "section", or "div[role=\"navigation\"]") */
  tagName: string;
  /** Legacy string-only headings array (e.g. ["h1", "h2"]) */
  headings: string[];
  /** Rich heading metadata with inner text and DOM element references */
  detailedHeadings: HeadingDetail[];
  /** Direct nested landmark child regions */
  children: RegionMapping[];
};
