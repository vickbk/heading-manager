import type { HeadingOrderReport, ProcessHeadingLevelParams } from "../types";
import { processNormalizedHeadingLevel } from "./process-normalized-heading-level";

/**
 * Recursively audits a `RegionMapping` tree for sequential heading hierarchy issues using normalized numeric levels.
 *
 * @param params - Partial processing context containing optional `region`, baseline `level`, `path`, and `errors`.
 * @param params.region - The `RegionMapping` node to audit. Defaults to an
 *   empty region when omitted.
 * @param params.level - Heading hierarchy level inherited from the parent
 *   region. Defaults to `1` (H1).
 * @param params.path - Selector-style breadcrumb identifying the current
 *   region. Defaults to the root region path.
 * @param params.errors - Mutable accumulator used to collect errors during
 *   recursive traversal. Defaults to an empty array.
 *
 * @returns An audit report detailing tree validity and any detected heading sequence issues.
 *
 * @remarks
 * **Recommended Entry Point:** This is the primary API for heading hierarchy auditing.
 * It replaces the deprecated `checkHeadingOrderReport()` by processing `HeadingDetail.numLevel`
 * directly without string parsing overhead or H1–H6 clamping limits.
 *
 * @example
 * ```ts
 * const report = checkNormalizedHeadingReport({
 *   region: regionTree,
 * });

 * if (!report.isValid) {
 *   console.warn("Detected heading hierarchy issues:", report.errors);
 * }
 * ```
 */
export function checkNormalizedHeadingReport(
  params: Partial<ProcessHeadingLevelParams> = {},
): HeadingOrderReport {
  const {
    region = { tagName: "", headings: [], children: [], detailedHeadings: [] },
    level: currentLevel = 1,
    path = `${region.tagName}[0]`,
    errors = [],
  } = params;

  const runningLevel = processNormalizedHeadingLevel({
    level: currentLevel,
    region,
    path,
    errors,
  });

  region.children.forEach((child, index) => {
    checkNormalizedHeadingReport({
      level: runningLevel,
      region: child,
      path: `${path} > ${child.tagName}[${index}]`,
      errors,
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Convenience boolean check evaluating whether a `RegionMapping` tree complies with sequential heading rules.
 *
 * @param params - Partial processing context containing optional `region`, baseline `level`, `path`, and `errors`.
 * @param params.region - The `RegionMapping` node to audit. Defaults to an
 *   empty region when omitted.
 * @param params.level - Heading hierarchy level inherited from the parent
 *   region. Defaults to `1` (H1).
 * @param params.path - Selector-style breadcrumb identifying the current
 *   region. Defaults to the root region path.
 * @param params.errors - Mutable accumulator used to collect errors during
 *   recursive traversal. Defaults to an empty array.
 *
 * @returns `true` when no heading sequence issues are detected; otherwise `false`.
 *
 * @example
 * ```ts
 * const isValid = checkNormalizedHeading({ region: regionTree });
 * ```
 */
export function checkNormalizedHeading(
  params: Partial<ProcessHeadingLevelParams>,
): boolean {
  return checkNormalizedHeadingReport(params).isValid;
}
