import type { RegionMapping } from "./modules/region";

/**
 * Detailed error record for a heading hierarchy auditing rule issue.
 *
 * @remarks
 * **Auditing Rule Checks:**
 * - **Level Skipping:** A heading skips one or more intermediate sequential levels (e.g., `<h1>` directly followed by `<h3>`).
 * - **Unrecognized HTML Level:** Native HTML heading tags are structurally bounded to levels 1–6 (`<h1>`–`<h6>`). Note that ARIA `aria-level` supports arbitrary positive integers ($1 \dots N$).
 *
 * @see {@link https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html | WCAG 2.1 SC 1.3.1 Info and Relationships}
 * @see {@link https://www.w3.org/WAI/WCAG21/Techniques/general/G141.html | Technique G141: Organizing a page using headings}
 *
 * @example
 * ```ts
 * const error: HeadingOrderError = {
 *   path: "main[0] > section[1]",
 *   tagName: "section",
 *   heading: "h3",
 *   text: "Section Details",
 *   actualLevel: 3,
 *   expectedMaxLevel: 2,
 *   message: 'Sequential heading hierarchy rule: "h3" skips level "h2" following "h1".',
 * };
 * ```
 */
export type HeadingOrderError = {
  /** Selector-style structural path identifying the region node location (e.g., `"main[0] > section[1]"`). */
  path: string;

  /** HTML tag name or landmark identifier of the containing region node. */
  tagName: string;

  /** Normalized heading level descriptor string (e.g., `"h1"`, `"h3"`). */
  heading: string;

  /** Accessible text content extracted from the heading element. */
  text?: string;

  /** Reference to the underlying DOM node (if executed within a browser DOM context). */
  element?: unknown;

  /** Resolved numeric level of the audited heading (e.g., `3` for `"h3"`). */
  actualLevel: number;

  /** Maximum expected sequential level based on preceding hierarchy context (e.g., `2` following an `<h1>`). */
  expectedMaxLevel: number;

  /** Human-readable explanation of the heading hierarchy auditing rule finding. */
  message: string;
};

/**
 * Comprehensive audit report returned by heading hierarchy sequence validation routines.
 *
 * @example
 * ```ts
 * const report: HeadingOrderReport = {
 *   isValid: false,
 *   errors: [
 *     {
 *       path: "body[0] > main[0]",
 *       tagName: "main",
 *       heading: "h3",
 *       text: "Skipped Title",
 *       actualLevel: 3,
 *       expectedMaxLevel: 2,
 *       message: 'Sequential heading hierarchy rule: "h3" skips level "h2" following "h1".',
 *     },
 *   ],
 * };
 * ```
 */
export type HeadingOrderReport = {
  /** Indicates whether the audited region passes all configured sequential heading hierarchy rules. */
  isValid: boolean;

  /** Array of detected heading hierarchy rule issues. Empty when `isValid` is `true`. */
  errors: HeadingOrderError[];
};

/**
 * Parameter context object passed into recursive heading hierarchy evaluation routines.
 *
 * @remarks
 * Tracks depth, accumulated selector paths, and detected hierarchy issues during
 * depth-first traversal of a `RegionMapping` tree.
 */
export type ProcessHeadingLevelParams = {
  /** The baseline expected maximum level for sequential progression checks. */
  level: number;

  /** The current `RegionMapping` landmark node being audited. */
  region: RegionMapping;

  /** Accumulated selector-style path string locating the `region` within the landmark tree. */
  path: string;

  /** Mutable array collecting accumulated `HeadingOrderError` records during traversal. */
  errors: HeadingOrderError[];
};
