import type { ProcessHeadingLevelParams } from "../types";

/**
 * Processes normalized heading details within a region and checks for sequential level skips.
 *
 * @param params - Processing context containing running level, target region, accumulated path, and errors list.
 * @param params.level - Current heading hierarchy level inherited from the
 *   parent region.
 * @param params.region - Region whose normalized heading details should be
 *   processed.
 * @param params.path - Selector-style breadcrumb identifying the region.
 * @param params.errors - Mutable accumulator receiving detected hierarchy
 *   errors.
 *
 * @returns The final normalized numeric heading level encountered in the region context.
 *
 * @remarks
 * **Normalized Execution Contract:**
 * - Operates exclusively on `HeadingDetail.numLevel` without string parsing or level clamping.
 * - Supports unbounded numeric levels ($1 \dots N$), reflecting WAI-ARIA `aria-level` capabilities (e.g., $H6 \rightarrow H7$ is valid, $H6 \rightarrow H8$ is a skipped level).
 * - Serves as the primary deterministic alternative to the deprecated `processHeadingLevel`.
 *
 * **Auditing Heuristic:**
 * Reports an error when a heading's level increases by more than 1 relative to the preceding heading.
 *
 * @example
 * ```ts
 * const finalLevel = processNormalizedHeadingLevel({
 *   level: 1,
 *   region: currentRegion,
 *   path: "main[0]",
 *   errors: accumulatedErrors,
 * });
 * ```
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
