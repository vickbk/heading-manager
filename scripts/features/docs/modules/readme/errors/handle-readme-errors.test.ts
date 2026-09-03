// scripts/features/docs/utils/orchestration/handle-readme-cli-error.test.ts
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as filesModule from "@/scripts/shared/files";
import { shutConsole } from "@/tests/setup/console";
import { HEADER_TEXT, handleReadmeCliError } from "./handle-readme-errors";
import * as unwrapModule from "./unwrap-readme-errors-messages";

describe("handleReadmeCliError", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    shutConsole();
    vi.spyOn(filesModule, "createTextFileSync").mockReturnValue("");
  });

  it("delegates error unwrapping to unwrapReadmeErrorMessages, writes a log file, and prepends HEADER_TEXT", () => {
    const unwrapSpy = vi
      .spyOn(unwrapModule, "unwrapReadmeErrorMessages")
      .mockReturnValue(["Single Error Message"]);

    const testError = new Error("Test Error");
    const result = handleReadmeCliError(testError);

    expect(unwrapSpy).toHaveBeenCalledTimes(1);
    expect(unwrapSpy).toHaveBeenCalledWith(testError);
    expect(result).toBe(`${HEADER_TEXT}\n\nSingle Error Message`);
    expect(filesModule.createTextFileSync).toHaveBeenCalledTimes(1);
    expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
      filePath: "readme-validation-error.log",
      content: result,
    });
  });

  it("returns a single unwrapped error message under HEADER_TEXT without dividers and writes a log file", () => {
    const expectedMessage =
      "[README Validation Failed] Path: ./README.md\n  Missing Required Sections:\n    - identity";
    vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([
      expectedMessage,
    ]);

    const result = handleReadmeCliError(new Error("Dummy Error"));

    expect(result).toBe(`${HEADER_TEXT}\n\n${expectedMessage}`);
    expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
      filePath: "readme-validation-error.log",
      content: result,
    });
  });

  it("joins multiple unwrapped error messages using a 50-character dashed separator block under HEADER_TEXT and logs them", () => {
    vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([
      "Error 1: Missing required section",
      "Error 2: Invalid syntax on line 12",
      "Error 3: ENOENT: file not found",
    ]);

    const result = handleReadmeCliError(new Error("Dummy Aggregate"));

    const expectedDivider = "\n\n" + "-".repeat(50) + "\n\n";
    const expectedBody =
      `Error 1: Missing required section${expectedDivider}` +
      `Error 2: Invalid syntax on line 12${expectedDivider}` +
      `Error 3: ENOENT: file not found`;

    expect(result).toBe(`${HEADER_TEXT}\n\n${expectedBody}`);
    expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
      filePath: "readme-validation-error.log",
      content: result,
    });
  });

  it("handles empty error arrays by returning an empty string without printing HEADER_TEXT or creating a log file", () => {
    vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([]);

    const result = handleReadmeCliError(new AggregateError([]));

    expect(result).toBe("");
    expect(result).not.toContain(HEADER_TEXT);
    expect(filesModule.createTextFileSync).not.toHaveBeenCalled();
  });

  describe("Header & Formatting Resilience", () => {
    it("starts with HEADER_TEXT and logs output whenever non-empty error messages are returned", () => {
      vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([
        "Some validation error",
      ]);

      const result = handleReadmeCliError("Error string payload");

      expect(result.startsWith(HEADER_TEXT)).toBe(true);
      expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
        filePath: "readme-validation-error.log",
        content: result,
      });
    });

    it("preserves exact inner formatting around separators after HEADER_TEXT and writes log file", () => {
      vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([
        "Block A Header\n  - Detail A1\n  - Detail A2",
        "Block B Header\n  - Detail B1",
      ]);

      const result = handleReadmeCliError("Error string payload");

      expect(result.startsWith(`${HEADER_TEXT}\n\n`)).toBe(true);

      const body = result.replace(`${HEADER_TEXT}\n\n`, "");
      const separator =
        "\n\n--------------------------------------------------\n\n";
      const parts = body.split(separator);

      expect(parts).toHaveLength(2);
      expect(parts[0]).toBe("Block A Header\n  - Detail A1\n  - Detail A2");
      expect(parts[1]).toBe("Block B Header\n  - Detail B1");
      expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
        filePath: "readme-validation-error.log",
        content: result,
      });
    });

    it("handles non-Error objects passed as top-level arguments under HEADER_TEXT and creates log file", () => {
      vi.spyOn(unwrapModule, "unwrapReadmeErrorMessages").mockReturnValue([
        "Raw string rejection message",
      ]);

      const result = handleReadmeCliError("RAW_STRING_REJECTION");

      expect(result).toBe(`${HEADER_TEXT}\n\nRaw string rejection message`);
      expect(filesModule.createTextFileSync).toHaveBeenCalledWith({
        filePath: "readme-validation-error.log",
        content: result,
      });
    });
  });
});
