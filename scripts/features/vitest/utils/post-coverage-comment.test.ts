import * as githubApi from "@/scripts/core/github";
import { shutConsole } from "@/tests/setup/console";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as vitest from "./post-coverage-comment";
import * as reportUtils from "./report";

describe("postCoverageComment (Runner Entry Point)", () => {
  const mockConfig = {
    token: "ghp_mock_token_12345",
    repository: "octocat/hello-world",
    prNumber: 42,
    runId: "100200300",
  };

  const mockReport = {
    totalPct: "88.5%",
    markdownSummary: "## Coverage Summary",
    commentBody: "<!-- coverage-report-id -->\n## 🧪 Test Coverage Report",
  };

  const originalArgv = process.argv;

  beforeEach(() => {
    vi.restoreAllMocks();

    shutConsole();
    vi.spyOn(process, "exit").mockImplementation(
      (code?: string | number | null) => {
        throw new Error(`process.exit called with code: ${code}`);
      },
    );
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("Happy Path Execution", () => {
    const { postCoverageComment } = vitest;
    it("should post a new PR comment when no existing comment is found", async () => {
      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReport);
      vi.spyOn(githubApi, "getComment").mockResolvedValue(null);
      const commentActionSpy = vi
        .spyOn(githubApi, "commentAction")
        .mockResolvedValue({
          id: 555,
          body: mockReport.commentBody,
        });

      await postCoverageComment();

      expect(githubApi.getGithubParams).toHaveBeenCalledTimes(1);
      expect(reportUtils.getReport).toHaveBeenCalledWith(
        undefined,
        "octocat/hello-world",
        "100200300",
      );
      expect(githubApi.getComment).toHaveBeenCalledWith(
        mockConfig,
        reportUtils.COMMENT_IDENTIFIER,
      );

      expect(commentActionSpy).toHaveBeenCalledWith({
        config: mockConfig,
        body: mockReport.commentBody,
        id: null,
      });

      expect(console.log).toHaveBeenCalledWith(
        "[Coverage Runner] Posting new PR comment...",
      );
    });

    it("should update an existing PR comment when a matching comment ID is found", async () => {
      const existingComment = {
        id: 789,
        body: "<!-- coverage-report-id --> Old Report",
      };

      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReport);
      vi.spyOn(githubApi, "getComment").mockResolvedValue(existingComment);
      const commentActionSpy = vi
        .spyOn(githubApi, "commentAction")
        .mockResolvedValue({
          id: 789,
          body: mockReport.commentBody,
        });

      await postCoverageComment();

      expect(commentActionSpy).toHaveBeenCalledWith({
        config: mockConfig,
        body: mockReport.commentBody,
        id: 789,
      });

      expect(console.log).toHaveBeenCalledWith(
        "[Coverage Runner] Updating existing PR comment ID: 789",
      );
    });

    it("should handle existing comments with id = 0 correctly", async () => {
      const zeroIdComment = {
        id: 0,
        body: "<!-- coverage-report-id --> Zero ID",
      };

      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReport);
      vi.spyOn(githubApi, "getComment").mockResolvedValue(zeroIdComment);
      const commentActionSpy = vi
        .spyOn(githubApi, "commentAction")
        .mockResolvedValue({
          id: 0,
          body: mockReport.commentBody,
        });

      await postCoverageComment();

      expect(commentActionSpy).toHaveBeenCalledWith({
        config: mockConfig,
        body: mockReport.commentBody,
        id: 0,
      });
    });
  });
});
