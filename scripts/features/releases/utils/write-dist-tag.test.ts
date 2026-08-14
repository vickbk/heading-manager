import * as githubEnvModule from "@/scripts/core/github";
import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as assertModule from "./assert-version";
import * as releaseTypeModule from "./release-type";
import { writeDistTagToGithubOutput } from "./write-dist-tag";

describe("writeDistTagToGithubOutput", () => {
  const originalArgv = process.argv;
  const mockGithubOutput = "/workspace/project/github_env_tmp";

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(releaseTypeModule, "getReleaseType");
    vi.spyOn(assertModule, "assertVersionMatch").mockImplementation(() => "");
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
      expect(appendSpy).toHaveBeenCalledTimes(1);
      expect(appendSpy).toHaveBeenCalledWith(
        mockGithubOutput,
        "DIST_TAG=latest\nIS_PRERELEASE=false\n",
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
        "DIST_TAG=next\nIS_PRERELEASE=true\n",
        "utf8",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: next (Pre-release)",
      );
    });

    it("should NOT append to file when GITHUB_ENV environment variable is empty or undefined", async () => {
      process.argv = ["node", "get-dist-tag.js", "2.0.0-beta.1"];
      vi.stubEnv("GITHUB_ENV", "");

      vi.spyOn(
        await import("./assert-version"),
        "assertVersionMatch",
      ).mockReturnValue("ok");
      const appendSpy = vi
        .spyOn(fs, "appendFileSync")
        .mockImplementation(() => {});
      const scopedReleaseType = vi.spyOn(
        await import("./release-type"),
        "getReleaseType",
      );

      const { writeDistTagToGithubOutput: scopedWriteDistTag } =
        await import("./write-dist-tag");
      scopedWriteDistTag();

      expect(scopedReleaseType).toHaveBeenCalledWith("2.0.0-beta.1");
      expect(appendSpy).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Publishing with npm dist-tag: beta (Pre-release)",
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

  describe("assertVersionMatch & githubWriteEnv Integration", () => {
    it("should pass the normalized version from getReleaseType directly into assertVersionMatch", () => {
      process.argv = ["node", "extract-version-tag.js", "v0.2.0-beta.2"];

      vi.spyOn(releaseTypeModule, "getReleaseType").mockReturnValue({
        releaseTag: "beta",
        normalized: "0.2.0-beta.2",
        version: "0.2.0",
        IS_PRERELEASE: true,
      });

      const assertSpy = vi
        .spyOn(assertModule, "assertVersionMatch")
        .mockReturnValue("0.2.0-beta.2");

      vi.spyOn(githubEnvModule, "githubWriteEnv").mockImplementation(() => {});

      writeDistTagToGithubOutput();

      expect(assertSpy).toHaveBeenCalledTimes(1);
      expect(assertSpy).toHaveBeenCalledWith("0.2.0-beta.2");
    });

    it("should abort execution and NOT call githubWriteEnv or console.log when assertVersionMatch throws", () => {
      process.argv = ["node", "extract-version-tag.js", "v0.2.0-beta.2"];

      vi.spyOn(releaseTypeModule, "getReleaseType").mockReturnValue({
        releaseTag: "beta",
        normalized: "0.2.0-beta.2",
        version: "0.2.0",
        IS_PRERELEASE: true,
      });

      vi.spyOn(assertModule, "assertVersionMatch").mockImplementation(() => {
        throw new Error(
          "Version mismatch blocker: Git tag does not match package.json",
        );
      });

      const githubWriteEnvSpy = vi
        .spyOn(githubEnvModule, "githubWriteEnv")
        .mockImplementation(() => {});

      expect(() => writeDistTagToGithubOutput()).toThrow(
        "Version mismatch blocker: Git tag does not match package.json",
      );

      expect(githubWriteEnvSpy).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should pass exact DIST_TAG and IS_PRERELEASE payload to githubWriteEnv on successful assertion", () => {
      process.argv = ["node", "extract-version-tag.js", "v1.0.0"];

      vi.spyOn(releaseTypeModule, "getReleaseType").mockReturnValue({
        releaseTag: "latest",
        normalized: "1.0.0",
        version: "1.0.0",
        IS_PRERELEASE: false,
      });

      const githubWriteEnvSpy = vi
        .spyOn(githubEnvModule, "githubWriteEnv")
        .mockImplementation(() => {});

      writeDistTagToGithubOutput();

      expect(githubWriteEnvSpy).toHaveBeenCalledTimes(1);
      expect(githubWriteEnvSpy).toHaveBeenCalledWith({
        DIST_TAG: "latest",
        IS_PRERELEASE: false,
      });
    });

    it("should execute operations in strict order: getReleaseType -> assertVersionMatch -> githubWriteEnv -> console.log", () => {
      process.argv = ["node", "extract-version-tag.js", "1.0.0"];

      const callOrder: string[] = [];

      vi.spyOn(releaseTypeModule, "getReleaseType").mockImplementation(
        (tag) => {
          callOrder.push("getReleaseType");
          return {
            releaseTag: "latest",
            normalized: tag,
            version: tag,
            IS_PRERELEASE: false,
          };
        },
      );

      vi.spyOn(assertModule, "assertVersionMatch").mockImplementation(() => {
        callOrder.push("assertVersionMatch");
        return "1.0.0";
      });

      vi.spyOn(githubEnvModule, "githubWriteEnv").mockImplementation(() => {
        callOrder.push("githubWriteEnv");
      });

      vi.spyOn(console, "log").mockImplementation(() => {
        callOrder.push("console.log");
      });

      writeDistTagToGithubOutput();

      expect(callOrder).toEqual([
        "getReleaseType",
        "assertVersionMatch",
        "githubWriteEnv",
        "console.log",
      ]);
    });
  });
});
