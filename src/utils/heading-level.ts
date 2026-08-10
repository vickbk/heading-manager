import { HeadingLevel } from "../types";

/**
 * Calculates the next 0-based heading level index (0 to 5).
 *
 * @param currentLevel 0-based index (0='h1', 1='h2', 2='h3', 3='h4', 4='h5', 5='h6')
 * @param hasH1 Whether the current section contains an H1 heading
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
