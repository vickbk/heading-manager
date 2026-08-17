import type { ProcessHeadingLevelParams } from "../types";

/**
 * Processes normalized heading details belonging to a region.
 *
 * The normalized heading level is treated as the canonical numeric
 * representation. Levels greater than H6 are therefore preserved rather
 * than rejected or clamped.
 *
 * This function is the deterministic counterpart to `processHeadingLevel`.
 * It operates exclusively on `HeadingDetail.numLevel` and therefore does
 * not parse, infer, or reinterpret heading-level strings.
 *
 * A heading hierarchy error is reported when the current heading increases
 * by more than one level relative to the running hierarchy context.
 *
 * Examples:
 *
 * - H1 → H2: valid
 * - H2 → H3: valid
 * - H2 → H4: hierarchy error
 * - H6 → H7: valid
 * - H6 → H8: hierarchy error
 * - H7 → H10: hierarchy error
 *
 * @param params - Normalized heading processing context.
 * @param params.level - Current heading hierarchy level inherited from the
 *   parent region.
 * @param params.region - Region whose normalized heading details should be
 *   processed.
 * @param params.path - Selector-style breadcrumb identifying the region.
 * @param params.errors - Mutable accumulator receiving detected hierarchy
 *   errors.
 *
 * @returns The final normalized heading level encountered in the region.
 *   This becomes the hierarchy context for child regions.
 *
 * @remarks
 * `detailedHeadings` is intentionally used as the sole heading source here.
 * Unlike the legacy processor, this function does not fall back to the
 * legacy `headings` representation. Callers using this API are expected to
 * provide normalized `HeadingDetail` objects containing `numLevel`.
 *
 * @a11y Performs normalized heading hierarchy analysis as part of
 * accessibility auditing. The sequential heading-level rule is an
 * accessibility auditing heuristic and should not be interpreted as a
 * direct statement of WCAG conformance.
 */
export function processNormalizedHeadingLevel({
  level,
  region,
  path,
  errors,
}: ProcessHeadingLevelParams): number {
  let runningLevel = level;

  for (let index = 0; index < region.detailedHeadings.length; index++) {
    const heading = region.detailedHeadings[index];

    if (!heading) {
      continue;
    }

    const headingPath =
      region.detailedHeadings.length > 1
        ? `${path} [heading ${index + 1}]`
        : path;

    const textLabel = heading.text ? ` ("${heading.text}")` : "";

    const expectedMaxLevel = runningLevel + 1;

    if (heading.numLevel > expectedMaxLevel) {
      errors.push({
        path: headingPath,
        tagName: region.tagName,
        heading: heading.level,
        text: heading.text,
        element: heading.element,
        actualLevel: heading.numLevel,
        expectedMaxLevel,
        message:
          `Heading level skipped at ${headingPath}${textLabel}: ` +
          `context level is H${runningLevel}, ` +
          `expected maximum H${expectedMaxLevel}, ` +
          `but found H${heading.numLevel}.`,
      });
    }

    runningLevel = heading.numLevel;
  }

  return runningLevel;
}
