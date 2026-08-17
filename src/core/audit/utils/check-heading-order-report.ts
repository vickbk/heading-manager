import { RegionMapping } from "../modules/region";
import type { HeadingOrderError, HeadingOrderReport } from "../types";
import { processHeadingLevel } from "./process-heading-level";

/**
 * Recursively audits a `RegionMapping` tree for heading hierarchy issues
 * using the legacy heading representation.
 *
 * @deprecated Prefer `checkNormalizedHeadingReport()` for new code. This function
 * preserves the legacy heading-resolution behavior for existing consumers.
 *
 * This is the backwards-compatible heading-order API. It resolves heading
 * levels through `resolveHeadingDetail()` and supports `RegionMapping`
 * instances where `detailedHeadings` is unavailable or incomplete by
 * falling back to the legacy `headings` representation.
 *
 * Heading levels are considered to have a hierarchy issue when a heading
 * increases by more than one level relative to the preceding heading in
 * the current traversal context.
 *
 * This function preserves the existing heading-order behavior and should
 * be retained for backwards compatibility. For new code, prefer
 * `checkNormalizedHeadingReport()`, which operates directly on the
 * normalized `HeadingDetail.numLevel` representation.
 *
 * @param region - The root `RegionMapping` node to audit.
 * @param currentLevel - The heading level that establishes the hierarchy
 *   context for the current region. Defaults to `1` (H1).
 * @param path - Internal selector-style breadcrumb identifying the current
 *   region in the mapping tree. Defaults to the root region path.
 * @param errors - Internal accumulator used to collect heading-order errors
 *   while recursively traversing the region tree.
 *
 * @returns A `HeadingOrderReport` containing `isValid` and all detected
 *   heading-order errors.
 *
 * @example
 * ```ts
 * const report = checkHeadingOrderReport(regionTree);
 *
 * if (!report.isValid) {
 *   console.error(report.errors);
 * }
 * ```
 *
 * @a11y Performs heading hierarchy analysis as part of accessibility
 * auditing. The sequential heading-level rule is an auditing heuristic
 * and should not be interpreted as a direct statement of WCAG conformance.
 */
export function checkHeadingOrderReport(
  region: RegionMapping,
  currentLevel = 1,
  path = region ? `${region.tagName}[0]` : "",
  errors: HeadingOrderError[] = [],
): HeadingOrderReport {
  if (!region) {
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  const runningLevel = processHeadingLevel({
    level: currentLevel,
    region,
    path,
    errors,
  });

  region.children.forEach((child, index) => {
    checkHeadingOrderReport(
      child,
      runningLevel,
      `${path} > ${child.tagName}[${index}]`,
      errors,
    );
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates whether a `RegionMapping` satisfies the legacy heading-order
 * hierarchy rule.
 *
 * @deprecated Prefer `checkNormalizedHeading()` for new code. This function
 * preserves the legacy heading-resolution behavior for existing consumers.
 *
 * This is the backwards-compatible boolean API corresponding to
 * `checkHeadingOrderReport()`.
 *
 * @param region - The root `RegionMapping` node to audit.
 * @param initialLevel - The heading level that establishes the initial
 *   hierarchy context. Defaults to `1` (H1).
 *
 * @returns `true` when no heading-order errors are detected; otherwise `false`.
 */
export function checkHeadingOrder(
  region: RegionMapping,
  initialLevel = 1,
): boolean {
  return checkHeadingOrderReport(region, initialLevel).isValid;
}
