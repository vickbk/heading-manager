import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parseReleaseNotes } from "../utils/changelog";
import { extractReleaseNotes } from "./extract-note";

describe("parseReleaseNotes", () => {
  const sampleChangelogLF = `# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-08-11

### Added
- Feature A added to workflow
- Feature B added to API

### Fixed
- Fixed critical null pointer exception

## [1.0.0] - 2026-07-01

### Added
- Initial release

## [0.9.0-beta.1] - 2026-06-15

- Pre-release testing builds
`;

  describe("Header Format Matching", () => {
    it("should match bracketed version headers with dates: '## [1.0.0] - YYYY-MM-DD'", () => {
      const result = parseReleaseNotes(sampleChangelogLF, "1.0.0");
      expect(result).toBe("### Added\n- Initial release");
    });

    it("should match unbracketed version headers: '## 1.0.0'", () => {
      const changelog = "## 1.0.0\n\n- Plain unbracketed release notes";
      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe("- Plain unbracketed release notes");
    });

    it("should match version headers containing 'v' inside brackets: '## [v1.0.0]'", () => {
      const changelog =
        "## [v1.0.0] - 2026-08-11\n\n- Version with v prefix inside brackets";
      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe("- Version with v prefix inside brackets");
    });

    it("should match version headers with 'v' without brackets: '## v1.0.0'", () => {
      const changelog = "## v1.0.0\n\n- Version with raw v prefix";
      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe("- Version with raw v prefix");
    });

    it("should correctly handle pre-release semver tags containing dots and dashes (e.g., '0.9.0-beta.1')", () => {
      const result = parseReleaseNotes(sampleChangelogLF, "0.9.0-beta.1");
      expect(result).toBe("- Pre-release testing builds");
    });
  });

  describe("Line Endings (CRLF vs LF)", () => {
    it("should parse Windows CRLF (\\r\\n) line endings without leaving orphan \\r characters", () => {
      const changelogCRLF =
        "# Changelog\r\n\r\n## [1.0.0] - 2026-08-11\r\n\r\n### Added\r\n- CRLF test item 1\r\n- CRLF test item 2\r\n\r\n## [0.9.0]";

      const result = parseReleaseNotes(changelogCRLF, "1.0.0");

      expect(result).toBe("### Added\n- CRLF test item 1\n- CRLF test item 2");
      expect(result).not.toContain("\r");
    });
  });

  describe("Section Boundaries & Subheaders", () => {
    it("should extract content up to the next level-2 header ('## ') and stop", () => {
      const result = parseReleaseNotes(sampleChangelogLF, "1.1.0");

      expect(result).toContain("### Added");
      expect(result).toContain("### Fixed");
      expect(result).not.toContain("## [1.0.0]");
      expect(result).not.toContain("Initial release");
    });

    it("should retain subheadings (e.g. '### Added', '#### Note') within the target section", () => {
      const changelog = `
## [2.0.0] - 2026-08-11

### Feature Breakdown
#### Subsection 1
- Detailed item

## [1.0.0]
`;
      const result = parseReleaseNotes(changelog, "2.0.0");

      expect(result).toBe(
        "### Feature Breakdown\n#### Subsection 1\n- Detailed item",
      );
    });

    it("should extract to End of File (EOF) when target version is the last section", () => {
      const result = parseReleaseNotes(sampleChangelogLF, "0.9.0-beta.1");
      expect(result).toBe("- Pre-release testing builds");
    });
  });

  describe("Whitespace & Formatting Integrity", () => {
    it("should trim surrounding whitespace while preserving internal formatting and code blocks", () => {
      const changelog = `
## [1.0.0]

   
- Feature with code:
  \`\`\`ts
  const x = 10;
  \`\`\`

   
## [0.9.0]
`;

      const expected = `- Feature with code:\n  \`\`\`ts\n  const x = 10;\n  \`\`\``;

      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe(expected);
    });
  });

  describe("Error Conditions", () => {
    it("should throw an error when the target version header does not exist in the changelog", () => {
      expect(() => parseReleaseNotes(sampleChangelogLF, "2.0.0")).toThrow(
        'Could not find section for version "2.0.0" in CHANGELOG.md',
      );
    });

    it("should throw an error when the version section exists but contains no content", () => {
      const emptySectionChangelog = `
# Changelog

## [1.0.0] - 2026-08-11

## [0.9.0] - 2026-07-01
- Previous content
`;

      expect(() => parseReleaseNotes(emptySectionChangelog, "1.0.0")).toThrow(
        'Found header for version "1.0.0", but section content is empty.',
      );
    });

    it("should throw an error when the version section exists at EOF but contains only whitespace", () => {
      const whitespaceSectionChangelog = `
## [1.0.0]

   \n\t\n   
`;

      expect(() =>
        parseReleaseNotes(whitespaceSectionChangelog, "1.0.0"),
      ).toThrow(
        'Found header for version "1.0.0", but section content is empty.',
      );
    });
  });
});

