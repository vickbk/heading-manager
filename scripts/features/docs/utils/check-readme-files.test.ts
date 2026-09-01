import type { DocumentationContract } from "@/docs/types";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FileValidationResult, ReadmeTarget } from "../modules/readme";
import { checkReadmeFile } from "../modules/readme";
import { checkReadmeFiles } from "./check-readme-files";

// Mock the single-file validator module dependency
vi.mock("./check-readme-file", () => ({
  checkReadmeFile: vi.fn(),
}));

describe("checkReadmeFiles", () => {
  const mockContract = {
    requiredSectionIds: ["overview"],
    preferredSectionOrder: ["overview"],
  } as DocumentationContract;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("Variadic Argument Handling", () => {
    it("should return an empty array when invoked with no arguments", async () => {
      const results = await checkReadmeFiles();

      expect(results).toEqual([]);
      expect(checkReadmeFile).not.toHaveBeenCalled();
    });

    it("should validate a single target when passed as a single argument", async () => {
      const target: ReadmeTarget = {
        path: "README.md",
        contract: mockContract,
      };

      const expectedResult: FileValidationResult = {
        path: "README.md",
        result: {
          isValid: true,
          diagnostics: [],
          foundSectionIds: ["overview"],
          missingRequiredSections: [],
          sections: [
            { id: "overview", heading: "Overview", level: 1, line: 1 },
          ],
        },
      };

      vi.mocked(checkReadmeFile).mockResolvedValue(expectedResult);

      const results = await checkReadmeFiles(target);

      expect(results).toEqual([expectedResult]);
      expect(checkReadmeFile).toHaveBeenCalledTimes(1);
      expect(checkReadmeFile).toHaveBeenCalledWith(target);
    });
  });

  describe("Concurrent Execution & Result Ordering", () => {
    it("should process multiple targets concurrently and preserve positional array order", async () => {
      const target1: ReadmeTarget = {
        path: "docs/A.md",
        contract: mockContract,
      };
      const target2: ReadmeTarget = {
        path: "docs/B.md",
        contract: mockContract,
      };
      const target3: ReadmeTarget = {
        path: "docs/C.md",
        contract: mockContract,
      };

      const result1: FileValidationResult = {
        path: "docs/A.md",
        result: {
          isValid: true,
          diagnostics: [],
          foundSectionIds: ["overview"],
          missingRequiredSections: [],
          sections: [],
        },
      };

      const result2: FileValidationResult = {
        path: "docs/B.md",
        result: {
          isValid: false,
          diagnostics: [
            {
              code: "missing-required-section",
              sectionId: "overview",
              expectedHeading: "Overview",
              message: 'Required README section "Overview" is missing.',
            },
          ],
          foundSectionIds: [],
          missingRequiredSections: ["overview"],
          sections: [],
        },
      };

      const result3: FileValidationResult = {
        path: "docs/C.md",
        result: {
          isValid: true,
          diagnostics: [],
          foundSectionIds: ["overview"],
          missingRequiredSections: [],
          sections: [],
        },
      };

      // Simulate execution out of order to ensure Promise.all preserves positional array indices
      vi.mocked(checkReadmeFile).mockImplementation(async (target) => {
        if (target.path === "docs/A.md") {
          return new Promise((resolve) =>
            setTimeout(() => resolve(result1), 30),
          );
        }
        if (target.path === "docs/B.md") {
          return new Promise((resolve) =>
            setTimeout(() => resolve(result2), 5),
          );
        }
        return Promise.resolve(result3);
      });

      const results = await checkReadmeFiles(target1, target2, target3);

      expect(results).toEqual([result1, result2, result3]);
      expect(checkReadmeFile).toHaveBeenCalledTimes(3);
      expect(checkReadmeFile).toHaveBeenNthCalledWith(1, target1);
      expect(checkReadmeFile).toHaveBeenNthCalledWith(2, target2);
      expect(checkReadmeFile).toHaveBeenNthCalledWith(3, target3);
    });
  });

  describe("Error Propagation", () => {
    it("should reject immediately if any target throws an I/O or parser error", async () => {
      const target1: ReadmeTarget = {
        path: "valid.md",
        contract: mockContract,
      };
      const target2: ReadmeTarget = {
        path: "missing.md",
        contract: mockContract,
      };

      const ioError = new Error('[IO Error] Failed to read "missing.md"');

      vi.mocked(checkReadmeFile).mockImplementation(async (target) => {
        if (target.path === "missing.md") {
          throw ioError;
        }
        return {
          path: "valid.md",
          result: {
            isValid: true,
            diagnostics: [],
            foundSectionIds: [],
            missingRequiredSections: [],
            sections: [],
          },
        };
      });

      await expect(checkReadmeFiles(target1, target2)).rejects.toThrow(ioError);
      expect(checkReadmeFile).toHaveBeenCalledTimes(2);
    });
  });
});
