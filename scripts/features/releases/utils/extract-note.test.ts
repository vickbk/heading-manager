import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "@/scripts/config";
import { resetConfig } from "@/scripts/config/testing";
import { normalizePath } from "@/scripts/shared/normalize-path";
import { shutConsole } from "@/tests/setup/console";
import { extractReleaseNotes } from "./extract-note";

describe("extractReleaseNotes", async () => {
  const mockChangelogPath = "/workspace/project/CHANGELOG.md";
  const mockOutputPath = "/workspace/project/RELEASE_CHANGELOG.md";

  const mockChangelogContent = `
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-08-11

### Added
- Feature A introduced
- Feature B introduced

## [0.9.0] - 2026-07-01
- Beta release
`;

  beforeEach(async () => {
    resetConfig();
    vi.restoreAllMocks();
    shutConsole();

    const { resolve } = path;
    vi.spyOn(path, "resolve").mockImplementation((...args: string[]) => {
      return normalizePath(resolve(...args), true);
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Execution & Custom Paths", () => {
    it("should extract release notes, write formatted output to file, log success, and return output path", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      const result = extractReleaseNotes({
        versionTag: "1.0.0",
        changelogPath: mockChangelogPath,
        outputPath: mockOutputPath,
      });

      expect(fs.existsSync).toHaveBeenCalledWith(mockChangelogPath);

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(mockChangelogPath, "utf8");

      expect(writeSpy).toHaveBeenCalledTimes(1);
      expect(writeSpy).toHaveBeenCalledWith(
        mockOutputPath,
        "### Added\n- Feature A introduced\n- Feature B introduced\n",
        "utf8",
      );

      expect(console.log).toHaveBeenCalledWith(
        `Successfully extracted release notes for v1.0.0 to ${mockOutputPath}`,
      );

      expect(result).toBe(mockOutputPath);
    });

    it("should accept raw 'v' prefix in versionTag option and normalize it", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      extractReleaseNotes({
        versionTag: "v1.0.0",
        changelogPath: mockChangelogPath,
        outputPath: mockOutputPath,
      });

      expect(writeSpy).toHaveBeenCalledWith(
        mockOutputPath,
        "### Added\n- Feature A introduced\n- Feature B introduced\n",
        "utf8",
      );
      expect(console.log).toHaveBeenCalledWith(
        `Successfully extracted release notes for v1.0.0 to ${mockOutputPath}`,
      );
    });
  });

  describe("Default Path & Environment Resolution", () => {
    it("should fall back to default config paths when changelogPath and outputPath are omitted", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      const expectedChangelogPath = path.resolve(
        config.cwd,
        config.paths.changelog,
      );
      const expectedOutputPath = path.resolve(
        config.cwd,
        config.paths.releaseChangelog,
      );

      const result = extractReleaseNotes({
        versionTag: "1.0.0",
      });

      expect(fs.existsSync).toHaveBeenCalledWith(expectedChangelogPath);
      expect(writeSpy).toHaveBeenCalledWith(
        expectedOutputPath,
        "### Added\n- Feature A introduced\n- Feature B introduced\n",
        "utf8",
      );
      expect(result).toBe(expectedOutputPath);
    });

    it("should fall back to GITHUB_REF_NAME environment variable when versionTag option is omitted", () => {
      vi.stubEnv("GITHUB_REF_NAME", "v1.0.0");

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      extractReleaseNotes({
        changelogPath: mockChangelogPath,
        outputPath: mockOutputPath,
      });

      expect(writeSpy).toHaveBeenCalledWith(
        mockOutputPath,
        "### Added\n- Feature A introduced\n- Feature B introduced\n",
        "utf8",
      );
    });
  });

  describe("File System I/O Errors", () => {
    it("should throw an error when the target changelog file does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);

      expect(() =>
        extractReleaseNotes({
          versionTag: "1.0.0",
          changelogPath: mockChangelogPath,
        }),
      ).toThrow(`CHANGELOG.md not found at ${mockChangelogPath}`);
    });

    it("should propagate read permission errors (EACCES) thrown by fs.readFileSync", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockImplementation(() => {
        throw new Error(
          "EACCES: permission denied, open '/workspace/project/CHANGELOG.md'",
        );
      });

      expect(() =>
        extractReleaseNotes({
          versionTag: "1.0.0",
          changelogPath: mockChangelogPath,
        }),
      ).toThrow("EACCES: permission denied");
    });

    it("should propagate write errors (e.g. EROFS - read-only filesystem) thrown by fs.writeFileSync", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      vi.spyOn(fs, "writeFileSync").mockImplementation(() => {
        throw new Error(
          "EROFS: read-only file system, open '/workspace/project/RELEASE_CHANGELOG.md'",
        );
      });

      expect(() =>
        extractReleaseNotes({
          versionTag: "1.0.0",
          changelogPath: mockChangelogPath,
          outputPath: mockOutputPath,
        }),
      ).toThrow("EROFS: read-only file system");
    });

    it("should automatically create nested parent directories for outputPath if they do not exist", () => {
      const nestedOutputPath = "/workspace/project/dist/release/NOTES.md";
      vi.spyOn(fs, "existsSync").mockImplementation(
        (p) => p === mockChangelogPath,
      ); // mock nested output dir as false
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const mkdirSpy = vi
        .spyOn(fs, "mkdirSync")
        .mockImplementation(() => undefined);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      extractReleaseNotes({
        versionTag: "1.0.0",
        changelogPath: mockChangelogPath,
        outputPath: nestedOutputPath,
      });

      expect(mkdirSpy).toHaveBeenCalledWith("/workspace/project/dist/release", {
        recursive: true,
      });
      expect(writeSpy).toHaveBeenCalledWith(
        nestedOutputPath,
        expect.any(String),
        "utf8",
      );
    });
  });

  describe("Error Propagation", () => {
    it("should propagate error when version tag resolution fails", () => {
      expect(() =>
        extractReleaseNotes({
          changelogPath: mockChangelogPath,
        }),
      ).toThrow(
        "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
      );
    });

    it("should propagate error when parseReleaseNotes fails", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);

      expect(() =>
        extractReleaseNotes({
          versionTag: "2.0.0",
          changelogPath: mockChangelogPath,
        }),
      ).toThrow('Could not find section for version "2.0.0" in CHANGELOG.md');
    });
  });
});
