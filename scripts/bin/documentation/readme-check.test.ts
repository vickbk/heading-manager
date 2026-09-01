import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { documentationContract } from "@/docs/documentation-contract";
import { shutConsole } from "@/tests/setup/console";

const docsModuleMock = vi.hoisted(() => ({
  checkReadmeFiles: vi.fn(),
}));

vi.mock("@/scripts/features/docs", () => ({
  checkReadmeFiles: docsModuleMock.checkReadmeFiles,
}));

describe("bin/documentation/readme-check entrypoint", () => {
  const originalArgv = [...process.argv];

  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    process.argv = [...originalArgv];
    shutConsole();
    vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    docsModuleMock.checkReadmeFiles.mockReset();
  });

  afterEach(() => {
    process.argv = [...originalArgv];
    vi.restoreAllMocks();
  });

  it("should run the README validation task when the script matches the entrypoint", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];
    docsModuleMock.checkReadmeFiles.mockResolvedValue([]);

    await import("./readme-check");

    expect(docsModuleMock.checkReadmeFiles).toHaveBeenCalledTimes(1);
    expect(docsModuleMock.checkReadmeFiles).toHaveBeenCalledWith({
      path: "./README.md",
      contract: documentationContract,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should skip README validation when the entrypoint does not match", async () => {
    process.argv = ["node", "/workspace/scripts/bin/other-script.ts"];

    await import("./readme-check");

    expect(docsModuleMock.checkReadmeFiles).not.toHaveBeenCalled();
  });

  it("should catch fatal validation errors and keep the default README task prefix", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];

    const validationError = new Error("README is missing required sections");
    docsModuleMock.checkReadmeFiles.mockRejectedValue(validationError);

    await import("./readme-check");

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      "❌ [Readme Check] Fatal Error: README is missing required sections",
    );
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should pass the default README task prefix to runTask for the fatal error boundary", async () => {
    const errorsModule = await import("@/scripts/core/errors");
    const runTaskSpy = vi.spyOn(errorsModule, "runTask");

    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];
    docsModuleMock.checkReadmeFiles.mockResolvedValue([]);

    await import("./readme-check");

    expect(runTaskSpy).toHaveBeenCalledWith(
      "readme-check",
      expect.any(Function),
      "❌ [Readme Check] Fatal Error",
    );
  });
});
