import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("post comment coverage Run Task execution", () => {
  const originalArgv = process.argv;
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("Top level execution and basic error handling", () => {
    it("should execute postCoverageComment and handle process.exit(1) on failure when process.argv matches", async () => {
      process.argv = ["node", "/workspace/scripts/bin/post-vitest-coverage.ts"];

      const exitSpy = vi.spyOn(process, "exit").mockImplementation((code?) => {
        return `process.exit: ${code}` as never;
      });

      vi.spyOn(
        await import("@/scripts/features/vitest"),
        "postCoverageComment",
      ).mockImplementation(async () => {
        throw new Error("Missing GITHUB_TOKEN environment variable");
      });

      await import("./post-vitest-coverage");
      expect(exitSpy).toHaveReturnedWith("process.exit: 1");
      expect(exitSpy).toHaveBeenCalledWith(1);

      expect(console.error).toHaveBeenCalledWith(
        "❌ [Coverage Runner] Fatal error: Missing GITHUB_TOKEN environment variable",
      );
    });

    it("should execute postCoverageComment successfully when process.argv matches", async () => {
      process.argv = ["node", "/workspace/scripts/bin/post-vitest-coverage"];

      vi.spyOn(
        await import("@/scripts/features/vitest"),
        "postCoverageComment",
      ).mockImplementation(async () => {});
      vi.spyOn(process, "exit").mockImplementation(() => undefined as never);

      await import("./post-vitest-coverage");

      expect(console.error).not.toHaveBeenCalledWith();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it("should NOT execute postCoverageComment when process.argv does not match", async () => {
      process.argv = ["node", "/workspace/scripts/other-script.ts"];

      const spiedPoster = vi.spyOn(
        await import("@/scripts/features/vitest"),
        "postCoverageComment",
      );

      await import("./post-vitest-coverage");

      expect(spiedPoster).not.toHaveBeenCalled();
    });
  });

  describe("Error Handling & Fatal Exit Edge Cases", () => {
    it("should catch Error instances, print error log, and call process.exit(1)", async () => {
      process.argv = ["node", "/workspace/scripts/bin/post-vitest-coverage.ts"];

      vi.spyOn(
        await import("@/scripts/features/vitest"),
        "postCoverageComment",
      ).mockImplementation(() => {
        throw new Error("Test Error");
      });

      await import("./post-vitest-coverage");

      expect(console.error).toHaveBeenCalledWith(
        "❌ [Coverage Runner] Fatal error: Test Error",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
