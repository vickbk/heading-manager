import { HeadingOrderError, HeadingOrderReport, RegionMapping } from "../types";
import { resolveHeadingDetail } from "./resolve-heading-details";

/**
 * Recursively validates heading order across a RegionMapping tree.
 * Enriches reporting with heading inner text and live DOM element references.
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

export function checkHeadingOrder(
  region: RegionMapping,
  initialLevel = 1,
): boolean {
  return checkHeadingOrderReport(region, initialLevel).isValid;
}
