import path from "node:path";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { shutConsole } from "@/tests/setup/console";

describe("postReadmeComment Runner Entrypoint", () => {
  const originalArgv = process.argv;

  let docsModule: typeof import("@/scripts/features/docs");
  let errorModule: typeof import("@/scripts/core/errors");

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    shutConsole();

    process.argv = [...originalArgv];

    docsModule = await import("@/scripts/features/docs");
    errorModule = await import("@/scripts/core/errors");
    vi.spyOn(docsModule, "postReadmeComment");
    vi.spyOn(errorModule, "runTask");
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("Script Contract & Invocations", () => {
    it("should pass the correct script identifier, task, and error prefix to runTask", async () => {
      await import("./post-readme-comment");

      expect(errorModule.runTask).toHaveBeenCalledTimes(1);
      expect(errorModule.runTask).toHaveBeenCalledWith(
        "post-readme-comment",
        docsModule.postReadmeComment,
        "❌ [Readme Reporter] Fatal Error",
      );
    });

    it("should execute top-level await cleanly when runTask resolves", async () => {
      vi.mocked(errorModule.runTask).mockResolvedValue(undefined);

      await expect(import("./post-readme-comment")).resolves.not.toThrow();
    });

    it("should bubble up rejections if runTask throws an unhandled error", async () => {
      const runnerError = new Error("Unexpected top-level crash");
      vi.mocked(errorModule.runTask).mockRejectedValue(runnerError);

      await expect(import("./post-readme-comment")).rejects.toThrow(
        runnerError,
      );
    });
  });

  describe("Integration Behavior (with unmocked runTask)", () => {
    beforeEach(async () => {
      vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
      vi.spyOn(errorModule, "runTask").mockReset();
    });

    it("should execute postReadmeComment when process.argv[1] matches script name", async () => {
      process.argv[1] = path.join("/project/scripts", "post-readme-comment.ts");
      vi.spyOn(docsModule, "postReadmeComment").mockResolvedValue({} as never);

      await import("./post-readme-comment");

      expect(docsModule.postReadmeComment).toHaveBeenCalledTimes(1);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it("should skip postReadmeComment when process.argv[1] does not match script name", async () => {
      process.argv[1] = path.join("/project/scripts", "other-script.ts");

      await import("./post-readme-comment");

      expect(docsModule.postReadmeComment).not.toHaveBeenCalled();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it("should catch postReadmeComment error, log custom prefix, and terminate process", async () => {
      process.argv[1] = path.join("/project/scripts", "post-readme-comment.ts");
      const taskError = new Error("GitHub API Auth Failed");
      vi.spyOn(docsModule, "postReadmeComment").mockRejectedValue(taskError);

      await import("./post-readme-comment");

      expect(docsModule.postReadmeComment).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "❌ [Readme Reporter] Fatal Error: GitHub API Auth Failed",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
