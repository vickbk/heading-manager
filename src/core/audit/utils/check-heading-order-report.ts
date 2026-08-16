import { HeadingOrderError, HeadingOrderReport, RegionMapping } from "../types";
import { resolveHeadingDetail } from "./resolve-heading-details";

/**
 * Recursively audits a `RegionMapping` tree for WCAG 2.1 SC 1.3.1 heading hierarchy violations.
 *
 * @description Traverses region mapping nodes and verifies that heading levels progress sequentially without skipping levels
 * (e.g. H1 -> H3 is flagged as an error). Enriches errors with node paths, inner text, and DOM references.
 *
 * @param region - The `RegionMapping` tree node emitted by `drawRegion`.
 * @param currentLevel - Starting 1-based numerical context level (defaults to `1` / H1).
 * @param path - Internal selector-style breadcrumb path tracking tree location.
 * @param errors - Internal accumulator array tracking accumulated `HeadingOrderError` objects.
 * @returns A `HeadingOrderReport` object containing `isValid` boolean and list of `HeadingOrderError` objects.
 *
 * @example
 * ```ts
 * const report = checkHeadingOrderReport(regionTree);
 * if (!report.isValid) {
 *   console.error("Accessibility violations found:", report.errors);
 * }
 * ```
 *
 * @a11y Audits document hierarchy against WCAG 2.1 SC 1.3.1 (Info and Relationships).
 */
export function checkHeadingOrderReport(
  region: RegionMapping,
  currentLevel = 1,
  path = region ? `${region.tagName}[0]` : "",
  errors: HeadingOrderError[] = [],
): HeadingOrderReport {
  if (!region) {
    return { isValid: errors.length === 0, errors };
  }

  let runningLevel = currentLevel;

  const totalHeadings = Math.max(
    region.detailedHeadings?.length ?? 0,
    region.headings.length,
  );

  for (let i = 0; i < totalHeadings; i++) {
    const headingInfo = resolveHeadingDetail(region, i);
    if (!headingInfo) continue;

    const { rawHeading, parsedLevel, text, element } = headingInfo;
    const textLabel = text ? ` ("${text}")` : "";
    const headingPath = totalHeadings > 1 ? `${path} [heading ${i + 1}]` : path;

    const common = {
      path: headingPath,
      tagName: region.tagName,
      heading: rawHeading,
      text,
      element,
    };

    if (parsedLevel === null) {
      errors.push({
        ...common,
        actualLevel: -1,
        expectedMaxLevel: Math.min(runningLevel + 1, 6),
        message: `Unparseable heading "${rawHeading}"${textLabel} at ${headingPath}. Must contain a valid heading level (1-6).`,
      });
    } else if (parsedLevel < 1 || parsedLevel > 6) {
      errors.push({
        ...common,
        actualLevel: parsedLevel,
        expectedMaxLevel: 6,
        message: `Invalid HTML heading level H${parsedLevel}${textLabel} at ${headingPath}. Heading level must be between H1 and H6.`,
      });
    } else {
      const diff = parsedLevel - runningLevel;

      if (diff > 1) {
        const expectedMax = Math.min(runningLevel + 1, 6);
        errors.push({
          ...common,
          actualLevel: parsedLevel,
          expectedMaxLevel: expectedMax,
          message: `Heading level skipped at ${headingPath}${textLabel}: context level is H${runningLevel}, expected maximum H${expectedMax}, but found H${parsedLevel}.`,
        });
      }

      // Update running level for subsequent headings or child regions
      runningLevel = parsedLevel;
    }
  }

  // Pass updated runningLevel to child regions
  if (region.children && region.children.length > 0) {
    region.children.forEach((child, index) => {
      const childPath = `${path} > ${child.tagName}[${index}]`;
      checkHeadingOrderReport(child, runningLevel, childPath, errors);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Boolean helper that evaluates whether a `RegionMapping` tree satisfies WCAG heading hierarchy rules.
 *
 * @description Wraps `checkHeadingOrderReport` and returns `true` if no violations are detected, or `false` otherwise.
 *
 * @param region - The `RegionMapping` tree node to evaluate.
 * @param initialLevel - Starting 1-based heading context level (defaults to `1`).
 * @returns `true` if heading hierarchy is valid; `false` if any level skipping occurs.
 *
 * @example
 * ```ts
 * const isWCAGCompliant = checkHeadingOrder(regionTree);
 * ```
 *
 * @a11y Validates WCAG 2.1 SC 1.3.1 compliance.
 */
export function checkHeadingOrder(
  region: RegionMapping,
  initialLevel = 1,
): boolean {
  return checkHeadingOrderReport(region, initialLevel).isValid;
}
