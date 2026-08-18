import { checkNormalizedHeadingReport, drawRegion } from "@/src/core/audit";
import { Locator, Page } from "@playwright/test";
import { Window } from "happy-dom";
import { InitialHeading } from "../types";

const w = new Window();
const parser = new w.DOMParser();

/**
 * Custom Playwright matcher that audits the heading hierarchy of a `Page` or `Locator` target.
 *
 * Extracts the DOM tree from the target, constructs a semantic region hierarchy using `drawRegion`,
 * and validates heading levels against normalized WCAG accessibility rules via `checkNormalizedHeadingReport`.
 *
 * @param target - The Playwright `Page` or `Locator` instance to audit.
 * @param initialLevel - Starting heading level context (default: `1`).
 *                       Set higher (e.g. `2` or `3`) when auditing isolated components/widgets
 *                       expected to sit within a parent sectioning container.
 *
 * @returns Playwright assertion result object with pass/fail status and formatted violation reports.
 *
 * @example
 * // Audit full page starting at H1
 * await expect(page).toHaveValidHeadingHierarchy();
 *
 * @example
 * // Audit an isolated card or section container assuming ambient level H2
 * await expect(page.locator("main section.widget")).toHaveValidHeadingHierarchy(2);
 */
export async function toHaveValidHeadingHierarchy(
  target: Page | Locator,
  initialLevel: InitialHeading = 1,
) {
  const locator = "locator" in target ? target.locator("body") : target;
  const elementHandle = await locator.elementHandle();

  if (!elementHandle) {
    return {
      message: () => "Failed to locate DOM element to audit heading hierarchy.",
      pass: false,
    };
  }

  const html = await elementHandle.evaluate((e) => e.outerHTML);

  if (!html) {
    return {
      message: () =>
        "Failed to extract outer HTML for heading hierarchy audit.",
      pass: false,
    };
  }

  const content = parser.parseFromString(html, "text/html");
  const rootElement = content.body.firstElementChild || content.body;
  const regionTree = drawRegion(rootElement as unknown as Element);

  const report = checkNormalizedHeadingReport({
    region: regionTree,
    level: initialLevel,
  });

  if (report.isValid) {
    return {
      message: () => "No violations found in heading hierarchy.",
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
