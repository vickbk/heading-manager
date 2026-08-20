/**
 * Calculates the next zero-based normalized heading level index.
 *
 * The level progresses sequentially from the current heading context. When
 * `h6Clamp` is enabled, the returned level is capped at `5` (H6), preserving
 * the native HTML heading-element limit. When `h6Clamp` is disabled, the
 * normalized level may continue beyond H6 (e.g. `6` = H7, `7` = H8).
 *
 * @param currentLevel - Current zero-based normalized heading level index.
 *   `0` represents H1, `1` represents H2, ..., `5` represents H6, and
 *   values greater than `5` represent normalized levels beyond native H6.
 * @param hasH1 - Whether an H1 heading already exists in the current section
 *   context.
 * @param h6Clamp - Whether to clamp the computed level at H6 (`5`).
 *   Defaults to `true` for backward-compatible native HTML heading behavior.
 *   Set to `false` to allow normalized heading levels beyond H6.
 *
 * @returns The computed next zero-based normalized heading level index.
 *
 * @remarks
 * **H6 clamping:**
 * When `h6Clamp` is `true`, levels greater than H6 are not produced:
 *
 * ```text
 * H5 (4) → H6 (5)
 * H6 (5) → H6 (5)
 * ```
 *
 * When `h6Clamp` is `false`, the normalized hierarchy may continue beyond
 * the native HTML heading range:
 *
 * ```text
 * H5 (4) → H6 (5)
 * H6 (5) → H7 (6)
 * H7 (6) → H8 (7)
 * ```
 *
 * The normalized level should be preserved independently of how the heading
 * is eventually represented in HTML. Consumers that need native HTML
 * compatibility can render levels greater than H6 as H6 with an explicit
 * `role="heading"` and `aria-level`.
 *
 * **Accessibility (WCAG 2.1 SC 1.3.1):**
 * Supports deterministic sequential heading hierarchy management. H6
 * clamping is a rendering constraint rather than a requirement of the
 * normalized hierarchy itself.
 *
 * @example
 * ```ts
 * // First heading when no H1 exists -> H1 (0)
 * calculateNextHeadingLevel(0, false); // 0
 *
 * // Sequential increment when H1 exists -> H2 (1)
 * calculateNextHeadingLevel(0, true); // 1
 *
 * // Default behavior preserves the native H6 boundary
 * calculateNextHeadingLevel(5, true); // 5
 *
 * // Disable H6 clamping to continue the normalized hierarchy
 * calculateNextHeadingLevel(5, true, false); // 6 (H7)
 *
 * // Continue beyond H7
 * calculateNextHeadingLevel(6, true, false); // 7 (H8)
 * ```
 */
export function calculateNextHeadingLevel(
  currentLevel: number,
  hasH1: boolean,
  h6Clamp = true,
): number {
  if (!hasH1 && currentLevel === 0) {
    return 0;
  }

  return h6Clamp && currentLevel === 5 ? 5 : currentLevel + 1;
}
