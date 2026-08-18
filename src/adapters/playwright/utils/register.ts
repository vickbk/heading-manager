import { expect } from "@playwright/test";
import { toHaveValidHeadingHierarchy } from "./to-have-valid-heading-hierarchy";

/**
 * Registers `react-heading-manager` custom assertion matchers with Playwright.
 *
 * Extends the provided `expect` instance (or default `@playwright/test` `expect`)
 * with the `toHaveValidHeadingHierarchy` matcher for WCAG heading accessibility checks.
 *
 * @param customExpect - The Playwright `expect` instance to extend. Defaults to Playwright's global `expect`.
 *
 * @example
 * ```ts
 * // e2e/setup.ts or spec file
 * import { expect } from "@playwright/test";
 * import { registerPlaywright } from "react-heading-manager/playwright";

 * registerPlaywright(expect);
 * ```
 */
export function registerPlaywright(customExpect = expect) {
  customExpect.extend({
    toHaveValidHeadingHierarchy,
  });
}
