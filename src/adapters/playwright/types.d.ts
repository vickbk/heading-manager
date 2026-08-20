import "@playwright/test";

/**
 * Valid 1-based normalized heading level.
 *
 * `1` represents `<h1>`, `2` represents `<h2>`, and so on.
 * Normalized heading levels are not limited to the native HTML H1–H6 range.
 *
 * @remarks
 * Values must be positive integers (`>= 1`). There is no upper bound.
 */
export type InitialHeading = number;

declare global {
  namespace PlaywrightTest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T = unknown, _ = unknown> {
      /**
       * Asserts that the targeted `Page` or `Locator` contains a valid, WCAG-compliant
       * heading hierarchy without skipped levels (e.g., `<h1>` -> `<h2>` -> `<h3>`).
       *
       * Extracts the DOM structure, maps sectioning regions, and enforces normalized
       * heading progression rules in according with WCAG 2.1 SC 1.3.1.
       *
       * @param initialLevel - Optional starting heading level context (default: `1`).
       *                       Set to `2` or higher when auditing an isolated sub-component
       *                       expected to fit inside an outer sectioning landmark.
       *
       * @returns A promise resolving to the Playwright match result.
       *
       * @example
       * ```ts
       * // Audit full page hierarchy starting at H1
       * await expect(page).toHaveValidHeadingHierarchy();
       * ```
       *
       * @example
       * ```ts
       * // Audit an isolated card or component scope expecting ambient level H2
       * await expect(page.locator("main section.card")).toHaveValidHeadingHierarchy(2);
       * ```
       */
      toHaveValidHeadingHierarchy(initialLevel?: InitialHeading): Promise<R>;
    }
  }
}
