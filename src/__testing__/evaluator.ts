/**
 * @file headingAssertions.ts
 * @description Custom Playwright assertion for auditing document heading hierarchy and accessibility compliance.
 */

import { expect } from "@playwright/test";
import { toHaveValidHeadingHierarchy } from "./helpers/to-have-valid-heading-hierarchy";

expect.extend({
  toHaveValidHeadingHierarchy,
});
