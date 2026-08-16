/**
 * Central barrel subpath export for DOM parsing and WCAG heading hierarchy validation utilities.
 *
 * @module utils
 * @description Provides low-level functions for parsing DOM landmark trees (`drawRegion`),
 * evaluating WCAG 2.1 SC 1.3.1 compliance (`checkHeadingOrderReport`, `checkHeadingOrder`),
 * and calculating heading levels (`calculateNextHeadingLevel`, `parseHeadingLevel`, `resolveHeadingDetail`).
 */
export { drawRegion } from "./modules/region";
export { checkHeadingOrderReport } from "./utils/check-heading-order-report";
