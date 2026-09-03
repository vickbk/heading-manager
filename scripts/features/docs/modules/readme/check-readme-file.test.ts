import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import * as filesModule from "@/scripts/shared/files";
import { checkReadmeFile } from "./check-readme-file";
import { ReadmeValidationError } from "./errors/readme-validation-error";

const mockContract: DocumentationContract = {
  packageName: "demo-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: ["identity", "quick-start", "license"],
  requiredSectionIds: ["identity", "quick-start", "license"],
  recommendedSectionIds: [],
};

describe("checkReadmeFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Valid README Files (Success Path)", () => {
    it("returns { path, result } with isValid: true when all required sections exist", async () => {
      const validMarkdown = [
        "# Project Title",
        "",
        "## Quick Start",
        "",
        "## License",
      ].join("\n");

      const spy = vi
        .spyOn(filesModule, "readTextFile")
        .mockResolvedValue(validMarkdown);

      const response = await checkReadmeFile({
        path: "./README.md",
        contract: mockContract,
      });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith("./README.md");
      expect(response.error).toBeUndefined();
      expect(response).toEqual({
        path: "./README.md",
        result: expect.objectContaining({
          isValid: true,
          diagnostics: [],
        }),
      });
    });
  });

  describe("Validation Failures (ReadmeValidationError Path)", () => {
    it("returns { path, error } with ReadmeValidationError when sections are missing", async () => {
      const invalidMarkdown = "# Project Title\n\n## Quick Start";

      vi.spyOn(filesModule, "readTextFile").mockResolvedValue(invalidMarkdown);

      const response = await checkReadmeFile({
        path: "./README.md",
        contract: mockContract,
      });

      expect(response.result).toBeUndefined();
      expect(response.path).toBe("./README.md");
      expect(response.error).toBeInstanceOf(ReadmeValidationError);

      const validationError = response.error as ReadmeValidationError;
      expect(validationError.path).toBe("./README.md");
      expect(validationError.result.isValid).toBe(false);
      expect(validationError.result.missingRequiredSections).toContain(
        "license",
      );
      expect(validationError.result.diagnostics).toHaveLength(1);
      expect(validationError.result.diagnostics[0].code).toBe(
        "missing-required-section",
      );
    });

    it("returns { path, error } with ReadmeValidationError when section order is invalid", async () => {
      const outOfOrderMarkdown = [
        "# Project Title",
        "",
        "## License",
        "",
        "## Quick Start",
      ].join("\n");

      vi.spyOn(filesModule, "readTextFile").mockResolvedValue(
        outOfOrderMarkdown,
      );

      const response = await checkReadmeFile({
        path: "./README.md",
        contract: mockContract,
      });

      expect(response.error).toBeInstanceOf(ReadmeValidationError);
      const validationError = response.error as ReadmeValidationError;
      expect(validationError.result.isValid).toBe(false);
      expect(
        validationError.result.diagnostics.some(
          (d) => d.code === "ordering-violation",
        ),
      ).toBe(true);
    });
  });

  describe("Filesystem & I/O Errors", () => {
    it("captures thrown filesystem Error into the error property without rejecting", async () => {
      const ioError = new Error(
        '[IO Error] Failed to read "./missing.md": ENOENT: no such file or directory',
      );
      vi.spyOn(filesModule, "readTextFile").mockRejectedValue(ioError);

      const response = await checkReadmeFile({
        path: "./missing.md",
        contract: mockContract,
      });

      expect(response).toEqual({
        path: "./missing.md",
        error: ioError,
      });
      expect(response.error).not.toBeInstanceOf(ReadmeValidationError);
    });

    it("captures non-Error primitive rejections into the error property", async () => {
      vi.spyOn(filesModule, "readTextFile").mockRejectedValue(
        "Disk read error",
      );

      const response = await checkReadmeFile({
        path: "./corrupted.md",
        contract: mockContract,
      });

      expect(response).toEqual({
        path: "./corrupted.md",
        error: "Disk read error",
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles completely empty file content by returning a ReadmeValidationError", async () => {
      vi.spyOn(filesModule, "readTextFile").mockResolvedValue("");

      const response = await checkReadmeFile({
        path: "./EMPTY.md",
        contract: mockContract,
      });

      expect(response.error).toBeInstanceOf(ReadmeValidationError);
      const error = response.error as ReadmeValidationError;
      expect(error.result.missingRequiredSections).toEqual([
        "identity",
        "quick-start",
        "license",
      ]);
    });
  });
});
