import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as errorsModule from "../core/errors/utils/handle-fatal-error";
import * as releasesModule from "../features/releases";

describe("bin/extract-version-tag entrypoint", () => {
  const originalArgv = [...process.argv];
  let scopedErrorsModule = errorsModule;
  let scopedReleaseModule = releasesModule;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules(); // Resets module cache so top-level await runTask re-runs on dynamic import
    process.argv = [...originalArgv];

    scopedErrorsModule =
      await import("../core/errors/utils/handle-fatal-error");
    scopedReleaseModule = await import("../features/releases");
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  describe("Entrypoint Guard & Success Flow", () => {
    it("should execute writeDistTagToGithubOutput when process.argv[1] matches 'extract-version-tag'", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-version-tag.ts"];

      const writeSpy = vi
        .spyOn(scopedReleaseModule, "writeDistTagToGithubOutput")
        .mockImplementation(() => {});

      const fatalSpy = vi
        .spyOn(scopedErrorsModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      // Trigger top-level script execution
      await import("./extract-version-tag");

      expect(writeSpy).toHaveBeenCalledTimes(1);
      expect(fatalSpy).not.toHaveBeenCalled();
    });

    it("should skip execution when process.argv[1] does not match 'extract-version-tag'", async () => {
      process.argv = ["node", "/workspace/scripts/bin/other-script.ts"];

      const writeSpy = vi
        .spyOn(releasesModule, "writeDistTagToGithubOutput")
        .mockImplementation(() => {});

      await import("./extract-version-tag");

      expect(writeSpy).not.toHaveBeenCalled();
    });
  });

  describe("Error Delegation", () => {
    it("should catch thrown errors and delegate to handleFatalError with custom prefix", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-version-tag.ts"];

      const thrownError = new Error("Invalid semver release tag format");

      vi.spyOn(
        scopedReleaseModule,
        "writeDistTagToGithubOutput",
      ).mockImplementation(() => {
        throw thrownError;
      });

      const fatalSpy = vi
        .spyOn(scopedErrorsModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      await import("./extract-version-tag");

      expect(fatalSpy).toHaveBeenCalledTimes(1);
      expect(fatalSpy).toHaveBeenCalledWith(
        thrownError,
        "❌ [Version tag] Fatal Error",
      );
    });
  });
});
