import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "@/scripts/config";
import { getCommentWithId, saveComment } from "@/scripts/core/github";
import { shutConsole } from "@/tests/setup/console";
import { getErrorLogContent } from "../modules/readme";
import { SKIPPED_MESSAGE, SUCCESS_MESSAGE } from "./get-comment-body";
import {
  postReadmeComment,
  README_COMMENT_IDENTIFIER,
} from "./post-readme-comment";

vi.mock("@/scripts/config", () => ({
  config: {
    docs: {
      hasRun: true,
    },
  },
}));

vi.mock("@/scripts/core/github", () => ({
  getCommentWithId: vi.fn(),
  saveComment: vi.fn(),
}));

vi.mock("../modules/readme", () => ({
  getErrorLogContent: vi.fn(),
}));

describe("postReadmeComment", () => {
  const mockExistingComment = {
    id: 554433,
    body: "previous comment body",
  };
  const ERROR_LOG_CONTENT =
    "❌ README missing required header: ## Installation";

  beforeEach(() => {
    vi.resetAllMocks();
    shutConsole();

    config.docs.hasRun = true;
  });

  describe("Documentation Check Ran (hasRun === true)", () => {
    it("should post error log content when errors exist and no existing comment is found", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(ERROR_LOG_CONTENT);
      vi.mocked(getCommentWithId).mockResolvedValue(null);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(getErrorLogContent).toHaveBeenCalledTimes(1);
      expect(getCommentWithId).toHaveBeenCalledWith(README_COMMENT_IDENTIFIER);
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        "[Readme Reporter] Posting new PR comment...",
      );
      expect(saveComment).toHaveBeenCalledWith({
        body: ERROR_LOG_CONTENT,
        id: null,
      });
      expect(console.log).toHaveBeenNthCalledWith(
        2,
        "[Readme Reporter] Comment processed successfully.",
      );
    });

    it("should update existing comment with error log content when existing comment is found", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(ERROR_LOG_CONTENT);
      vi.mocked(getCommentWithId).mockResolvedValue(mockExistingComment);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(getErrorLogContent).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenNthCalledWith(
        1,
        `[Readme Reporter] Updating existing PR comment ID: ${mockExistingComment.id}`,
      );
      expect(saveComment).toHaveBeenCalledWith({
        body: ERROR_LOG_CONTENT,
        id: mockExistingComment.id,
      });
    });

    it("should post success message when getErrorLogContent returns null (no errors) and no existing comment", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(null);
      vi.mocked(getCommentWithId).mockResolvedValue(null);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(saveComment).toHaveBeenCalledWith({
        body: SUCCESS_MESSAGE,
        id: null,
      });
    });

    it("should update existing comment with success message when getErrorLogContent returns null", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(null);
      vi.mocked(getCommentWithId).mockResolvedValue(mockExistingComment);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(saveComment).toHaveBeenCalledWith({
        body: SUCCESS_MESSAGE,
        id: mockExistingComment.id,
      });
    });
  });

  describe("Documentation Check Skipped (hasRun !== true)", () => {
    it("should post skipped message without reading error log when hasRun is false", async () => {
      config.docs.hasRun = false;
      vi.mocked(getCommentWithId).mockResolvedValue(null);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(getErrorLogContent).not.toHaveBeenCalled();
      expect(getCommentWithId).toHaveBeenCalledWith(README_COMMENT_IDENTIFIER);
      expect(saveComment).toHaveBeenCalledWith({
        body: SKIPPED_MESSAGE,
        id: null,
      });
    });

    it("should update existing comment with skipped message when hasRun is false", async () => {
      config.docs.hasRun = false;
      vi.mocked(getCommentWithId).mockResolvedValue(mockExistingComment);
      vi.mocked(saveComment).mockResolvedValue({} as never);

      await postReadmeComment();

      expect(getErrorLogContent).not.toHaveBeenCalled();
      expect(saveComment).toHaveBeenCalledWith({
        body: SKIPPED_MESSAGE,
        id: mockExistingComment.id,
      });
    });
  });

  describe("Error Propagation & Failure Modes", () => {
    it("should reject and halt execution if getErrorLogContent throws", async () => {
      const error = new Error("Disk read error");
      vi.mocked(getErrorLogContent).mockRejectedValue(error);
      vi.mocked(getCommentWithId).mockResolvedValue(null);

      await expect(postReadmeComment()).rejects.toThrow(error);

      expect(saveComment).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should reject and halt execution if getCommentWithId throws", async () => {
      const error = new Error("GitHub API 500 Server Error");
      vi.mocked(getErrorLogContent).mockResolvedValue(null);
      vi.mocked(getCommentWithId).mockRejectedValue(error);

      await expect(postReadmeComment()).rejects.toThrow(error);

      expect(saveComment).not.toHaveBeenCalled();
      expect(console.log).not.toHaveBeenCalled();
    });

    it("should throw error and omit completion log if saveComment fails", async () => {
      vi.mocked(getErrorLogContent).mockResolvedValue(null);
      vi.mocked(getCommentWithId).mockResolvedValue(null);

      const saveError = new Error("GitHub API 403 Forbidden");
      vi.mocked(saveComment).mockRejectedValue(saveError);

      await expect(postReadmeComment()).rejects.toThrow(saveError);

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenLastCalledWith(
        "[Readme Reporter] Posting new PR comment...",
      );
      expect(console.log).not.toHaveBeenCalledWith(
        "[Readme Reporter] Comment processed successfully.",
      );
    });
  });
});
