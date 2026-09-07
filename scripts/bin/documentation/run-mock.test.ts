import { documentationContract } from "@/docs/documentation-contract";
import { shutConsole } from "@/tests/setup/console";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const runTaskSpy = vi.fn();
const checkReadmeSpy = vi.fn();
const handleCliSpy = vi.fn();
const postReadmeSpy = vi.fn();

vi.mock("@vickbk/ci-tools/docs", () => ({
  checkReadmeFiles: checkReadmeSpy,
  handleReadmeCliError: handleCliSpy,
  postReadmeComment: postReadmeSpy,
}));

vi.mock("@vickbk/ci-tools/core", async (original) => {
  const actual = await original<typeof import("@vickbk/ci-tools/core")>();

  runTaskSpy.mockImplementation(actual.runTask);
  return {
    runTask: runTaskSpy,
  };
});

describe("bin/documentation/readme-check entrypoint", () => {
  const originalArgv = [...process.argv];

  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
    process.argv = [...originalArgv];
    shutConsole();
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  });

  afterEach(() => {
    process.argv = [...originalArgv];
  });

  it("should run the README validation task when the script matches the entrypoint", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];
    checkReadmeSpy.mockResolvedValue([]);

    await import("./readme-check");

    expect(checkReadmeSpy).toHaveBeenCalledTimes(1);
    expect(checkReadmeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        "./README.md": documentationContract,
      }),
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should skip README validation when the entrypoint does not match", async () => {
    process.argv = ["node", "/workspace/scripts/bin/other-script.ts"];

    await import("./readme-check");

    expect(checkReadmeSpy).not.toHaveBeenCalled();
  });

  it("should pass 'readme-check' as the task name to runTask", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];
    checkReadmeSpy.mockResolvedValue([]);

    await import("./readme-check");

    expect(runTaskSpy).toHaveBeenCalledWith(
      "readme-check",
      expect.any(Function),
      handleCliSpy,
    );
  });
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

  describe("Script Contract & Invocations", () => {
    it("should pass the correct script identifier, task, and error prefix to runTask", async () => {
      await import("./post-readme-comment");

      expect(runTaskSpy).toHaveBeenCalledTimes(1);
      expect(runTaskSpy).toHaveBeenCalledWith(
        "post-readme-comment",
        postReadmeSpy,
        "❌ [Readme Reporter] Fatal Error",
      );
    });

    it("should execute top-level await cleanly when runTask resolves", async () => {
      vi.mocked(runTaskSpy).mockResolvedValue(undefined);

      await expect(import("./post-readme-comment")).resolves.not.toThrow();
    });

    it("should bubble up rejections if runTask throws an unhandled error", async () => {
      const runnerError = new Error("Unexpected top-level crash");
      vi.mocked(runTaskSpy).mockRejectedValue(runnerError);

      await expect(import("./post-readme-comment")).rejects.toThrow(
        runnerError,
      );
    });
  });
});
