import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as errorsModule from "../core/errors/utils/handle-fatal-error";
import * as extractNoteModule from "../features/releases/utils/extract-note";

describe("bin/extract-release-note entrypoint integration", () => {
  const originalArgv = [...process.argv];
  let scopedErrorModule = errorsModule;
  let scopedExtractNoteModule = extractNoteModule;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules(); // Resets module cache so top-level await runTask() re-executes on dynamic import
    process.argv = [...originalArgv];
    scopedErrorModule = await import("../core/errors/utils/handle-fatal-error");
    scopedExtractNoteModule =
      await import("../features/releases/utils/extract-note");
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  describe("CLI Match & Success Execution", () => {
    it("should execute extractReleaseNotes when process.argv[1] matches the script name and complete successfully", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/bin/extract-release-note.ts",
        "1.0.0",
      ];

      const extractSpy = vi
        .spyOn(scopedExtractNoteModule, "extractReleaseNotes")
        .mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      const fatalSpy = vi
        .spyOn(scopedErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      // Trigger top-level execution
      await import("./extract-release-note");

      // Verify the domain task ran
      expect(extractSpy).toHaveBeenCalledTimes(1);

      // Verify no fatal errors were triggered
      expect(fatalSpy).not.toHaveBeenCalled();
    });
  });

  describe("Module Import / Non-Match Guard", () => {
    it("should skip execution when process.argv[1] does not match extract-release-note", async () => {
      process.argv = ["node", "/workspace/scripts/bin/some-other-tool.ts"];

      const extractSpy = vi
        .spyOn(extractNoteModule, "extractReleaseNotes")
        .mockReturnValue("/workspace/RELEASE_CHANGELOG.md");

      await import("./extract-release-note");

      // Should be guarded and ignored
      expect(extractSpy).not.toHaveBeenCalled();
    });
  });

  describe("Failure & Fatal Error Propagation", () => {
    it("should catch errors thrown by extractReleaseNotes and pass them to handleFatalError with prefix", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-release-note.ts"];

      const thrownError = new Error(
        "CHANGELOG.md not found at /workspace/CHANGELOG.md",
      );

      vi.spyOn(
        scopedExtractNoteModule,
        "extractReleaseNotes",
      ).mockImplementation(() => {
        throw thrownError;
      });

      const fatalSpy = vi
        .spyOn(scopedErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      await import("./extract-release-note");

      // Verify error was caught and forwarded to handleFatalError
      expect(fatalSpy).toHaveBeenCalledTimes(1);
      expect(fatalSpy).toHaveBeenCalledWith(
        thrownError,
        "[Release Note] Fatal Error",
      );
    });
  });
});
