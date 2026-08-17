/**
 * Core utility point for DOM landmark tree parsing and sequential heading hierarchy auditing.
 *
 * @module core/auditor/utils
 */

// Primary Types
export type {
  HeadingOrderError,
  HeadingOrderReport,
  ProcessHeadingLevelParams,
} from "../types";

export type { HeadingDetail, RegionMapping } from "../modules/region/types";

// Primary Normalized API (Recommended)
export {
  checkNormalizedHeading,
  checkNormalizedHeadingReport,
} from "./check-normalized-heading-report";
export { processNormalizedHeadingLevel } from "./process-normalized-heading-level";

// DOM Parsing & Region Extraction
export {
  drawRegion,
  getHeadingLevel,
  getRegionHeadings,
} from "../modules/region/utils";

// Deprecated / Legacy API (Maintained for Backwards Compatibility)
export {
  checkHeadingOrder,
  checkHeadingOrderReport,
} from "./check-heading-order-report";
export { parseHeadingLevel } from "./parse-heading-level";
export { processHeadingLevel } from "./process-heading-level";
export { resolveHeadingDetail } from "./resolve-heading-details";
