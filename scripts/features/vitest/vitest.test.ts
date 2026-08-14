import * as githubApi from "@/scripts/core/github";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as reportUtils from "./utils/report";
import * as vitest from "./vitest";

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

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
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

  describe("Error Handling & Fatal Exit Edge Cases", () => {
    const { postCoverageComment } = vitest;
    it("should catch Error instances, print error log, and call process.exit(1)", async () => {
      vi.spyOn(githubApi, "getGithubParams").mockImplementation(() => {
        throw new Error("Missing GITHUB_TOKEN environment variable");
      });

      await expect(postCoverageComment()).rejects.toThrow(
        "process.exit called with code: 1",
      );

      expect(console.error).toHaveBeenCalledWith(
        "[Coverage Runner] Fatal error: Missing GITHUB_TOKEN environment variable",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should catch non-Error thrown objects (e.g. primitive strings) and format correctly", async () => {
      vi.spyOn(reportUtils, "getReport").mockImplementation(() => {
        throw "Unexpected file access permission error";
      });
      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);

      await expect(postCoverageComment()).rejects.toThrow(
        "process.exit called with code: 1",
      );

      expect(console.error).toHaveBeenCalledWith(
        "[Coverage Runner] Fatal error: Unexpected file access permission error",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should catch rejected promises from async getComment call and handle fatal exit", async () => {
      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReport);
      vi.spyOn(githubApi, "getComment").mockRejectedValue(
        new Error("GitHub API Rate Limit 403"),
      );

      await expect(postCoverageComment()).rejects.toThrow(
        "process.exit called with code: 1",
      );

      expect(console.error).toHaveBeenCalledWith(
        "[Coverage Runner] Fatal error: GitHub API Rate Limit 403",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe("CLI Entrypoint Conditional Execution (process.argv)", () => {
    const { postCoverageComment } = vitest;
    it("should execute runner when process.argv[1] contains 'comments/vitest'", async () => {
      process.argv = ["node", "/usr/bin/comments/vitest/index.ts"];

      vi.spyOn(githubApi, "getGithubParams").mockReturnValue(mockConfig);
      vi.spyOn(reportUtils, "getReport").mockReturnValue(mockReport);
      vi.spyOn(githubApi, "getComment").mockResolvedValue(null);
      vi.spyOn(githubApi, "commentAction").mockResolvedValue({
        id: 1,
        body: "",
      });

      if (process.argv[1]?.includes("comments/vitest")) {
        await postCoverageComment();
      }

      expect(githubApi.getGithubParams).toHaveBeenCalledTimes(1);
    });

    it("should NOT execute runner when process.argv[1] does not match target path", async () => {
      process.argv = ["node", "/usr/bin/other-script.ts"];

      const getGithubParamsSpy = vi.spyOn(githubApi, "getGithubParams");

      if (process.argv[1]?.includes("comments/vitest")) {
        await postCoverageComment();
      }

      expect(getGithubParamsSpy).not.toHaveBeenCalled();
    });

    it("should safely handle undefined process.argv[1] without throwing", async () => {
      process.argv = ["node"];

      const getGithubParamsSpy = vi.spyOn(githubApi, "getGithubParams");

      if (process.argv[1]?.includes("comments/vitest")) {
        await postCoverageComment();
      }

      expect(getGithubParamsSpy).not.toHaveBeenCalled();
    });
  });

  describe("comments/vitest top-level execution", () => {
    beforeEach(() => {
      vi.resetModules(); // Clears import cache so top-level code re-runs on import
      vi.clearAllMocks();
      vi.spyOn(console, "log").mockImplementation(() => {});
      vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it("should execute postCoverageComment and handle process.exit(1) on failure when process.argv matches", async () => {
      // 1. Set CLI path to match the if condition
      process.argv = ["node", "/workspace/scripts/comments/vitest.ts"];

      // 2. Mock process.exit to throw so execution halts cleanly in test environment
      const exitSpy = vi.spyOn(process, "exit").mockImplementation((code?) => {
        return `process.exit: ${code}` as never;
      });

      // 3. Force an error inside postCoverageComment
      const gitSpy = vi
        .spyOn(await import("@/scripts/core/github"), "getGithubParams")
        .mockThrow(new Error("Missing GITHUB_TOKEN environment variable"));

      // 4. Dynamically import module to trigger top-level execution
      await import("./vitest");
      expect(exitSpy).toHaveReturnedWith("process.exit: 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      expect(gitSpy).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "[Coverage Runner] Fatal error: Missing GITHUB_TOKEN environment variable",
      );
    });

    it("should execute postCoverageComment successfully when process.argv matches", async () => {
      process.argv = ["node", "/workspace/scripts/comments/vitest.ts"];

      const freshGitMod = await import("@/scripts/core/github");
      const exitSpy = vi
        .spyOn(process, "exit")
        .mockImplementation(() => undefined as never);

      const getGithubParamsSpy = vi
        .spyOn(freshGitMod, "getGithubParams")
        .mockReturnValue({
          repository: "owner/repo",
          runId: "999",
        } as ReturnType<typeof githubApi.getGithubParams>);

      vi.spyOn(await import("./utils/report"), "getReport").mockReturnValue({
        commentBody: "### Coverage Report",
      } as ReturnType<typeof reportUtils.getReport>);

      vi.spyOn(freshGitMod, "getComment").mockResolvedValue(null);
      const commentActionSpy = vi
        .spyOn(freshGitMod, "commentAction")
        .mockImplementation(async () => ({ id: 0, body: "" }));

      // Trigger top-level execution
      await import("./vitest");

      expect(getGithubParamsSpy).toHaveBeenCalledTimes(1);
      expect(commentActionSpy).toHaveBeenCalledTimes(1);
      expect(commentActionSpy).toHaveBeenCalledWith({
        config: { repository: "owner/repo", runId: "999" },
        body: "### Coverage Report",
        id: null,
      });
      expect(exitSpy).not.toHaveBeenCalled();
    });

    it("should NOT execute postCoverageComment when process.argv does not match", async () => {
      process.argv = ["node", "/workspace/scripts/other-script.ts"];

      const getGithubParamsSpy = vi.spyOn(githubApi, "getGithubParams");

      await import("./vitest");

      expect(getGithubParamsSpy).not.toHaveBeenCalled();
    });
  });
});
