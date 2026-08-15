import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiConfig, GitHubComment } from "../types";
import { getComment } from "./get-comment";

describe("getComment", () => {
  const mockConfig: ApiConfig = {
    token: "ghp_mock_token_12345",
    repository: "octocat/hello-world",
    prNumber: 42,
  };

  const MOCK_IDENTIFIER = "<!-- coverage-report-id -->";

  const mockComments: GitHubComment[] = [
    { id: 101, body: "Great pull request! Looks good to me." },
    {
      id: 102,
      body: `${MOCK_IDENTIFIER}\n## Coverage Summary\nStatement coverage: 85%`,
    },
    { id: 103, body: "Please fix linting errors before merging." },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Happy Path & Matching Logic", () => {
    it("should fetch comments with correct URL and headers, returning the matching comment", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockComments), {
          status: 200,
          statusText: "OK",
        }),
      );

      const result = await getComment(mockConfig, MOCK_IDENTIFIER);

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/octocat/hello-world/issues/42/comments?per_page=100",
        {
          headers: {
            Authorization: "Bearer ghp_mock_token_12345",
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10",
            "Content-Type": "application/json",
          },
        },
      );

      expect(result).toEqual({
        id: 102,
        body: `${MOCK_IDENTIFIER}\n## Coverage Summary\nStatement coverage: 85%`,
      });
    });

    it("should return null when comments are returned but none match the identifier", async () => {
      const nonMatchingComments: GitHubComment[] = [
        { id: 201, body: "LGTM!" },
        { id: 202, body: "Added some review comments inline." },
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(nonMatchingComments), { status: 200 }),
      );

      const result = await getComment(mockConfig, MOCK_IDENTIFIER);

      expect(result).toBeNull();
    });

    it("should return the first matching comment if multiple comments contain the identifier", async () => {
      const multipleMatches: GitHubComment[] = [
        { id: 301, body: `Older report ${MOCK_IDENTIFIER}` },
        { id: 302, body: `Newer report ${MOCK_IDENTIFIER}` },
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(multipleMatches), { status: 200 }),
      );

      const result = await getComment(mockConfig, MOCK_IDENTIFIER);

      expect(result?.id).toBe(301);
    });
  });

  describe("HTTP Response Error Handling", () => {
    it("should throw an error on HTTP 401 Unauthorized", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Unauthorized", {
          status: 401,
          statusText: "Unauthorized",
        }),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        "[GitHub API] Failed to fetch comments: HTTP 401 Unauthorized",
      );
    });

    it("should throw an error on HTTP 404 Not Found", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
        }),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        "[GitHub API] Failed to fetch comments: HTTP 404 Not Found",
      );
    });

    it("should throw an error on HTTP 403 Forbidden / Rate Limited", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("API rate limit exceeded", {
          status: 403,
          statusText: "Forbidden",
        }),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        "[GitHub API] Failed to fetch comments: HTTP 403 Forbidden",
      );
    });

    it("should throw an error on HTTP 500 Server Error", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        "[GitHub API] Failed to fetch comments: HTTP 500 Internal Server Error",
      );
    });
  });

  describe("Edge Cases & Payload Formatting", () => {
    it("should return null when the GitHub response is an empty list of comments", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify([]), { status: 200 }),
      );

      const result = await getComment(mockConfig, MOCK_IDENTIFIER);

      expect(result).toBeNull();
    });

    it("should propagate network failure / fetch rejection", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("Failed to fetch"),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        "Failed to fetch",
      );
    });

    it("should propagate JSON parse error if response body is malformed JSON", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("invalid raw body json", { status: 200 }),
      );

      await expect(getComment(mockConfig, MOCK_IDENTIFIER)).rejects.toThrow(
        SyntaxError,
      );
    });

    it("should perform exact substring matching for complex HTML comment identifiers", async () => {
      const specialIdentifier = "<!-- custom-id-12345 -->";
      const commentList: GitHubComment[] = [
        { id: 401, body: "<!-- custom-id-123456 -->" }, // Partial mismatch suffix
        { id: 402, body: "Line 1\n<!-- custom-id-12345 -->\nLine 3" }, // Match inside newlines
      ];

      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(commentList), { status: 200 }),
      );

      const result = await getComment(mockConfig, specialIdentifier);

      expect(result?.id).toBe(402); // Standard string includes matches 401 as well
    });
  });
});
