import { beforeEach, describe, expect, it, vi } from "vitest";

import * as envModule from "../modules/env";
import { getCommentWithId } from "./get-comment-with-id";
import * as headersModule from "./get-headers";

describe("getCommentWithId", () => {
  const mockConfig = {
    repository: "owner/repo-name",
    prNumber: 42,
    token: "ghp_mock_token_12345",
  };

  const mockHeaders = {
    Authorization: "Bearer ghp_mock_token_12345",
    Accept: "application/vnd.github.v3+json",
  };

  const mockComment1 = {
    id: 101,
    body: "<!-- comment-id: coverage-report -->\n## Coverage Summary\n100%",
    user: { login: "github-actions[bot]" },
  };

  const mockComment2 = {
    id: 102,
    body: "<!-- comment-id: build-status -->\n## Build Passed",
    user: { login: "github-actions[bot]" },
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal("fetch", vi.fn());

    vi.spyOn(envModule, "getGithubEnv").mockResolvedValue(
      mockConfig as Awaited<ReturnType<typeof envModule.getGithubEnv>>,
    );
    vi.spyOn(headersModule, "getHeaders").mockReturnValue(
      mockHeaders as ReturnType<typeof headersModule.getHeaders>,
    );
  });

  describe("Successful Retrieval & Matching Logic", () => {
    it("should return the matching comment when identifier exists in comment body", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockComment1, mockComment2]),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCommentWithId("coverage-report");

      expect(result).toEqual(mockComment1);
    });

    it("should return the first matching comment when multiple comments contain the identifier", async () => {
      const duplicateComment = {
        id: 103,
        body: "<!-- comment-id: coverage-report -->\nOlder coverage report",
      };
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockComment1, duplicateComment]),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCommentWithId("coverage-report");

      expect(result).toEqual(mockComment1);
    });

    it("should return null when no comment contains the identifier", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([mockComment1, mockComment2]),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCommentWithId("non-existent-marker");

      expect(result).toBeNull();
    });

    it("should return null when the API returns an empty comments list", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      const result = await getCommentWithId("coverage-report");

      expect(result).toBeNull();
    });
  });

  describe("API Request Verification", () => {
    it("should call fetch with correct repository, prNumber, per_page query param, and headers", async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue([]),
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      await getCommentWithId("test-id");

      const expectedUrl = `https://api.github.com/repos/${mockConfig.repository}/issues/${mockConfig.prNumber}/comments?per_page=100`;

      expect(envModule.getGithubEnv).toHaveBeenCalledTimes(1);
      expect(headersModule.getHeaders).toHaveBeenCalledWith(mockConfig.token);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(expectedUrl, {
        headers: mockHeaders,
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw a formatted error on non-OK API responses", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };
      vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

      await expect(getCommentWithId("coverage-report")).rejects.toThrow(
        "[GitHub API] Failed to fetch comments: HTTP 404 Not Found",
      );
    });

    it("should bubble up error when getGithubEnv fails", async () => {
      const envError = new Error(
        "[GithubEnv] Missing required environment variables",
      );
      vi.spyOn(envModule, "getGithubEnv").mockRejectedValue(envError);

      await expect(getCommentWithId("coverage-report")).rejects.toThrow(
        envError,
      );
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should bubble up network rejections from fetch", async () => {
      const networkError = new TypeError("Failed to fetch");
      vi.mocked(fetch).mockRejectedValue(networkError);

      await expect(getCommentWithId("coverage-report")).rejects.toThrow(
        networkError,
      );
    });
  });
});
