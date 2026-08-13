import { describe, expect, it } from "vitest";
import { normalizePath } from "./normalize-path";

describe("normalizePath", () => {
  describe("Drive Letter Removal", () => {
    it("strips uppercase drive letters (e.g., C:, D:)", () => {
      expect(normalizePath("C:/Users/test")).toBe("/Users/test");
      expect(normalizePath("D:/project/root")).toBe("/project/root");
      expect(normalizePath("Z:/file.txt")).toBe("/file.txt");
    });

    it("strips lowercase drive letters (e.g., c:, d:)", () => {
      expect(normalizePath("c:/Users/test")).toBe("/Users/test");
      expect(normalizePath("e:/work/code")).toBe("/work/code");
    });

    it("strips drive letters when no leading slash follows the colon", () => {
      expect(normalizePath("C:relative/path/to/file")).toBe(
        "relative/path/to/file",
      );
    });

    it("strips a standalone drive letter with no path", () => {
      expect(normalizePath("C:")).toBe("");
    });

    it("strips drive letter and leaves a root slash for trailing backslash", () => {
      expect(normalizePath("C:\\")).toBe("/");
      expect(normalizePath("D:/")).toBe("/");
    });
  });

  describe("Backslash Normalization", () => {
    it("converts all backslashes to forward slashes", () => {
      expect(normalizePath("path\\to\\file.ts")).toBe("path/to/file.ts");
    });

    it("preserves existing forward slashes", () => {
      expect(normalizePath("path/to/file.ts")).toBe("path/to/file.ts");
    });

    it("normalizes mixed forward slashes and backslashes", () => {
      expect(normalizePath("path\\to/nested\\file.ts")).toBe(
        "path/to/nested/file.ts",
      );
    });

    it("converts consecutive backslashes into consecutive forward slashes", () => {
      expect(normalizePath("path\\\\to\\\\file.ts")).toBe("path//to//file.ts");
    });
  });

  describe("Combined Transformations (Windows to POSIX)", () => {
    it("converts standard Windows absolute paths to normalized POSIX paths", () => {
      expect(normalizePath("D:\\project\\root\\package.json")).toBe(
        "/project/root/package.json",
      );
      expect(normalizePath("C:\\Users\\Developer\\AppData\\Local")).toBe(
        "/Users/Developer/AppData/Local",
      );
    });

    it("handles UNC network paths", () => {
      expect(normalizePath("\\\\server\\share\\folder\\file.txt")).toBe(
        "//server/share/folder/file.txt",
      );
    });
  });

  describe("Guardrails & False Positives", () => {
    it("does not strip multi-letter prefixes ending with a colon", () => {
      expect(normalizePath("AB:/path/to/file")).toBe("AB:/path/to/file");
      expect(normalizePath("HTTP:/server/resource")).toBe(
        "HTTP:/server/resource",
      );
    });

    it("does not strip non-alphabetic prefixes ending with a colon", () => {
      expect(normalizePath("1:/path/to/file")).toBe("1:/path/to/file");
      expect(normalizePath("_:/path/to/file")).toBe("_:/path/to/file");
    });

    it("does not strip colons that appear inside the path body", () => {
      expect(normalizePath("/path/to:with:colons/file.txt")).toBe(
        "/path/to:with:colons/file.txt",
      );
      expect(normalizePath("C:\\path\\version:1.0\\file.txt")).toBe(
        "/path/version:1.0/file.txt",
      );
    });
  });

  describe("Edge Cases & Special Characters", () => {
    it("returns an empty string when given an empty string input", () => {
      expect(normalizePath("")).toBe("");
    });

    it("preserves spaces and special characters in directory names", () => {
      expect(normalizePath("C:\\Program Files (x86)\\My App\\data.json")).toBe(
        "/Program Files (x86)/My App/data.json",
      );

      expect(normalizePath("D:\\project_123\\@scope\\file.test.ts")).toBe(
        "/project_123/@scope/file.test.ts",
      );
    });

    it("handles single slash inputs without modification", () => {
      expect(normalizePath("/")).toBe("/");
      expect(normalizePath("\\")).toBe("/");
    });

    it("handles plain filenames without slashes or drive letters", () => {
      expect(normalizePath("package.json")).toBe("package.json");
    });
  });

  describe("normalizePath — replaceSlashes option", () => {
    describe("Default Behavior (Omitted or undefined)", () => {
      it("defaults to replacing backslashes when second argument is omitted", () => {
        expect(normalizePath("C:\\project\\src\\index.ts")).toBe(
          "/project/src/index.ts",
        );
      });

      it("defaults to replacing backslashes when second argument is explicitly undefined", () => {
        expect(normalizePath("D:\\work\\app.json", undefined)).toBe(
          "/work/app.json",
        );
      });
    });

    describe("When replaceSlashes = true", () => {
      it("strips drive letter AND converts all backslashes to forward slashes", () => {
        expect(normalizePath("C:\\Users\\dev\\config.yaml", true)).toBe(
          "/Users/dev/config.yaml",
        );
      });

      it("normalizes mixed backslashes and forward slashes to forward slashes", () => {
        expect(normalizePath("E:\\folder/subfolder\\file.txt", true)).toBe(
          "/folder/subfolder/file.txt",
        );
      });

      it("converts trailing backslashes to forward slashes", () => {
        expect(normalizePath("Z:\\build\\output\\", true)).toBe(
          "/build/output/",
        );
      });
    });

    describe("When replaceSlashes = false", () => {
      it("strips drive letter BUT preserves original backslashes", () => {
        expect(normalizePath("C:\\project\\src\\index.ts", false)).toBe(
          "\\project\\src\\index.ts",
        );
      });

      it("strips lowercase drive letter while preserving backslashes", () => {
        expect(normalizePath("d:\\data\\db.sqlite", false)).toBe(
          "\\data\\db.sqlite",
        );
      });

      it("preserves existing forward slashes when no backslashes exist", () => {
        expect(normalizePath("C:/project/src/index.ts", false)).toBe(
          "/project/src/index.ts",
        );
      });

      it("preserves mixed slash formats as-is without converting backslashes", () => {
        expect(normalizePath("C:\\project/src\\index.ts", false)).toBe(
          "\\project/src\\index.ts",
        );
      });

      it("leaves backslashes untouched when path has no drive letter", () => {
        expect(normalizePath("relative\\path\\to\\file.ts", false)).toBe(
          "relative\\path\\to\\file.ts",
        );
      });

      it("preserves UNC network path backslashes without drive letters", () => {
        expect(
          normalizePath("\\\\server\\share\\folder\\file.txt", false),
        ).toBe("\\\\server\\share\\folder\\file.txt");
      });

      it("handles standalone drive letter with trailing backslash without converting the slash", () => {
        expect(normalizePath("C:\\", false)).toBe("\\");
      });
    });

    describe("Edge Cases with Boolean Coercion & Empty Values", () => {
      it("handles empty string with replaceSlashes = false", () => {
        expect(normalizePath("", false)).toBe("");
      });

      it("handles plain filename with replaceSlashes = false", () => {
        expect(normalizePath("package.json", false)).toBe("package.json");
      });
    });
  });
});
