/**
 * Metadata descriptor for an individual heading element discovered in the DOM.
 *
 * @description Captures level, accessible text content, and DOM element handle.
 */
export type HeadingDetail = {
  /** Tag string (e.g. "h2") or explicit numerical level (e.g. 2) */
  level: string | number;
  /** Visible inner text of the heading element (e.g. "Pricing Plans") */
  text?: string;
  /** Optional reference to the underlying DOM node or custom element context */
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
