import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { writeDistTagToGithubOutput } from "./extract-version-tag";
import * as releaseTypeModule from "./utils/release-type";

describe("writeDistTagToGithubOutput", () => {
  const originalArgv = process.argv;
  const mockGithubOutput = "/workspace/project/github_env_tmp";

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(releaseTypeModule, "getReleaseType");
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.unstubAllEnvs();
  });

  describe("Function Execution (writeDistTagToGithubOutput)", () => {
    it("should write DIST_TAG to GITHUB_ENV file and log when CLI arg and GITHUB_ENV exist", () => {
      process.argv = ["node", "get-dist-tag.js", "v1.0.0"];
      vi.stubEnv("GITHUB_ENV", mockGithubOutput);

      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeDistTagToGithubOutput();

      expect(releaseTypeModule.getReleaseType).toHaveBeenCalledWith("v1.0.0");
      expect(appendSpy).toHaveBeenCalledTimes(2);
      expect(appendSpy).toHaveBeenCalledWith(
        mockGithubOutput,
        "DIST_TAG=latest\n",
        "utf8",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: latest",
      );
    });

    it("should pass empty string to resolveVersionTag when process.argv[2] is missing", () => {
      process.argv = ["node", "get-dist-tag.js"];
      vi.stubEnv("GITHUB_ENV", mockGithubOutput);
      vi.spyOn(releaseTypeModule, "getReleaseType").mockReturnValue({
        IS_PRERELEASE: true,
        releaseTag: "next",
        normalized: "next",
        version: "",
      });
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeDistTagToGithubOutput();

      expect(releaseTypeModule.getReleaseType).toHaveBeenCalledWith("");
      expect(appendSpy).toHaveBeenCalledWith(
        mockGithubOutput,
        "DIST_TAG=next\n",
        "utf8",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: next",
      );
    });

    it("should NOT append to file when GITHUB_ENV environment variable is empty or undefined", () => {
      process.argv = ["node", "get-dist-tag.js", "2.0.0-beta.1"];
      vi.stubEnv("GITHUB_ENV", "");

      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      writeDistTagToGithubOutput();

      expect(releaseTypeModule.getReleaseType).toHaveBeenCalledWith(
        "2.0.0-beta.1",
      );
      expect(appendSpy).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: beta",
      );
    });

    it("should propagate errors thrown by resolveVersionTag without writing to disk", () => {
      process.argv = ["node", "get-dist-tag.js", "invalid-tag"];
      vi.stubEnv("GITHUB_ENV", mockGithubOutput);

      vi.spyOn(releaseTypeModule, "getReleaseType").mockImplementation(() => {
        throw new Error("Invalid semver version tag");
      });

      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      expect(() => writeDistTagToGithubOutput()).toThrow(
        "Invalid semver version tag",
      );

      expect(appendSpy).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should propagate file system write errors (EACCES/ENOENT) thrown by fs.appendFileSync", () => {
      process.argv = ["node", "get-dist-tag.js", "1.0.0"];
      vi.stubEnv("GITHUB_ENV", mockGithubOutput);

      vi.spyOn(fs, "appendFileSync").mockImplementation(() => {
        throw new Error("EACCES: permission denied");
      });

      expect(() => writeDistTagToGithubOutput()).toThrow(
        "EACCES: permission denied",
      );
    });
  });

  describe("Top-Level Module Execution (if block)", () => {
    it("should automatically execute writeDistTagToGithubOutput when process.argv[1] contains 'get-dist-tag'", async () => {
      process.argv = [
        "node",
        "/workspace/scripts/extract-version-tag.ts",
        "1.0.0",
      ];
      vi.stubEnv("GITHUB_ENV", mockGithubOutput);

      const spyied = vi
        .spyOn(await import("./utils/version-tag"), "resolveVersionTag")
        .mockReturnValue("latest");
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});

      // Dynamic import evaluates top-level code
      await import("./extract-version-tag");

      expect(spyied).toHaveBeenCalledWith("1.0.0");
      expect(appendSpy).toHaveBeenCalledWith(
        mockGithubOutput,
        "DIST_TAG=latest\n",
        "utf8",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: latest",
      );
    });

    it("should NOT automatically execute writeDistTagToGithubOutput when process.argv[1] does not match", async () => {
      process.argv = ["node", "/workspace/scripts/other-utility.ts", "1.0.0"];

      const appendSpy = vi.spyOn(fs, "appendFileSync");

      await import("./extract-version-tag");

      expect(releaseTypeModule.getReleaseType).not.toHaveBeenCalled();
      expect(appendSpy).not.toHaveBeenCalled();
    });
  });
});
