import "@playwright/test";

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Asserts that the target `Page` or `Locator` adheres to standard accessibility heading hierarchy rules
       * (e.g., no skipped levels going down, valid landmark scoping, and H1–H6 bounds).
       *
       * @param initialLevel - Optional starting heading level context (default: 1).
       */
      toBeValidHeadingHierarchy(): Promise<R>;
    }
  }
}
