import { expect } from "@playwright/test";
import { toHaveValidHeadingHierarchy } from "./to-have-valid-heading-hierarchy";

export function registerPlaywright(customExpect = expect) {
  customExpect.extend({
    toHaveValidHeadingHierarchy,
  });
}
