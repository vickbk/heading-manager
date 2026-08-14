import fs from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { githubWriteEnv } from "./github-write-env";

describe("exportToGithubEnv", () => {
  const MOCK_ENV_PATH =
    "/runner/work/_temp/_runner_file_commands/github_env_123";
  let appendFileSyncSpy: ReturnType<typeof vi.spyOn>;
  let scopedGithubWritter = githubWriteEnv;

  beforeEach(async () => {
    vi.unstubAllEnvs();
    vi.resetModules();
    scopedGithubWritter = (await import("./github-write-env")).githubWriteEnv;
    appendFileSyncSpy = vi
      .spyOn(fs, "appendFileSync")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe("Environment File Guard ($GITHUB_ENV)", () => {
    it("does not call fs.appendFileSync when GITHUB_ENV is undefined", () => {
      delete process.env.GITHUB_ENV;

      githubWriteEnv({ DIST_TAG: "latest" });

      expect(appendFileSyncSpy).not.toHaveBeenCalled();
    });

    it("does not call fs.appendFileSync when GITHUB_ENV is an empty string", () => {
      vi.stubEnv("GITHUB_ENV", "");

      githubWriteEnv({ DIST_TAG: "latest" });

      expect(appendFileSyncSpy).not.toHaveBeenCalled();
    });

    it("appends to the file specified in process.env.GITHUB_ENV when set", () => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_PATH);

      scopedGithubWritter({ DIST_TAG: "beta" });

      expect(appendFileSyncSpy).toHaveBeenCalledOnce();
      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        "DIST_TAG=beta\n",
        "utf8",
      );
    });
  });

  describe("Input Payload & Type Serialization", () => {
    beforeEach(() => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_PATH);
    });

    it("returns early and performs no file write if passed an empty object", () => {
      githubWriteEnv({});

      expect(appendFileSyncSpy).not.toHaveBeenCalled();
    });

    it("correctly formats multiple string, boolean, and numeric variables into a single atomic write", () => {
      scopedGithubWritter({
        DIST_TAG: "beta",
        IS_PRERELEASE: true,
        RELEASE_COUNT: 5,
        IS_DRAFT: false,
      });

      const expectedPayload =
        "DIST_TAG=beta\n" +
        "IS_PRERELEASE=true\n" +
        "RELEASE_COUNT=5\n" +
        "IS_DRAFT=false\n";

      expect(appendFileSyncSpy).toHaveBeenCalledOnce();
      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        expectedPayload,
        "utf8",
      );
    });

    it("correctly handles zero (0) as a valid numeric value rather than falsy", () => {
      scopedGithubWritter({ RETRY_COUNT: 0 });

      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        "RETRY_COUNT=0\n",
        "utf8",
      );
    });
  });

  describe("Edge Cases & Special Characters", () => {
    beforeEach(() => {
      vi.stubEnv("GITHUB_ENV", MOCK_ENV_PATH);
    });

    it("handles empty string values cleanly", () => {
      scopedGithubWritter({ EMPTY_VAR: "" });

      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        "EMPTY_VAR=\n",
        "utf8",
      );
    });

    it("preserves equals signs within values", () => {
      scopedGithubWritter({
        DATABASE_URL: "postgres://user:pass@localhost:5432/db?sslmode=disable",
        FLAG_ARG: "--tag=v0.2.0-beta.2",
      });

      const expectedPayload =
        "DATABASE_URL=postgres://user:pass@localhost:5432/db?sslmode=disable\n" +
        "FLAG_ARG=--tag=v0.2.0-beta.2\n";

      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        expectedPayload,
        "utf8",
      );
    });

    it("handles keys with special characters and underscores", () => {
      scopedGithubWritter({
        _CUSTOM_KEY_123: "value",
        "PREFIXED-KEY": "custom",
      });

      const expectedPayload =
        "_CUSTOM_KEY_123=value\n" + "PREFIXED-KEY=custom\n";

      expect(appendFileSyncSpy).toHaveBeenCalledWith(
        MOCK_ENV_PATH,
        expectedPayload,
        "utf8",
      );
    });

    it("allows sequential invocations without crashing or overwriting prior state", () => {
      scopedGithubWritter({ STEP_ONE: "complete" });
      scopedGithubWritter({ STEP_TWO: "in_progress", PERCENTAGE: 50 });

      expect(appendFileSyncSpy).toHaveBeenCalledTimes(2);
      expect(appendFileSyncSpy).toHaveBeenNthCalledWith(
        1,
        MOCK_ENV_PATH,
        "STEP_ONE=complete\n",
        "utf8",
      );
      expect(appendFileSyncSpy).toHaveBeenNthCalledWith(
        2,
        MOCK_ENV_PATH,
        "STEP_TWO=in_progress\nPERCENTAGE=50\n",
        "utf8",
      );
    });
  });
});
