/**
 * Package entry point for the framework-agnostic core utilities: `react-heading-manager/utils`.
 *
 * This subpath exposes the WCAG audit engine, DOM tree parsing utilities, and
 * heading report helpers used to inspect a document or region tree without pulling
 * in React runtime code.
 *
 * @module react-heading-manager/utils
 */
export {
  checkHeadingOrder,
  checkHeadingOrderReport,
  checkNormalizedHeading,
  checkNormalizedHeadingReport,
  drawRegion,
  getHeadingLevel,
  getRegionHeadings,
  parseHeadingLevel,
  resolveHeadingDetail,
} from "@/src/core/audit/utils";
export {
  calculateNextHeadingLevel,
  getRegionIdentifier,
  type HeadingLevel,
} from "@/src/shared/dom";
