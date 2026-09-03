import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getGithubParams } from "./get-github-params";

describe("getGithubParams", () => {
  const DEFAULT_ENV = {
    GITHUB_TOKEN: "ghp_mock_token_12345",
    GITHUB_REPOSITORY: "octocat/hello-world",
    GITHUB_EVENT_PATH: "/github/workflow/event.json",
    GITHUB_RUN_ID: "123456789",
  };

  const VALID_PR_PAYLOAD = {
    pull_request: {
      number: 101,
    },
  };

  let scopedGetGithubParams = getGithubParams;

  beforeEach(async () => {
    vi.resetAllMocks();
    vi.resetModules();

    vi.stubEnv("GITHUB_TOKEN", DEFAULT_ENV.GITHUB_TOKEN);
    vi.stubEnv("GITHUB_REPOSITORY", DEFAULT_ENV.GITHUB_REPOSITORY);
    vi.stubEnv("GITHUB_EVENT_PATH", DEFAULT_ENV.GITHUB_EVENT_PATH);
    vi.stubEnv("GITHUB_RUN_ID", DEFAULT_ENV.GITHUB_RUN_ID);

    scopedGetGithubParams = (await import("./get-github-params"))
      .getGithubParams;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Happy Path", () => {
    it("should correctly parse environment variables and PR payload", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(VALID_PR_PAYLOAD),
      );

      const result = getGithubParams();

      expect(result).toEqual({
        token: "ghp_mock_token_12345",
        repository: "octocat/hello-world",
        prNumber: 101,
        runId: "123456789",
      });
      expect(fs.existsSync).toHaveBeenCalledWith("/github/workflow/event.json");
      expect(fs.readFileSync).toHaveBeenCalledWith(
        "/github/workflow/event.json",
        "utf8",
      );
    });

    it("should return params successfully when optional GITHUB_RUN_ID is undefined", () => {
      delete process.env.GITHUB_RUN_ID;

      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify(VALID_PR_PAYLOAD),
      );

      const result = scopedGetGithubParams();

      expect(result).toEqual({
        token: "ghp_mock_token_12345",
        repository: "octocat/hello-world",
        prNumber: 101,
        runId: undefined,
      });
    });
  });

  describe("Environment Variables Edge Cases", () => {
    it("should throw when GITHUB_TOKEN is missing", () => {
      delete process.env.GITHUB_TOKEN;

      expect(() => scopedGetGithubParams()).toThrow(
        "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).",
      );
    });

    it("should throw when GITHUB_REPOSITORY is missing", () => {
      delete process.env.GITHUB_REPOSITORY;

      expect(() => scopedGetGithubParams()).toThrow(
        "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).",
      );
    });

    it("should throw when GITHUB_EVENT_PATH is missing", () => {
      delete process.env.GITHUB_EVENT_PATH;

      expect(() => scopedGetGithubParams()).toThrow(
        "[GithubEnv] Missing required environment variables (GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_EVENT_PATH).",
      );
    });

    it("should treat empty string environment variables as missing and throw", () => {
      vi.stubEnv("GITHUB_TOKEN", "");

      expect(() => scopedGetGithubParams()).toThrow(
        "[GithubEnv] Missing required environment variables",
      );
    });
  });

  describe("File System Edge Cases", () => {
    it("should throw when event payload file path does not exist", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(false);

      expect(() => getGithubParams()).toThrow(
        '[GithubEnv] Event payload file not found at path: "/github/workflow/event.json"',
      );
    });
  });

  describe("Payload Parsing & Pull Request Data Edge Cases", () => {
    it("should allow SyntaxError to propagate when JSON parsing fails", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue("{ invalid_json: ");

      expect(() => getGithubParams()).toThrow(SyntaxError);
    });

    it("should throw when event payload is for a non-PR event (e.g., push event)", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({ ref: "refs/heads/main", commits: [] }),
      );

      expect(() => getGithubParams()).toThrow(
        "[GithubEnv] Event payload is not associated with a Pull Request.",
      );
    });

    it("should throw when pull_request object exists but number is missing", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({ pull_request: { title: "Update README" } }),
      );

      expect(() => getGithubParams()).toThrow(
        "[GithubEnv] Event payload is not associated with a Pull Request.",
      );
    });

    it("should throw when pull_request.number evaluates to 0 (falsy integer)", () => {
      vi.spyOn(fs, "existsSync").mockReturnValue(true);
      vi.spyOn(fs, "readFileSync").mockReturnValue(
        JSON.stringify({ pull_request: { number: 0 } }),
      );

      expect(() => getGithubParams()).toThrow(
        "[GithubEnv] Event payload is not associated with a Pull Request.",
      );
    });
  });
});
