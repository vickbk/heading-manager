import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as errorsModule from "@/scripts/core/errors";
import * as releasesModule from "@/scripts/features/releases";

describe("bin/extract-release-note entrypoint integration", () => {
  const originalArgv = [...process.argv];
  let scopedReleasesModule = releasesModule;
  let scopedErrorsModule = errorsModule;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();

    process.argv = [...originalArgv];

    scopedReleasesModule = await import("@/scripts/features/releases");
    scopedErrorsModule = await import("@/scripts/core/errors");
    vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    process.argv = [...originalArgv];
  });

  describe("Task Execution & Argument Passing", () => {
    it("should pass process.argv[2] as versionTag to extractReleaseNotes inside runTask", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/bin/extract-release-note.ts",
        "1.2.0",
      ];

      const extractSpy = vi
        .spyOn(scopedReleasesModule, "extractReleaseNotes")
        .mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      const runTaskSpy = vi
        .spyOn(scopedErrorsModule, "runTask")
        .mockImplementation(async (_name, task) => {
          await task();
        });

      await import("./extract-release-note");

      expect(runTaskSpy).toHaveBeenCalledTimes(1);
      expect(runTaskSpy).toHaveBeenCalledWith(
        "extract-release-note",
        expect.any(Function),
        "❌ [Release Note] Fatal Error",
      );

      expect(extractSpy).toHaveBeenCalledTimes(1);
      expect(extractSpy).toHaveBeenCalledWith({ versionTag: "1.2.0" });
    });

    it("should handle missing CLI arguments by passing undefined versionTag", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-release-note.ts"];

      const extractSpy = vi
        .spyOn(scopedReleasesModule, "extractReleaseNotes")
        .mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      vi.spyOn(errorsModule, "runTask").mockImplementation(
        async (_name, task) => {
          await task();
        },
      );

      await import("./extract-release-note");

      expect(extractSpy).toHaveBeenCalledTimes(1);
      expect(extractSpy).toHaveBeenCalledWith({ versionTag: undefined });
    });
  });

  describe("Error Delegation & Real Execution Safety", () => {
    it("should pass expected parameters to runTask when extractReleaseNotes fails", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/bin/extract-release-note.ts",
        "9.9.9",
      ];

      const expectedError = new Error(
        'Could not find section for version "9.9.9" in CHANGELOG.md',
      );

      vi.spyOn(scopedReleasesModule, "extractReleaseNotes").mockImplementation(
        () => {
          throw expectedError;
        },
      );

      const runTaskSpy = vi
        .spyOn(scopedErrorsModule, "runTask")
        .mockImplementation(async (_name, task, errorLabel) => {
          try {
            await task();
          } catch (err) {
            expect(err).toBe(expectedError);
            expect(errorLabel).toBe("❌ [Release Note] Fatal Error");
          }
        });

      await import("./extract-release-note");

      expect(runTaskSpy).toHaveBeenCalledTimes(1);
    });

    it("should safely handle un-spied runTask execution without terminating Vitest process", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/bin/extract-release-note.ts",
        "9.9.9",
      ];

      vi.spyOn(releasesModule, "extractReleaseNotes").mockImplementation(() => {
        throw new Error("Fatal script failure");
      });

      // Executes actual un-mocked runTask() safely
      await expect(import("./extract-release-note")).resolves.not.toThrow();
    });
  });
});
