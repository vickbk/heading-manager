import { ProcessHeadingLevelParams } from "../types";
import { resolveHeadingDetail } from "./resolve-heading-details";

/**
 * Processes the headings belonging to a region using the legacy heading
 * resolution strategy.
 *
 * The function maintains the current heading hierarchy level while
 * processing the region's headings and returns the final level to be used
 * as the context for child regions.
 *
 * Heading details are resolved through `resolveHeadingDetail()`, allowing
 * this processor to remain compatible with `RegionMapping` instances that
 * contain legacy `headings` data without populated `detailedHeadings`.
 *
 * A heading hierarchy error is reported when a resolved heading level
 * increases by more than one level relative to the current running level.
 *
 * Invalid or unparseable heading levels are also reported according to
 * the legacy validation rules.
 *
 * @param params - Heading processing context.
 * @param params.level - Current heading hierarchy level inherited from the
 *   parent region.
 * @param params.region - Region whose headings should be processed.
 * @param params.path - Selector-style breadcrumb identifying the region.
 * @param params.errors - Mutable accumulator receiving any detected
 *   heading-order errors.
 *
 * @returns The final resolved heading level of the region. This value is
 *   passed to child regions as their heading hierarchy context.
 *
 * @remarks
 * This function intentionally preserves the legacy heading-resolution
 * behavior. The normalized implementation is provided by
 * `processNormalizedHeadingLevel()`.
 */
export function processHeadingLevel({
  level,
  region,
  path,
  errors,
}: ProcessHeadingLevelParams): number {
  let runningLevel = level;

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
  return runningLevel;
}
