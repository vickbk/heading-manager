import type { Page } from "@playwright/test";
export type CustomPage = Page;

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Asserts that the page or locator container contains a valid, non-skipping
       * WCAG heading hierarchy (e.g. h1 -> h2 -> h3 without jumping levels).
       *
       * @param initialLevel - Optional starting heading level context (default: 1).
       */
      toHaveValidHeadingHierarchy(intialLevel?: number): Promise<R>;
    }
  }
}
