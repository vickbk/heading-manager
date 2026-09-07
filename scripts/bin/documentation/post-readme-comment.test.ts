import path from "node:path";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { shutConsole } from "@/tests/setup/console";

const postReadmeSpy = vi.fn();

vi.mock("@vickbk/ci-tools/docs", () => {
  return {
    postReadmeComment: postReadmeSpy,
  };
});

describe("postReadmeComment Runner Entrypoint", () => {
  const originalArgv = process.argv;

  beforeEach(async () => {
    vi.resetModules();
    vi.resetAllMocks();

    shutConsole();

    process.argv = [...originalArgv];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  describe("Integration Behavior (with unmocked runTask)", () => {
    beforeEach(async () => {
      vi.spyOn(process, "exit").mockImplementation((() => {}) as never);
    });

    it("should execute postReadmeComment when process.argv[1] matches script name", async () => {
      process.argv[1] = path.join("/project/scripts", "post-readme-comment.ts");
      postReadmeSpy.mockResolvedValue({} as never);

      await import("./post-readme-comment");

      expect(postReadmeSpy).toHaveBeenCalledTimes(1);
      expect(process.exit).not.toHaveBeenCalled();
    });

    it("should skip postReadmeComment when process.argv[1] does not match script name", async () => {
      process.argv[1] = path.join("/project/scripts", "other-script.ts");

      await import("./post-readme-comment");

      expect(postReadmeSpy).not.toHaveBeenCalled();
      expect(process.exit).not.toHaveBeenCalled();
    });

    it("should catch postReadmeComment error, log custom prefix, and terminate process", async () => {
      process.argv[1] = path.join("/project/scripts", "post-readme-comment.ts");
      const taskError = new Error("GitHub API Auth Failed");
      postReadmeSpy.mockRejectedValue(taskError);

      await import("./post-readme-comment");

      expect(postReadmeSpy).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith(
        "❌ [Readme Reporter] Fatal Error: GitHub API Auth Failed",
      );
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});
