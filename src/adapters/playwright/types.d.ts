import "@playwright/test";

export type InitialHeading = 1 | 2 | 3 | 4 | 5 | 6;

declare global {
  namespace PlaywrightTest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R, T = unknown, _ = unknown> {
      /**
       * Asserts that the page or locator container contains a valid, non-skipping
       * WCAG heading hierarchy (e.g. h1 -> h2 -> h3 without jumping levels).
       *
       * @param initialLevel - Optional starting heading level context (default: 1).
       */
      toHaveValidHeadingHierarchy(initialLevel?: InitialHeading): Promise<R>;
    }
  }
}
