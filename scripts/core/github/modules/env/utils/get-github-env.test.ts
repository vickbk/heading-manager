import { beforeEach, describe, expect, it, vi } from "vitest";

import { readJsonFile } from "@/scripts/shared/files";
import { getGithubEnv } from "../utils/get-github-env";
import { getGithubRequireds } from "../utils/get-github-requireds";

vi.mock("@/scripts/shared/files", () => ({
  readJsonFile: vi.fn(),
}));

vi.mock("./get-github-requireds", () => ({
  getGithubRequireds: vi.fn(),
}));

describe("getGithubEnv", () => {
  const MISSING_PR_ERROR_MESSAGE =
    "[GithubEnv] Event payload is not associated with a Pull Request.";

  const mockParams = {
    token: "ghp_mock_token_1234567890",
    repository: "octocat/Hello-World",
    eventPath: "/github/workflow/event.json",
    envPath: "/github/workflow/event.json",
  } as ReturnType<typeof getGithubRequireds>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getGithubRequireds).mockReturnValue(mockParams);
  });

  describe("Happy Path Execution", () => {
    it("should resolve with env params and prNumber when pull_request number exists", async () => {
      const mockPayload = {
        pull_request: {
          number: 42,
          title: "Fix bug",
        },
      };
      vi.mocked(readJsonFile).mockResolvedValue(mockPayload);

      const result = await getGithubEnv();

      expect(getGithubRequireds).toHaveBeenCalledTimes(1);
      expect(readJsonFile).toHaveBeenCalledTimes(1);
      expect(readJsonFile).toHaveBeenCalledWith({
        filePath: mockParams.envPath,
      });
      expect(result).toEqual({
        ...mockParams,
        prNumber: 42,
      });
    });

    it("should preserve additional properties from getGithubRequireds alongside prNumber", async () => {
      const extendedParams = {
        ...mockParams,
        customFlag: true,
        apiUrl: "https://api.github.com",
      };
      vi.mocked(getGithubRequireds).mockReturnValue(extendedParams);
      vi.mocked(readJsonFile).mockResolvedValue({
        pull_request: { number: 101 },
      });

      const result = await getGithubEnv();

      expect(result).toEqual({
        ...extendedParams,
        prNumber: 101,
      });
    });
  });

  describe("Pull Request Payload Validation", () => {
    it("should throw when pull_request property is missing in JSON payload", async () => {
      vi.mocked(readJsonFile).mockResolvedValue({});

      await expect(getGithubEnv()).rejects.toThrow(MISSING_PR_ERROR_MESSAGE);
    });

    it("should throw when pull_request is null in JSON payload", async () => {
      vi.mocked(readJsonFile).mockResolvedValue({
        pull_request: null,
      });

      await expect(getGithubEnv()).rejects.toThrow(MISSING_PR_ERROR_MESSAGE);
    });

    it("should throw when pull_request.number is undefined", async () => {
      vi.mocked(readJsonFile).mockResolvedValue({
        pull_request: { title: "Draft PR" },
      });

      await expect(getGithubEnv()).rejects.toThrow(MISSING_PR_ERROR_MESSAGE);
    });

    it.each([
      ["zero", 0],
      ["null", null],
      ["undefined", undefined],
      ["empty string", ""],
      ["NaN", NaN],
    ])(
      "should throw when pull_request.number is falsy (%s)",
      async (_, invalidNumber) => {
        vi.mocked(readJsonFile).mockResolvedValue({
          pull_request: { number: invalidNumber },
        });

        await expect(getGithubEnv()).rejects.toThrow(MISSING_PR_ERROR_MESSAGE);
      },
    );
  });

  describe("Error Propagation", () => {
    it("should bubble up errors thrown by getGithubRequireds without calling readJsonFile", async () => {
      const mockEnvError = new Error(
        "[GithubEnv] Missing required environment variables",
      );
      vi.mocked(getGithubRequireds).mockImplementation(() => {
        throw mockEnvError;
      });

      await expect(getGithubEnv()).rejects.toThrow(mockEnvError);
      expect(readJsonFile).not.toHaveBeenCalled();
    });

    it("should bubble up errors thrown by readJsonFile", async () => {
      const mockIoError = new Error(
        '[IO Error] Failed to read "/github/workflow/event.json"',
      );
      vi.mocked(readJsonFile).mockRejectedValue(mockIoError);

      await expect(getGithubEnv()).rejects.toThrow(mockIoError);
    });
  });
});
