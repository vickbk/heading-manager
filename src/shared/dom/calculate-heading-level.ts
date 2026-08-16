import { HeadingLevel } from "../types";

/**
 * Calculates the next 0-based heading level index (0 to 5), enforcing maximum depth clamping at 5 (H6).
 *
 * @description Given the current context level index (where `0` = H1, `1` = H2, ..., `5` = H6), computes the next sequential level.
 * If `hasH1` is `false` and `currentLevel` is `0`, returns `0` (H1). Otherwise increments the level, clamping at `5`.
 *
 * @param currentLevel - Current 0-based `HeadingLevel` index (`0` through `5`).
 * @param hasH1 - Whether an H1 heading already exists in the current section or page.
 * @returns The computed next 0-based `HeadingLevel` index.
 *
 * @example
 * ```ts
 * const next = calculateNextHeadingLevel(0, true); // 1 (H2)
 * ```
 *
 * @a11y Guarantees sequential heading level stepping and prevents invalid levels beyond H6 (WCAG 2.1 SC 1.3.1).
 */
export function calculateNextHeadingLevel(
  currentLevel: HeadingLevel,
  hasH1: boolean,
): HeadingLevel {
  if (!hasH1 && currentLevel === 0) {
    return 0;
  }

  return (currentLevel === 5 ? 5 : currentLevel + 1) as HeadingLevel;
}
