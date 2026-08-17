/**
 * Low-level DOM primitives, zero-indexed heading depth arithmetic, and WAI-ARIA landmark utilities.
 *
 * @module shared/dom
 */

export type { HeadingLevel } from "./types";
export { calculateNextHeadingLevel } from "./utils/calculate-heading-level";
export {
  LANDMARK_SELECTOR,
  getRegionIdentifier,
} from "./utils/get-region-identifier";
