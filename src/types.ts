export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 0;

export type HeadingDetail = {
  /** Tag string (e.g. "h2") or explicit numerical level (e.g. 2) */
  level: string | number;
  /** Visible inner text of the heading element (e.g. "Pricing Plans") */
  text?: string;
  /** Optional reference to the underlying DOM node or custom element context */
  element?: unknown;
};

export type RegionMapping = {
  tagName: string;
  /** Legacy string-only headings array */
  headings: string[];
  /** Rich heading metadata with inner text and DOM element references */
  detailedHeadings?: HeadingDetail[];
  children: RegionMapping[];
};

export type HeadingOrderError = {
  /** Selector-style path to the node (e.g., "main[0] > section[1]") */
  path: string;
  /** HTML tag name of the region node */
  tagName: string;
  /** Raw heading tag or level descriptor */
  heading: string;
  /** Visible text content inside the heading element */
  text?: string;
  /** Optional reference to live DOM node */
  element?: unknown;
  /** Parsed numerical level (e.g., 4 for "h4") */
  actualLevel: number;
  /** Maximum allowed level at this context */
  expectedMaxLevel: number;
  /** Human-readable error description */
  message: string;
};

export type HeadingOrderReport = {
  isValid: boolean;
  errors: HeadingOrderError[];
};
