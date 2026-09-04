import { beforeEach, describe, expect, it, vi } from "vitest";

import { shutConsole } from "@/tests/setup/console";
import * as envModule from "../modules/env";
import * as headerModule from "./get-headers";
import { saveComment } from "./save-comment";

describe("saveComment", () => {
  const mockConfig = {
    repository: "owner/repo-name",
    prNumber: 42,
    token: "ghp_mock_token_12345",
  } as Awaited<ReturnType<typeof envModule.getGithubEnv>>;

  const mockHeaders = {
    Authorization: "Bearer ghp_mock_token_12345",
    Accept: "application/vnd.github.v3+json",
  } as ReturnType<typeof headerModule.getHeaders>;

  const mockCommentPayload = {
    id: 98765,
    body: "## PR Review Summary",
    user: { login: "github-actions[bot]" },
    created_at: "2026-09-03T12:00:00Z",
    updated_at: "2026-09-03T12:00:00Z",
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    shutConsole();

    vi.spyOn(envModule, "getGithubEnv").mockResolvedValue(mockConfig);
    vi.spyOn(headerModule, "getHeaders").mockReturnValue(mockHeaders);
  });

  describe("Comment Creation (POST)", () => {
    it("should send a POST request without identifier prefix when identifier is omitted", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockCommentPayload),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const commentBody = "## Initial PR Comment";
      const result = await saveComment({ body: commentBody, id: null });

      const expectedUrl = `https://api.github.com/repos/${mockConfig.repository}/issues/${mockConfig.prNumber}/comments`;

      expect(envModule.getGithubEnv).toHaveBeenCalledTimes(1);
      expect(headerModule.getHeaders).toHaveBeenCalledWith(mockConfig.token);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: "POST",
        headers: mockHeaders,
        body: JSON.stringify({ body: commentBody }),
      });
      expect(result).toEqual(mockCommentPayload);
    });
  });

  describe("Comment Update (PATCH)", () => {
    it("should send a PATCH request to the specific comment endpoint when id is a number", async () => {
      const commentId = 123456;
      const updatedBody = "## Updated PR Comment";
      const updatedPayload = {
        ...mockCommentPayload,
        id: commentId,
        body: updatedBody,
      };

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(updatedPayload),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await saveComment({ body: updatedBody, id: commentId });

      const expectedUrl = `https://api.github.com/repos/${mockConfig.repository}/issues/comments/${commentId}`;

      expect(envModule.getGithubEnv).toHaveBeenCalledTimes(1);
      expect(headerModule.getHeaders).toHaveBeenCalledWith(mockConfig.token);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        method: "PATCH",
        headers: mockHeaders,
        body: JSON.stringify({ body: updatedBody }),
      });
      expect(result).toEqual(updatedPayload);
    });
  });

  describe("Identifier Prepending & Normalization", () => {
    it("should prepend identifier to body when identifier is provided on POST", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockCommentPayload),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const identifier = "<!-- comment-id: readme-comment -->\n";
      const commentBody = "## Documentation Errors";

      await saveComment({
        body: commentBody,
        id: null,
        identifier,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            body: "<!-- comment-id: readme-comment -->## Documentation Errors",
          }),
        }),
      );
    });

    it("should trim surrounding whitespace from identifier before prepending on PATCH", async () => {
      const commentId = 555;
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockCommentPayload),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const identifier = "  <!-- comment-id: coverage -->\n\n ";
      const commentBody = "\n## Coverage Report";

      await saveComment({
        body: commentBody,
        id: commentId,
        identifier,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            body: "<!-- comment-id: coverage -->\n## Coverage Report",
          }),
        }),
      );
    });

    it("should treat empty string identifier identical to default parameter", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockCommentPayload),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const commentBody = "Plain comment body";

      await saveComment({
        body: commentBody,
        id: null,
        identifier: "",
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ body: "Plain comment body" }),
        }),
      );
    });
  });

  describe("API Error Handling", () => {
    it("should log error text and throw appropriate error message on POST failure", async () => {
      const responseText = `{"message": "Validation Failed"}`;
      const mockResponse = {
        ok: false,
        status: 422,
        statusText: "Unprocessable Entity",
        text: vi.fn().mockResolvedValue(responseText),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      await expect(
        saveComment({ body: "Test Body", id: null }),
      ).rejects.toThrow(
        "[GitHub API] Failed to post comment: HTTP 422 Unprocessable Entity",
      );

      expect(console.log).toHaveBeenCalledWith(
        `[CGithub API] Failed to edit comment with respose: ${responseText}`,
      );
    });

    it("should log error text and throw appropriate error message on PATCH failure", async () => {
      const commentId = 789;
      const responseText = `{"message": "Not Found"}`;
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: vi.fn().mockResolvedValue(responseText),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      await expect(
        saveComment({ body: "Test Body", id: commentId }),
      ).rejects.toThrow(
        "[GitHub API] Failed to edit comment: HTTP 404 Not Found",
      );

      expect(console.log).toHaveBeenCalledWith(
        `[CGithub API] Failed to edit comment with respose: ${responseText}`,
      );
    });
  });

  describe("Upstream & Network Failures", () => {
    it("should bubble up error when getGithubEnv fails", async () => {
      const envError = new Error(
        "[GithubEnv] Missing required environment variables",
      );
      vi.spyOn(envModule, "getGithubEnv").mockRejectedValue(envError);

      await expect(
        saveComment({ body: "Test Body", id: null }),
      ).rejects.toThrow(envError);

      expect(fetch).not.toHaveBeenCalled();
    });

    it("should bubble up network rejection from fetch", async () => {
      const networkError = new TypeError("Failed to fetch");
      vi.mocked(fetch).mockRejectedValue(networkError);

      await expect(
        saveComment({ body: "Test Body", id: null }),
      ).rejects.toThrow(networkError);
    });
  });
});
