import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "@/scripts/config";
import { getErrorLogContent } from "../modules/readme";
import {
  getCommentBody,
  SKIPPED_MESSAGE,
  SUCCESS_MESSAGE,
} from "./get-comment-body";

vi.mock("@/scripts/config", () => ({
  config: {
    docs: {
      hasRun: true,
    },
  },
}));

vi.mock("../modules/readme", () => ({
  getErrorLogContent: vi.fn(),
}));

describe("getCommentBody", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    config.docs.hasRun = true;
  });

  describe("Exported Constants", () => {
    it("should export the correct SUCCESS_MESSAGE constant", () => {
      expect(SUCCESS_MESSAGE).toBe(
        "✅ Documentation check completed successfully. No issues found.",
      );
    });

    it("should export the correct SKIPPED_MESSAGE constant", () => {
      expect(SKIPPED_MESSAGE).toBe(
        "⚠️ Documentation check did not run. Cannot determine documentation status.",
      );
    });
  });

  describe("When Docs Check Ran (hasRun === true)", () => {
    it("should return the log content when getErrorLogContent returns a non-null string", async () => {
      const mockLogContent = "❌ Missing heading ## Installation in README.md";
      vi.mocked(getErrorLogContent).mockResolvedValue(mockLogContent);

      const result = await getCommentBody();

      expect(getErrorLogContent).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockLogContent);
    });

    it("should return SUCCESS_MESSAGE when getErrorLogContent returns null", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(null);

      const result = await getCommentBody();

      expect(getErrorLogContent).toHaveBeenCalledTimes(1);
      expect(result).toBe(SUCCESS_MESSAGE);
    });

    it("should return empty string log content if log exists but is empty string", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue("");

      const result = await getCommentBody();

      expect(getErrorLogContent).toHaveBeenCalledTimes(1);
      expect(result).toBe("");
    });
  });

  describe("When Docs Check Did Not Run (hasRun !== true)", () => {
    it("should return SKIPPED_MESSAGE and not check error log when hasRun is false", async () => {
      config.docs.hasRun = false;

      const result = await getCommentBody();

      expect(getErrorLogContent).not.toHaveBeenCalled();
      expect(result).toBe(SKIPPED_MESSAGE);
    });

    it("should return SKIPPED_MESSAGE when hasRun is undefined", async () => {
      config.docs.hasRun = undefined as never;

      const result = await getCommentBody();

      expect(getErrorLogContent).not.toHaveBeenCalled();
      expect(result).toBe(SKIPPED_MESSAGE);
    });

    it("should return SKIPPED_MESSAGE when hasRun is null", async () => {
      config.docs.hasRun = null as never;

      const result = await getCommentBody();

      expect(getErrorLogContent).not.toHaveBeenCalled();
      expect(result).toBe(SKIPPED_MESSAGE);
    });
  });

  describe("Error Propagation", () => {
    it("should bubble up error when getErrorLogContent rejects", async () => {
      const logError = new Error("[IO Error] Failed to read log file");
      vi.mocked(getErrorLogContent).mockRejectedValue(logError);

      await expect(getCommentBody()).rejects.toThrow(logError);
    });
  });
});
