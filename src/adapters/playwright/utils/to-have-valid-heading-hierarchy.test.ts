import { Locator, Page } from "@playwright/test";
import { Window } from "happy-dom";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from "vitest";
import { toHaveValidHeadingHierarchy } from "./to-have-valid-heading-hierarchy";

const window = new Window();
const parser = new window.DOMParser();

// Mock Playwright Locator / ElementHandle target for unit testing the matcher logic
function createMockPlaywrightTarget(htmlString: string) {
  const doc = parser.parseFromString(htmlString, "text/html");
  const targetEl = doc.body.firstElementChild || doc.body;

  return {
    locator: () => ({
      elementHandle: async () => ({
        evaluate: async (fn: (el: Element) => string) =>
          fn(targetEl as unknown as Element),
      }),
    }),
  };
}

describe("toHaveValidHeadingHierarchy Playwright Matcher", () => {
  it("returns pass: true when heading levels progress sequentially without skipping", async () => {
    const mockTarget = createMockPlaywrightTarget(`
      <main>
        <h1>Main Page Title</h1>
        <section>
          <h2>Section Title</h2>
          <article>
            <h3>Article Title</h3>
          </article>
        </section>
      </main>
    `);

    // @ts-expect-error Mock Playwright target for unit testing matcher
    const result = await toHaveValidHeadingHierarchy(mockTarget);

    expect(result.pass).toBe(true);
    expect(result.message()).toContain("No violation found");
  });

  it("returns pass: false and formatted error output when heading level is skipped (e.g. H1 -> H3)", async () => {
    const mockTarget = createMockPlaywrightTarget(`
      <main>
        <h1>Main Page Title</h1>
        <section>
          <h3>Skipped Level 3 Heading</h3>
        </section>
      </main>
    `);

    // @ts-expect-error Mock Playwright target for unit testing matcher
    const result = await toHaveValidHeadingHierarchy(mockTarget);

    expect(result.pass).toBe(false);
    expect(result.message()).toContain(
      "Found 1 heading accessibility hierarchy violation(s)",
    );
    expect(result.message()).toContain("Heading level skipped");
  });

  describe("Exhaustive test suite", async () => {
    const utils = await import("@/src/core/audit");
    const _drawRegion = utils.drawRegion;

    describe("toHaveValidHeadingHierarchy", () => {
      let mockDrawRegion: MockInstance;
      let mockCheckHeadingOrderReport: MockInstance;

      beforeEach(() => {
        mockDrawRegion = vi.spyOn(utils, "drawRegion");
        mockCheckHeadingOrderReport = vi.spyOn(
          utils,
          "checkHeadingOrderReport",
        );
      });
      afterEach(() => {
        vi.clearAllMocks();
      });

      // Helper factory for Playwright ElementHandle mock
      const createMockElementHandle = (
        outerHTML: string | null = "<div></div>",
      ) => ({
        evaluate: vi
          .fn()
          .mockImplementation((_fn: (e: HTMLElement) => string) => {
            if (outerHTML === null) return Promise.resolve(null);
            // Simulate evaluate returning outerHTML
            return Promise.resolve(outerHTML);
          }),
      });

      // Helper factory for Playwright Locator mock
      const createMockLocator = (
        elementHandleMock = createMockElementHandle(),
      ) => ({
        elementHandle: vi.fn().mockResolvedValue(elementHandleMock),
      });

      // Helper factory for Playwright Page mock
      const createMockPage = (locatorMock = createMockLocator()) => ({
        locator: vi.fn().mockReturnValue(locatorMock),
      });

      describe("Target Resolution (Page vs Locator)", () => {
        it("should query body locator when target is a Page instance", async () => {
          const mockLocator = createMockLocator();
          const mockPage = createMockPage(mockLocator);

          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockPage as unknown as Page,
          );

          expect(mockPage.locator).toHaveBeenCalledWith("body");
          expect(mockLocator.elementHandle).toHaveBeenCalledTimes(1);
          expect(result.pass).toBe(true);
        });

        it("should use the target directly when target is a Locator instance", async () => {
          const mockLocator = createMockLocator();

          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(mockLocator.elementHandle).toHaveBeenCalledTimes(1);
          expect(result.pass).toBe(true);
        });
      });

      describe("Element Handle & HTML Resolution Failures", () => {
        it("should return pass=false if elementHandle returns null", async () => {
          const mockLocator = {
            elementHandle: vi.fn().mockResolvedValue(null),
          };

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(false);
          expect(result.message()).toBe(
            "Failed to find element to audit heading hierarchy.",
          );
          expect(mockDrawRegion).not.toHaveBeenCalled();
        });

        it("should return pass=false if outerHTML evaluation returns empty or null string", async () => {
          const mockElementHandle = createMockElementHandle(null);
          const mockLocator = createMockLocator(
            mockElementHandle as unknown as ReturnType<
              typeof createMockElementHandle
            >,
          );

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(false);
          expect(result.message()).toBe(
            "HTML Failed to find element to audit heading hierarchy.",
          );
          expect(mockDrawRegion).not.toHaveBeenCalled();
        });
      });

      describe("Initial Level Parameter Propagation", () => {
        it("should default initialLevel to 1 when omitted", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          await toHaveValidHeadingHierarchy(mockLocator as unknown as Locator);

          expect(mockCheckHeadingOrderReport).toHaveBeenCalledWith(
            expect.anything(),
            1,
          );
        });

        it("should pass custom initialLevel to checkHeadingOrderReport", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
            3,
          );

          expect(mockCheckHeadingOrderReport).toHaveBeenCalledWith(
            expect.anything(),
            3,
          );
        });
      });

      describe("DOM Tree Parsing & Region Drawing", () => {
        it("should pass the first element child of the parsed HTML body to drawRegion", async () => {
          const htmlContent = '<main id="app"><h1>Title</h1></main>';
          const mockElementHandle = createMockElementHandle(htmlContent);
          const mockLocator = createMockLocator(
            mockElementHandle as unknown as ReturnType<
              typeof createMockElementHandle
            >,
          );

          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          await toHaveValidHeadingHierarchy(mockLocator as unknown as Locator);

          expect(mockDrawRegion).toHaveBeenCalledTimes(1);
          const passedElement = mockDrawRegion.mock.calls[0][0] as HTMLElement;
          expect(passedElement.tagName).toBe("MAIN");
          expect(passedElement.id).toBe("app");
        });

        it("should fallback to body element if HTML contains no firstElementChild", async () => {
          const htmlContent = "Text only node";
          const mockElementHandle = createMockElementHandle(htmlContent);
          const mockLocator = createMockLocator(
            mockElementHandle as unknown as ReturnType<
              typeof createMockElementHandle
            >,
          );

          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          await toHaveValidHeadingHierarchy(mockLocator as unknown as Locator);

          const passedElement = mockDrawRegion.mock.calls[0][0] as HTMLElement;
          expect(passedElement.tagName).toBe("BODY");
        });
      });

      describe("Validation Results & Message Formatting", () => {
        it("should return pass=true and success message when report is valid", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: true,
            errors: [],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(true);
          expect(result.message()).toBe(
            "No violation found in heading hieararchy",
          );
        });

        it("should format single error without text or selector info", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: false,
            errors: [
              {
                path: "body > div > h3",
                message: "Skipped heading level from H1 to H3.",
              },
            ],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(false);
          const expectedMessage =
            "Found 1 heading accessibility hierarchy violation(s):\n\n" +
            "1. Path: body > div > h3\n" +
            "   Message: Skipped heading level from H1 to H3.";

          expect(result.message()).toBe(expectedMessage);
        });

        it("should format errors containing text snippets and selector information", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: false,
            errors: [
              {
                path: "main > section > h4",
                message: "Heading level H4 found before H2 or H3.",
                text: "Section Details",
                element: "h4.details-title",
              },
            ],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(false);
          const expectedMessage =
            "Found 1 heading accessibility hierarchy violation(s):\n\n" +
            "1. Path: main > section > h4\n" +
            '   Message: Heading level H4 found before H2 or H3. ("Section Details") [Selector: h4.details-title]';

          expect(result.message()).toBe(expectedMessage);
        });

        it("should format multiple violations correctly joined by double newlines", async () => {
          const mockLocator = createMockLocator();
          mockDrawRegion.mockReturnValue(
            {} as unknown as ReturnType<typeof _drawRegion>,
          );
          mockCheckHeadingOrderReport.mockReturnValue({
            isValid: false,
            errors: [
              {
                path: "body > h3",
                message: "Missing H1",
                text: "Subheading",
              },
              {
                path: "body > h5",
                message: "Skipped H4",
                element: "h5#footer-heading",
              },
            ],
          });

          const result = await toHaveValidHeadingHierarchy(
            mockLocator as unknown as Locator,
          );

          expect(result.pass).toBe(false);
          const expectedMessage =
            "Found 2 heading accessibility hierarchy violation(s):\n\n" +
            "1. Path: body > h3\n" +
            '   Message: Missing H1 ("Subheading")\n\n' +
            "2. Path: body > h5\n" +
            "   Message: Skipped H4 [Selector: h5#footer-heading]";

          expect(result.message()).toBe(expectedMessage);
        });
      });
    });
  });
});