describe("extractReleaseNotes with executions", () => {
  const mockChangelogPath = "/workspace/project/CHANGELOG.md";
  const mockOutputPath = "/workspace/project/RELEASE_CHANGELOG.md";
  const defaultChangelogPath = path.resolve(process.cwd(), "CHANGELOG.md");
  const defaultOutputPath = path.resolve(process.cwd(), "RELEASE_CHANGELOG.md");

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

  const originalArgv = process.argv;

  beforeEach(async () => {
    vi.restoreAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(() => {
    process.argv = originalArgv;
    vi.unstubAllEnvs();
  });

  describe("Happy Path Execution & Custom Paths", () => {
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

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
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

  describe("Default Fallbacks & CLI Parameters", () => {
    it("should default to process.cwd() paths and process.argv[2] when options are omitted", () => {
      process.argv = ["node", "extract-script.js", "1.0.0"];

      const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
      const readSpy = vi
        .spyOn(fs, "readFileSync")
        .mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      const result = extractReleaseNotes();

      expect(existsSpy).toHaveBeenCalledWith(defaultChangelogPath);
      expect(readSpy).toHaveBeenCalledWith(defaultChangelogPath, "utf8");
      expect(writeSpy).toHaveBeenCalledWith(
        defaultOutputPath,
        "### Added\n- Feature A introduced\n- Feature B introduced\n",
        "utf8",
      );
      expect(result).toBe(defaultOutputPath);
    });

    it("should fallback to environment variables for version tag when CLI arg and option are missing", async () => {
      process.argv = ["node", "extract-script.js"];
      vi.stubEnv("GITHUB_REF_NAME", "v1.0.0");

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);
      const writeSpy = vi
        .spyOn(fs, "writeFileSync")
        .mockImplementation(() => {});

      const scopedExtractReleaseNotes = (await import("./extract-note"))
        .extractReleaseNotes;
      scopedExtractReleaseNotes({
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
  });

  describe("Dependency Error Propagation", () => {
    it("should propagate error when version tag resolution fails", () => {
      process.argv = ["node", "extract-script.js"];

      expect(() =>
        extractReleaseNotes({
          changelogPath: mockChangelogPath,
        }),
      ).toThrow(
        "No version tag provided. Pass as an argument or set GITHUB_REF_NAME / RELEASE_VERSION.",
      );
    });

    it("should propagate error when version section is missing from CHANGELOG.md", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(mockChangelogContent);

      expect(() =>
        extractReleaseNotes({
          versionTag: "2.0.0",
          changelogPath: mockChangelogPath,
        }),
      ).toThrow('Could not find section for version "2.0.0" in CHANGELOG.md');
    });

    it("should propagate error when version section is found but empty", () => {
      const emptySectionChangelog = "## [1.0.0]\n\n## [0.9.0]\n- Content";

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(emptySectionChangelog);

      expect(() =>
        extractReleaseNotes({
          versionTag: "1.0.0",
          changelogPath: mockChangelogPath,
        }),
      ).toThrow(
        'Found header for version "1.0.0", but section content is empty.',
      );
    });
  });
});
