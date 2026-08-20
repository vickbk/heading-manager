import { RegionMapping } from "../modules/region";
import type { HeadingOrderError, HeadingOrderReport } from "../types";
import { processHeadingLevel } from "./process-heading-level";

/**
 * Recursively audits a `RegionMapping` tree using legacy heading level resolution rules.
 *
 * @deprecated Use {@link checkNormalizedHeadingReport} instead. This function is maintained solely for backwards compatibility.
 *
 * @param region - Target landmark region node to audit.
 * @param currentLevel - Baseline context heading level (defaults to `1`).
 * @param path - Breadcrumb string tracking the current region path.
 * @param errors - Mutable array accumulating heading errors.
 * @returns An audit report detailing hierarchy findings.
 *
 * @remarks
 * **Legacy Behavior Limitations:**
 * - Forces heading levels into the HTML range of H1–H6.
 * - Falls back to unparsed string arrays (`headings`) when detailed metadata is absent.
 *
 * **Migration Guide:**
 * Replace calls to `checkHeadingOrderReport(region)` with `checkNormalizedHeadingReport({ region })`.
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
 * Evaluates whether a `RegionMapping` complies with legacy heading sequence rules.
 *
 * @deprecated Use {@link checkNormalizedHeading} instead.
 *
 * @param region - Target landmark region node to audit.
 * @param initialLevel - Baseline context heading level (defaults to `1`).
 * @returns `true` if valid; otherwise `false`.
 */
export function checkHeadingOrder(
  region: RegionMapping,
  initialLevel = 1,
): boolean {
  return checkHeadingOrderReport(region, initialLevel).isValid;
}
