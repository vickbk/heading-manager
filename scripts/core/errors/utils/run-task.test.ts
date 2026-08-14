import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as handleFatalErrorModule from "./handle-fatal-error";
import { runTask } from "./run-task";

describe("runTask CLI Entrypoint Guard", () => {
  const originalArgv = [...process.argv];

  beforeEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  describe("Entrypoint Guard Matching (process.argv[1])", () => {
    it("should execute task when process.argv[1] contains the scriptName selector", async () => {
      process.argv = ["node", "/workspace/scripts/bin/extract-version-tag.ts"];

      const taskSpy = vi.fn().mockReturnValue("task_completed");

      const result = await runTask("extract-version-tag", taskSpy);

      expect(taskSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe("task_completed");
    });

    it("should skip execution and return undefined when process.argv[1] does NOT match scriptName", async () => {
      process.argv = ["node", "/workspace/scripts/bin/other-script.ts"];

      const taskSpy = vi.fn();

      const result = await runTask("extract-version-tag", taskSpy);

      expect(taskSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should skip execution when process.argv[1] is undefined", async () => {
      process.argv = ["node"]; // process.argv[1] is undefined

      const taskSpy = vi.fn();

      const result = await runTask("extract-version-tag", taskSpy);

      expect(taskSpy).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("should match partial path substrings or file extensions correctly", async () => {
      process.argv = ["node", "/dist/bin/extract-version-tag.js"];

      const taskSpy = vi.fn().mockReturnValue(true);

      const result = await runTask("extract-version-tag", taskSpy);

      expect(taskSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  });

  describe("Sync and Async Callback Support", () => {
    it("should handle sync tasks correctly", async () => {
      process.argv = ["node", "extract-version-tag.js"];

      const syncTask = () => "sync_result";

      const result = await runTask("extract-version-tag", syncTask);
      expect(result).toBe("sync_result");
    });

    it("should await promise returned by async tasks", async () => {
      process.argv = ["node", "extract-version-tag.js"];

      const asyncTask = async () => {
        return new Promise((resolve) =>
          setTimeout(() => resolve("async_result"), 5),
        );
      };

      const result = await runTask("extract-version-tag", asyncTask);
      expect(result).toBe("async_result");
    });
  });

  describe("Error Delegation to handleFatalError", () => {
    it("should catch sync thrown errors and delegate to handleFatalError with default prefix", async () => {
      process.argv = ["node", "extract-version-tag.ts"];

      const fatalSpy = vi
        .spyOn(handleFatalErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      const error = new Error("File not found");
      const throwingTask = () => {
        throw error;
      };

      await runTask("extract-version-tag", throwingTask);

      expect(fatalSpy).toHaveBeenCalledTimes(1);
      expect(fatalSpy).toHaveBeenCalledWith(
        error,
        "❌ [extract-version-tag] Fatal Error",
      );
    });

    it("should catch async promise rejections and delegate to handleFatalError", async () => {
      process.argv = ["node", "extract-version-tag.ts"];

      const fatalSpy = vi
        .spyOn(handleFatalErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      const rejectionError = new Error("Async network failure");
      const asyncThrowingTask = async () => {
        throw rejectionError;
      };

      await runTask("extract-version-tag", asyncThrowingTask);

      expect(fatalSpy).toHaveBeenCalledTimes(1);
      expect(fatalSpy).toHaveBeenCalledWith(
        rejectionError,
        "❌ [extract-version-tag] Fatal Error",
      );
    });

    it("should respect custom string error prefix passed to runTask", async () => {
      process.argv = ["node", "extract-version-tag.ts"];

      const fatalSpy = vi
        .spyOn(handleFatalErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      const error = new Error("Custom error message");

      await runTask(
        "extract-version-tag",
        () => {
          throw error;
        },
        "[VERSION TAG ERROR]",
      );

      expect(fatalSpy).toHaveBeenCalledWith(error, "[VERSION TAG ERROR]");
    });

    it("should respect custom formatter functions passed as errorPrefix", async () => {
      process.argv = ["node", "extract-version-tag.ts"];

      const fatalSpy = vi
        .spyOn(handleFatalErrorModule, "handleFatalError")
        .mockImplementation((() => {}) as never);

      const error = new Error("Changelog missing");
      const customFormatter = (msg: string) => `❌ ${msg}`;

      await runTask(
        "extract-version-tag",
        () => {
          throw error;
        },
        customFormatter,
      );

      expect(fatalSpy).toHaveBeenCalledWith(error, customFormatter);
    });
  });
});
