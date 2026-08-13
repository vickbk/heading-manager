import { describe, expect, it } from "vitest";
import { parseReleaseNotes } from "../utils/changelog";

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
