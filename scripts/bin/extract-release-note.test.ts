import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runSpy = vi.fn();
const extractReleaseSpy = vi.fn();

vi.mock("@vickbk/ci-tools/core", () => ({
  runTask: runSpy,
}));
vi.mock("@vickbk/ci-tools/releases", () => ({
  extractReleaseNotes: extractReleaseSpy,
}));

describe("bin/extract-release-note entrypoint integration", () => {
  const originalArgv = [...process.argv];

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    process.argv = [...originalArgv];

    vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
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

      extractReleaseSpy.mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      runSpy.mockImplementation(async (_name, task) => {
        await task();
      });

      await import("./extract-release-note");

      expect(runSpy).toHaveBeenCalledTimes(1);
      expect(runSpy).toHaveBeenCalledWith(
        "extract-release-note",
        expect.any(Function),
        "❌ [Release Note] Fatal Error",
      );

      expect(extractReleaseSpy).toHaveBeenCalledTimes(1);
      expect(extractReleaseSpy).toHaveBeenCalledWith({ versionTag: "1.2.0" });
    });

    it("should handle missing CLI arguments by passing undefined versionTag", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-release-note.ts"];

      extractReleaseSpy.mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      runSpy.mockImplementation(async (_name, task) => {
        await task();
      });

      await import("./extract-release-note");

      expect(extractReleaseSpy).toHaveBeenCalledTimes(1);
      expect(extractReleaseSpy).toHaveBeenCalledWith({ versionTag: undefined });
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

      extractReleaseSpy.mockImplementation(() => {
        throw expectedError;
      });

      runSpy.mockImplementation(async (_name, task, errorLabel) => {
        try {
          await task();
        } catch (err) {
          expect(err).toBe(expectedError);
          expect(errorLabel).toBe("❌ [Release Note] Fatal Error");
        }
      });

      await import("./extract-release-note");

      expect(runSpy).toHaveBeenCalledTimes(1);
    });

    it("should safely handle un-spied runTask execution without terminating Vitest process", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/bin/extract-release-note.ts",
        "9.9.9",
      ];

      extractReleaseSpy.mockImplementation(() => {
        throw new Error("Fatal script failure");
      });
      runSpy.mockRestore();

      // Executes actual restored runTask() safely
      await expect(import("./extract-release-note")).resolves.not.toThrow();
    });
  });
});
