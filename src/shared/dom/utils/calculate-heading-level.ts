import { HeadingLevel } from "../types";

/**
 * Calculates the next zero-based heading level index, enforcing maximum depth clamping at `5` (H6).
 *
 * @param currentLevel - Current 0-based `HeadingLevel` index (`0` through `5`).
 * @param hasH1 - Whether an H1 heading already exists in the current section context.
 * @returns The computed next 0-based `HeadingLevel` index.
 *
 * @remarks
 * **Accessibility (WCAG 2.1 SC 1.3.1):** Guarantees sequential heading level progression and prevents levels beyond H6.
 *
 * @example
 * ```ts
 * // First heading when no H1 exists -> H1 (0)
 * calculateNextHeadingLevel(0, false); // 0
 *
 * // Sequential increment when H1 exists -> H2 (1)
 * calculateNextHeadingLevel(0, true);  // 1
 *
 * // Clamps at maximum depth H6 (5)
 * calculateNextHeadingLevel(5, true);  // 5
 * ```
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
