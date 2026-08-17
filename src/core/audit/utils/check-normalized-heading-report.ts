import type { HeadingOrderReport, ProcessHeadingLevelParams } from "../types";
import { processNormalizedHeadingLevel } from "./process-normalized-heading-level";

/**
 * Recursively audits a normalized `RegionMapping` tree for heading
 * hierarchy issues.
 *
 * Unlike the legacy `checkHeadingOrderReport()` API, this implementation
 * operates directly on `HeadingDetail.numLevel`. It therefore does not
 * parse heading-level strings or infer heading levels from legacy
 * `headings` values.
 *
 * A heading hierarchy issue is reported when a heading's normalized
 * numeric level increases by more than one level relative to the preceding
 * heading in the current traversal context.
 *
 * Heading levels greater than H6 are preserved and compared numerically.
 * For example, H6 → H7 is valid under the sequential hierarchy rule,
 * while H6 → H8 is reported as a skipped level.
 *
 * The function accepts the same processing context used by
 * `processNormalizedHeadingLevel()`. Using an object parameter makes the
 * recursive call sites explicit and avoids positional-argument ambiguity.
 *
 * @param params - Normalized heading-processing context.
 * @param params.region - The `RegionMapping` node to audit. Defaults to an
 *   empty region when omitted.
 * @param params.level - Heading hierarchy level inherited from the parent
 *   region. Defaults to `1` (H1).
 * @param params.path - Selector-style breadcrumb identifying the current
 *   region. Defaults to the root region path.
 * @param params.errors - Mutable accumulator used to collect errors during
 *   recursive traversal. Defaults to an empty array.
 *
 * @returns A `HeadingOrderReport` containing the validity state and all
 *   detected hierarchy errors.
 *
 * @example
 * ```ts
 * const report = checkNormalizedHeadingReport({
 *   region: regionTree,
 * });
 *
 * if (!report.isValid) {
 *   console.error(report.errors);
 * }
 * ```
 *
 * @a11y Performs normalized heading hierarchy analysis as part of
 * accessibility auditing. The sequential heading-level rule is an
 * accessibility auditing heuristic and should not be interpreted as a
 * direct statement of WCAG conformance.
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
 * Evaluates whether a normalized `RegionMapping` satisfies the heading
 * hierarchy rule.
 *
 * This is the boolean convenience API for `checkNormalizedHeadingReport()`.
 * It operates on the normalized numeric `HeadingDetail.numLevel` values.
 *
 * @param params - Normalized heading-processing context.
 * @returns `true` when no heading hierarchy errors are detected; otherwise
 *   `false`.
 *
 * @example
 * ```ts
 * const isValid = checkNormalizedHeading({
 *   region: regionTree,
 * });
 * ```
 */
export function checkNormalizedHeading(
  params: Partial<ProcessHeadingLevelParams>,
): boolean {
  return checkNormalizedHeadingReport(params).isValid;
}
