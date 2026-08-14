import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiConfig, GitHubComment } from "../types";
import { commentAction } from "./comment-action";

describe("commentAction", () => {
  const mockConfig: ApiConfig = {
    token: "ghp_mock_token_12345",
    repository: "octocat/hello-world",
    prNumber: 42,
  };

  const expectedHeaders = {
    Authorization: "Bearer ghp_mock_token_12345",
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2026-03-10",
    "Content-Type": "application/json",
  };

  const mockResponseComment: GitHubComment = {
    id: 999,
    body: "## Coverage Report\nOverall coverage: 95%",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("POST Mode (id === null)", () => {
    it("should issue a POST request to the issue comments endpoint and return the created comment", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(mockResponseComment), {
          status: 201,
          statusText: "Created",
        }),
      );

      const commentBody = "New comment body";
      const result = await commentAction({
        config: mockConfig,
        body: commentBody,
        id: null,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/octocat/hello-world/issues/42/comments",
        {
          method: "POST",
          headers: expectedHeaders,
          body: JSON.stringify({ body: commentBody }),
        },
      );

      expect(result).toEqual(mockResponseComment);
    });

    it("should throw error with POST verb in message when HTTP request fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Unprocessable Entity", {
          status: 422,
          statusText: "Unprocessable Entity",
        }),
      );

      await expect(
        commentAction({
          config: mockConfig,
          body: "Failed body",
          id: null,
        }),
      ).rejects.toThrow(
        "[GitHub API] Failed to post comment: HTTP 422 Unprocessable Entity",
      );
    });
  });

  describe("PATCH Mode (id !== null)", () => {
    it("should issue a PATCH request to the specific comment ID endpoint and return updated comment", async () => {
      const updatedComment: GitHubComment = {
        id: 12345,
        body: "Updated comment body",
      };

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(updatedComment), {
          status: 200,
          statusText: "OK",
        }),
      );

      const result = await commentAction({
        config: mockConfig,
        body: "Updated comment body",
        id: 12345,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/octocat/hello-world/issues/comments/12345",
        {
          method: "PATCH",
          headers: expectedHeaders,
          body: JSON.stringify({ body: "Updated comment body" }),
        },
      );

      expect(result).toEqual(updatedComment);
    });

    it("should throw error with EDIT verb in message when HTTP request fails", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Not Found", {
          status: 404,
          statusText: "Not Found",
        }),
      );

      await expect(
        commentAction({
          config: mockConfig,
          body: "Update attempt",
          id: 12345,
        }),
      ).rejects.toThrow(
        "[GitHub API] Failed to edit comment: HTTP 404 Not Found",
      );
    });
  });

  describe("Edge Cases & Input Boundary Conditions", () => {
    it("should treat id = 0 as a valid comment ID and issue a PATCH request to /comments/0", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ id: 0, body: "Zero ID comment" }), {
          status: 200,
        }),
      );

      await commentAction({
        config: mockConfig,
        body: "Zero ID comment",
        id: 0,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/octocat/hello-world/issues/comments/0",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("should correctly handle negative integer IDs for PATCH requests", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ id: -1, body: "Negative ID" }), {
          status: 200,
        }),
      );

      await commentAction({
        config: mockConfig,
        body: "Negative ID",
        id: -1,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/octocat/hello-world/issues/comments/-1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    it("should allow posting empty string bodies", async () => {
      const fetchSpy = vi
        .spyOn(globalThis, "fetch")
        .mockResolvedValue(
          new Response(JSON.stringify({ id: 100, body: "" }), { status: 200 }),
        );

      await commentAction({
        config: mockConfig,
        body: "",
        id: null,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ body: "" }),
        }),
      );
    });

    it("should properly serialize complex markdown, multiline text, and special characters in payload", async () => {
      const complexBody =
        "## Header\n\n- [ ] Item 1\n- [x] Item 2\n\n`code block` & <script>alert(1)</script> 🚀";

      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ id: 100, body: complexBody }), {
          status: 200,
        }),
      );

      await commentAction({
        config: mockConfig,
        body: complexBody,
        id: null,
      });

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ body: complexBody }),
        }),
      );
    });

    it("should propagate network errors if fetch rejects", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new TypeError("Failed to fetch"),
      );

      await expect(
        commentAction({
          config: mockConfig,
          body: "Network fail",
          id: null,
        }),
      ).rejects.toThrow(TypeError);
    });

    it("should throw SyntaxError if successful HTTP response contains invalid JSON body", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Malformed JSON Response", { status: 200 }),
      );

      await expect(
        commentAction({
          config: mockConfig,
          body: "Valid body",
          id: null,
        }),
      ).rejects.toThrow(SyntaxError);
    });
  });
});
