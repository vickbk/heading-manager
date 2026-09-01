// scripts/features/docs/utils/orchestration/check-readme-files.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DocumentationContract } from "@/docs/types";
import * as filesModule from "@/scripts/core/files";
import { ReadmeValidationError } from "../modules/readme";
import { checkReadmeFiles } from "./check-readme-files";

const mockContractStrict: DocumentationContract = {
  packageName: "strict-package",
  sections: [
    { id: "identity", heading: "Project Title", required: true },
    { id: "quick-start", heading: "Quick Start", required: true },
    { id: "license", heading: "License", required: true },
  ],
  preferredSectionOrder: ["identity", "quick-start", "license"],
  requiredSectionIds: ["identity", "quick-start", "license"],
  recommendedSectionIds: [],
};

const mockContractMinimal: DocumentationContract = {
  packageName: "minimal-package",
  sections: [{ id: "identity", heading: "Project Title", required: true }],
  preferredSectionOrder: ["identity"],
  requiredSectionIds: ["identity"],
  recommendedSectionIds: [],
};

describe("checkReadmeFiles", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Success Scenarios & Order Preservation", () => {
    it("returns results in the exact key insertion order regardless of async resolution speed", async () => {
      // Simulate slow reading for the first file and fast reading for the second
      vi.spyOn(filesModule, "readTextFile").mockImplementation(
        async (filePath) => {
          if (filePath.includes("first")) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            return "# Project Title\n\n## Quick Start\n\n## License";
          }
          return "# Project Title\n\n## Quick Start\n\n## License";
        },
      );

      const targets = {
        "./first/README.md": mockContractStrict,
        "./second/README.md": mockContractStrict,
        "./third/README.md": mockContractMinimal,
      };

      const results = await checkReadmeFiles(targets);

      expect(results).toHaveLength(3);
      expect(results[0].path).toBe("./first/README.md");
      expect(results[1].path).toBe("./second/README.md");
      expect(results[2].path).toBe("./third/README.md");
      expect(results.every((r) => r.result?.isValid === true)).toBe(true);
    });

    it("returns an empty array without calling readTextFile when passed an empty object", async () => {
      const spy = vi.spyOn(filesModule, "readTextFile");
      const results = await checkReadmeFiles({});

      expect(results).toEqual([]);
      expect(spy).not.toHaveBeenCalled();
    });

    it("handles multiple targets running against different contract requirements", async () => {
      vi.spyOn(filesModule, "readTextFile").mockImplementation(
        async (filePath) => {
          if (filePath.includes("minimal")) {
            return "# Project Title";
          }
          return "# Project Title\n\n## Quick Start\n\n## License";
        },
      );

      const targets = {
        "./strict/README.md": mockContractStrict,
        "./minimal/README.md": mockContractMinimal,
      };

      const results = await checkReadmeFiles(targets);

      expect(results).toHaveLength(2);
      expect(results[0].result?.foundSectionIds).toEqual([
        "identity",
        "quick-start",
        "license",
      ]);
      expect(results[1].result?.foundSectionIds).toEqual(["identity"]);
    });
  });

  describe("AggregateError Aggregation & Error Filtering", () => {
    it("throws an AggregateError with a single error when exactly one target fails", async () => {
      vi.spyOn(filesModule, "readTextFile").mockResolvedValue(
        "# Project Title",
      ); // Fails strict contract

      const targets = {
        "./README.md": mockContractStrict,
      };

      const promise = checkReadmeFiles(targets);

      await expect(promise).rejects.toThrow(AggregateError);
      await expect(promise).rejects.toThrow(
        "README validation failed for 1 target(s).",
      );

      try {
        await promise;
      } catch (err) {
        expect(err).toBeInstanceOf(AggregateError);
        const aggErr = err as AggregateError;
        expect(aggErr.errors).toHaveLength(1);
        expect(aggErr.errors[0]).toBeInstanceOf(ReadmeValidationError);
      }
    });

    it("collects and aggregates every error when ALL targets fail validation", async () => {
      vi.spyOn(filesModule, "readTextFile").mockResolvedValue(""); // Fails all contracts

      const targets = {
        "./pkg-1/README.md": mockContractStrict,
        "./pkg-2/README.md": mockContractStrict,
        "./pkg-3/README.md": mockContractMinimal,
      };

      try {
        await checkReadmeFiles(targets);
        expect.fail("Should have thrown an AggregateError");
      } catch (err) {
        expect(err).toBeInstanceOf(AggregateError);
        const aggErr = err as AggregateError;

        expect(aggErr.message).toBe(
          "README validation failed for 3 target(s).",
        );
        expect(aggErr.errors).toHaveLength(3);
        expect(
          aggErr.errors.every((e) => e instanceof ReadmeValidationError),
        ).toBe(true);

        const pathsInErrors = (aggErr.errors as ReadmeValidationError[]).map(
          (e) => e.path,
        );
        expect(pathsInErrors).toEqual([
          "./pkg-1/README.md",
          "./pkg-2/README.md",
          "./pkg-3/README.md",
        ]);
      }
    });

    it("handles a combination of ReadmeValidationErrors, System I/O Errors, and primitive rejections", async () => {
      vi.spyOn(filesModule, "readTextFile").mockImplementation(
        async (filePath) => {
          if (filePath.includes("missing")) {
            throw new Error("ENOENT: file not found");
          }
          if (filePath.includes("invalid")) {
            return "# Project Title"; // Missing required sections
          }
          if (filePath.includes("corrupted")) {
            throw "Raw string error rejection";
          }
          return "# Project Title\n\n## Quick Start\n\n## License"; // Valid
        },
      );

      const targets = {
        "./valid/README.md": mockContractStrict,
        "./invalid/README.md": mockContractStrict,
        "./missing/README.md": mockContractStrict,
        "./corrupted/README.md": mockContractStrict,
      };

      try {
        await checkReadmeFiles(targets);
        expect.fail("Should have thrown an AggregateError");
      } catch (err) {
        expect(err).toBeInstanceOf(AggregateError);
        const aggErr = err as AggregateError;

        expect(aggErr.errors).toHaveLength(3); // 1 validation + 1 I/O Error + 1 primitive

        const validationErr = aggErr.errors.find(
          (e) => e instanceof ReadmeValidationError,
        ) as ReadmeValidationError;
        const ioErr = aggErr.errors.find(
          (e) => e instanceof Error && !(e instanceof ReadmeValidationError),
        ) as Error;
        const stringErr = aggErr.errors.find((e) => typeof e === "string");

        expect(validationErr?.path).toBe("./invalid/README.md");
        expect(ioErr?.message).toBe("ENOENT: file not found");
        expect(stringErr).toBe("Raw string error rejection");
      }
    });
  });

  describe("Edge Cases & Path Variations", () => {
    it("handles target paths containing spaces, deep relative paths, or unicode characters", async () => {
      const validContent = "# Project Title\n\n## Quick Start\n\n## License";
      vi.spyOn(filesModule, "readTextFile").mockResolvedValue(validContent);

      const targets = {
        "./nested/folder with spaces/README.md": mockContractStrict,
        "../parent-pkg/docs/README.md": mockContractStrict,
        "./packages/🚀-app/README.md": mockContractStrict,
      };

      const results = await checkReadmeFiles(targets);

      expect(results).toHaveLength(3);
      expect(results[0].path).toBe("./nested/folder with spaces/README.md");
      expect(results[1].path).toBe("../parent-pkg/docs/README.md");
      expect(results[2].path).toBe("./packages/🚀-app/README.md");
      expect(results.every((r) => r.result?.isValid === true)).toBe(true);
    });

    it("ensures that passing targets do not obscure failing targets in large batches", async () => {
      const passingCount = 20;
      const failingIndex = 12;

      vi.spyOn(filesModule, "readTextFile").mockImplementation(
        async (filePath) => {
          if (filePath.includes(`pkg-${failingIndex}`)) {
            return "# Project Title"; // Invalid
          }
          return "# Project Title\n\n## Quick Start\n\n## License"; // Valid
        },
      );

      const targets: Record<string, DocumentationContract> = {};
      for (let i = 0; i < passingCount; i += 1) {
        targets[`./packages/pkg-${i}/README.md`] = mockContractStrict;
      }

      try {
        await checkReadmeFiles(targets);
        expect.fail("Should have thrown an AggregateError");
      } catch (err) {
        expect(err).toBeInstanceOf(AggregateError);
        const aggErr = err as AggregateError;

        expect(aggErr.errors).toHaveLength(1);
        const error = aggErr.errors[0] as ReadmeValidationError;
        expect(error.path).toBe(`./packages/pkg-${failingIndex}/README.md`);
      }
    });
  });
});
