import { checkHeadingOrderReport } from "@/src/utils/check-heading-order-report";
import { drawRegion } from "@/src/utils/draw-region";
import { Locator, Page } from "@playwright/test";
import { Window } from "happy-dom";

const w = new Window();
const parser = new w.DOMParser();

/**
 * Custom Playwright matcher that audits the heading hierarchy of a Page or Locator target.
 *
 * It extracts the DOM tree, builds a region mapping using `drawRegion`, and verifies
 * sequential heading rules (`H1` to `H6`) using `checkHeadingOrderReport`.
 *
 * @param target - The Playwright `Page` or `Locator` instance to audit.
 * @param initialLevel - Optional starting heading level context (default: 1).
 *                       Useful when auditing sub-components expected to fit inside a parent H2 or H3.
 *
 * @returns An assertion result object with pass status and formatted failure messages.
 *
 * @example
 * // Audit an entire page
 * await expect(page).toHaveValidHeadingHierarchy();
 *
 * @example
 * // Audit a specific landmark or container starting with header level 2
 * await expect(page.locator('main[role="main"]')).toHaveValidHeadingHierarchy(2);
 */
export async function toHaveValidHeadingHierarchy(
  target: Page | Locator,
  initialLevel = 1,
) {
  const locator = "locator" in target ? target.locator("body") : target;
  const elementHandle = await locator.elementHandle();

  if (!elementHandle) {
    return {
      message: () => "Failed to find element to audit heading hierarchy.",
      pass: false,
    };
  }

  const html = await elementHandle.evaluate((e) => e.outerHTML);

  if (!html)
    return {
      message: () => "HTML Failed to find element to audit heading hierarchy.",
      pass: false,
    };

  const content = parser.parseFromString(html, "text/html");
  const regionTree = drawRegion(content.body as unknown as Element);

  const report = checkHeadingOrderReport(regionTree, initialLevel);

  if (report.isValid) {
    return {
      message: () => "No violation found in heading hieararchy",
      pass: true,
    };
  }

  const formattedErrors = report.errors
    .map((err, i) => {
      const textSnippet = err.text ? ` ("${err.text}")` : "";
      const selectorInfo = err.element ? ` [Selector: ${err.element}]` : "";
      return `${i + 1}. Path: ${err.path}\n   Message: ${err.message}${textSnippet}${selectorInfo}`;
    })
    .join("\n\n");

  return {
    message: () =>
      `Found ${report.errors.length} heading accessibility hierarchy violation(s):\n\n${formattedErrors}`,
    pass: false,
  };
}
