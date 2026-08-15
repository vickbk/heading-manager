import * as releasesModule from "@/scripts/features/releases";
import { shutConsole } from "@/tests/setup/console";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("bin/extract-version-tag entrypoint", () => {
  const originalArgv = [...process.argv];
  let scopedReleaseModule = releasesModule;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.resetModules();
    process.argv = [...originalArgv];

    shutConsole();
    vi.spyOn(process, "exit").mockReturnValue("" as never);

    scopedReleaseModule = await import("@/scripts/features/releases");
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

      await import("./extract-version-tag");

      expect(writeSpy).toHaveBeenCalledTimes(1);
      expect(console.error).not.toHaveBeenCalled();
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

      await import("./extract-version-tag");

      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "❌ [Version tag] Fatal Error: Invalid semver release tag format",
      );
    });
  });
});
