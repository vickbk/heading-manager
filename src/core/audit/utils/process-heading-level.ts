import { ProcessHeadingLevelParams } from "../types";
import { resolveHeadingDetail } from "./resolve-heading-details";

/**
 * Legacy processor that evaluates region headings using string parsing and level clamping.
 *
 * @deprecated Use {@link processNormalizedHeadingLevel} instead.
 *
 * @param params - Context object containing current `level`, `region`, `path`, and `errors`.
 * @param params.level - Current heading hierarchy level inherited from the
 *   parent region.
 * @param params.region - Region whose headings should be processed.
 * @param params.path - Selector-style breadcrumb identifying the region.
 * @param params.errors - Mutable accumulator receiving any detected
 *   heading-order errors.
 *
 * @returns Final heading level context passed to child regions.
 *
 * @remarks
 * **Migration Note:** Unlike `processNormalizedHeadingLevel`, this function clamps max expected levels
 * to H6 and attempts regex string extraction on legacy `headings` string arrays.
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

      runningLevel = parsedLevel;
    }
  }
  return runningLevel;
}
