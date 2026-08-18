import "@playwright/test";

/**
 * Valid 1-based HTML heading levels (`1` for `<h1>` through `6` for `<h6>`).
 *
 * Denotes the starting heading level context when evaluating a page or isolated
 * sectioning scope for accessibility hierarchy compliance.
 */
export type InitialHeading = 1 | 2 | 3 | 4 | 5 | 6;

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
