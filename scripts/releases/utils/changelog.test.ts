import { describe, expect, it } from "vitest";
import { parseReleaseNotes } from "../utils/changelog";

describe("parseReleaseNotes", () => {
  const sampleChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-08-11

### Added
- Feature A added to pipeline
- Feature B added to API

### Fixed
- Fixed critical race condition in cache worker

## [1.1.0] - 2026-07-15

### Added
- Initial support for GitHub Step Summaries

## [1.0.0-beta.2] - 2026-06-01

- Pre-release testing notes
`;

  describe("Header Pattern Matching", () => {
    it("should match standard bracketed version headers with dates: '## [1.2.0] - YYYY-MM-DD'", () => {
      const result = parseReleaseNotes(sampleChangelog, "1.2.0");
      expect(result).toContain("### Added");
      expect(result).toContain("Fixed critical race condition in cache worker");
    });

    it("should match unbracketed version headers: '## 1.2.0'", () => {
      const changelog = "## 1.2.0\n\n- Plain unbracketed release notes";
      const result = parseReleaseNotes(changelog, "1.2.0");
      expect(result).toBe("- Plain unbracketed release notes");
    });

    it("should match version headers with 'v' inside brackets: '## [v1.2.0]'", () => {
      const changelog =
        "## [v1.2.0] - 2026-08-11\n\n- Version with v prefix inside brackets";
      const result = parseReleaseNotes(changelog, "1.2.0");
      expect(result).toBe("- Version with v prefix inside brackets");
    });

    it("should match version headers with raw 'v' prefix: '## v1.2.0'", () => {
      const changelog = "## v1.2.0\n\n- Version with raw v prefix";
      const result = parseReleaseNotes(changelog, "1.2.0");
      expect(result).toBe("- Version with raw v prefix");
    });

    it("should handle custom spacing or tabs between '##' and version tag", () => {
      const changelog =
        "##\t  [1.2.0]\t - 2026-08-11\n\n- Tab-separated header content";
      const result = parseReleaseNotes(changelog, "1.2.0");
      expect(result).toBe("- Tab-separated header content");
    });

    it("should handle complex semver tags with pre-releases and build metadata", () => {
      const result = parseReleaseNotes(sampleChangelog, "1.0.0-beta.2");
      expect(result).toBe("- Pre-release testing notes");
    });

    it("should prevent false positive partial matches (e.g. searching '1.0.0' must not match '1.0.0-beta.2' or '11.0.0')", () => {
      const changelog = `
## [1.0.0-beta.2]
- Beta content

## [1.0.0]
- Exact version release notes
`;
      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe("- Exact version release notes");
    });
  });

  describe("Horizontal vs Vertical Whitespace (Newline Boundary Safety)", () => {
    it("should NOT consume the subsequent content line even when text immediately follows the header without blank lines", () => {
      const changelog = `
## [1.0.0]
- Immediate first line item without preceding newline
- Second line item
## [0.9.0]
`;
      const result = parseReleaseNotes(changelog, "1.0.0");
      expect(result).toBe(
        "- Immediate first line item without preceding newline\n- Second line item",
      );
    });

    it("should preserve internal code blocks and list indents while trimming external block padding", () => {
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

  describe("Line Endings (CRLF vs LF)", () => {
    it("should normalize Windows CRLF (\\r\\n) line endings and return output cleanly using \\n", () => {
      const changelogCRLF =
        "# Changelog\r\n\r\n## [1.0.0] - 2026-08-11\r\n\r\n### Added\r\n- CRLF test item 1\r\n- CRLF test item 2\r\n\r\n## [0.9.0]";

      const result = parseReleaseNotes(changelogCRLF, "1.0.0");

      expect(result).toBe("### Added\n- CRLF test item 1\n- CRLF test item 2");
      expect(result).not.toContain("\r");
    });
  });

  describe("Section Isolation & End of File (EOF)", () => {
    it("should stop reading when encountering the next level-2 heading ('## ')", () => {
      const result = parseReleaseNotes(sampleChangelog, "1.2.0");

      expect(result).toContain("### Fixed");
      expect(result).not.toContain("## [1.1.0]");
      expect(result).not.toContain("Initial support for GitHub Step Summaries");
    });

    it("should retain lower level headings (###, ####, #####) inside the extracted section", () => {
      const changelog = `
## [2.0.0]

### Level 3 Header
#### Level 4 Header
##### Level 5 Header
- Deeply nested content

## [1.0.0]
`;
      const result = parseReleaseNotes(changelog, "2.0.0");
      expect(result).toBe(
        "### Level 3 Header\n#### Level 4 Header\n##### Level 5 Header\n- Deeply nested content",
      );
    });

    it("should extract to EOF when the target version is the last section in the file", () => {
      const result = parseReleaseNotes(sampleChangelog, "1.0.0-beta.2");
      expect(result).toBe("- Pre-release testing notes");
    });
  });

  describe("Error Propagation", () => {
    it("should throw an error when the version tag is absent from the changelog", () => {
      expect(() => parseReleaseNotes(sampleChangelog, "9.9.9")).toThrow(
        'Could not find section for version "9.9.9" in CHANGELOG.md',
      );
    });

    it("should throw an error when the header is found but section content is empty before the next heading", () => {
      const changelog = `
## [1.0.0]

## [0.9.0]
- Some notes
`;
      expect(() => parseReleaseNotes(changelog, "1.0.0")).toThrow(
        'Found header for version "1.0.0", but section content is empty.',
      );
    });

    it("should throw an error when the section contains only whitespace characters", () => {
      const changelog = `
## [1.0.0]

  \n\t  \n   

## [0.9.0]
`;
      expect(() => parseReleaseNotes(changelog, "1.0.0")).toThrow(
        'Found header for version "1.0.0", but section content is empty.',
      );
    });
  });
});
