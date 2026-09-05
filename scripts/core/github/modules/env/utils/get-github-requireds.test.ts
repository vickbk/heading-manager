import { beforeEach, describe, expect, it, vi } from "vitest";

import { config } from "@/scripts/config";
import { getGithubRequireds } from "./get-github-requireds";

vi.mock("@/scripts/config", () => ({
  config: {
    github: {
      token: "",
      repository: "",
      eventPath: "",
    },
  },
}));

type MockedConfig = typeof config.github;
describe("getGithubRequireds", () => {
  const EXPECTED_ERROR_MESSAGE =
    "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).";

  const validGithubConfig = {
    token: "ghp_mock_token_1234567890",
    repository: "octocat/Hello-World",
    eventPath: "/github/workflow/event.json",
  } as MockedConfig;

  beforeEach(() => {
    vi.restoreAllMocks();
    config.github = { ...validGithubConfig };
  });

  describe("Happy Path Execution", () => {
    it("should return the github config object when all required variables are present", () => {
      const result = getGithubRequireds();

      expect(result).toEqual(validGithubConfig);
      expect(result).toEqual(config.github);
    });

    it("should return the config object intact with additional optional properties", () => {
      config.github = {
        ...validGithubConfig,
        apiUrl: "https://api.github.com",
        runId: "123456789",
      } as MockedConfig;

      const result = getGithubRequireds();

      expect(result).toHaveProperty("apiUrl", "https://api.github.com");
      expect(result).toHaveProperty("runId", "123456789");
    });
  });

  describe("Validation & Missing Variable Guards", () => {
    it.each([
      ["empty string", ""],
      ["undefined", undefined],
      ["null", null],
    ])(
      "should throw when 'token' is missing or falsy (%s)",
      (_, invalidValue) => {
        config.github.token = invalidValue as undefined;

        expect(() => getGithubRequireds()).toThrow(Error);
        expect(() => getGithubRequireds()).toThrow(EXPECTED_ERROR_MESSAGE);
      },
    );

    it.each([
      ["empty string", ""],
      ["undefined", undefined],
      ["null", null],
    ])(
      "should throw when 'repository' is missing or falsy (%s)",
      (_, invalidValue) => {
        config.github.repository = invalidValue as undefined;

        expect(() => getGithubRequireds()).toThrow(Error);
        expect(() => getGithubRequireds()).toThrow(EXPECTED_ERROR_MESSAGE);
      },
    );

    it.each([
      ["empty string", ""],
      ["undefined", undefined],
      ["null", null],
    ])(
      "should throw when 'eventPath' is missing or falsy (%s)",
      (_, invalidValue) => {
        config.github.eventPath = invalidValue as undefined;

        expect(() => getGithubRequireds()).toThrow(Error);
        expect(() => getGithubRequireds()).toThrow(EXPECTED_ERROR_MESSAGE);
      },
    );

    it("should throw when all required variables are missing", () => {
      config.github = {
        token: "",
        repository: "",
        eventPath: "",
      } as MockedConfig;

      expect(() => getGithubRequireds()).toThrow(EXPECTED_ERROR_MESSAGE);
    });
  });
});
