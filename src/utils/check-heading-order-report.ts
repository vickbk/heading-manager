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

  let resolvedLevel = currentLevel;
  const headingInfo = resolveHeadingDetail(region);

  if (headingInfo) {
    const { rawHeading, parsedLevel, text, element } = headingInfo;
    const textLabel = text ? ` ("${text}")` : "";

    const common = {
      path,
      tagName: region.tagName,
      heading: rawHeading,
      text,
      element,
    };
    if (parsedLevel === null) {
      errors.push({
        ...common,
        actualLevel: -1,
        expectedMaxLevel: Math.min(currentLevel + 1, 6),
        message: `Unparseable heading "${rawHeading}"${textLabel} at ${path}. Must contain a valid heading level (1-6).`,
      });
    } else if (parsedLevel < 1 || parsedLevel > 6) {
      errors.push({
        ...common,
        actualLevel: parsedLevel,
        expectedMaxLevel: 6,
        message: `Invalid HTML heading level H${parsedLevel}${textLabel} at ${path}. Heading level must be between H1 and H6.`,
      });
    } else {
      const diff = parsedLevel - currentLevel;

      if (diff > 1) {
        const expectedMax = Math.min(currentLevel + 1, 6);
        errors.push({
          ...common,
          actualLevel: parsedLevel,
          expectedMaxLevel: expectedMax,
          message: `Heading level skipped at ${path}${textLabel}: context level is H${currentLevel}, expected maximum H${expectedMax}, but found H${parsedLevel}.`,
        });
      }

      resolvedLevel = parsedLevel;
    }
  }

  if (region.children && region.children.length > 0) {
    region.children.forEach((child, index) => {
      const childPath = `${path} > ${child.tagName}[${index}]`;
      checkHeadingOrderReport(child, resolvedLevel, childPath, errors);
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
