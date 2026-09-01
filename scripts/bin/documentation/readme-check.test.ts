import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { documentationContract } from "@/docs/documentation-contract";
import { shutConsole } from "@/tests/setup/console";

const docsModuleMock = vi.hoisted(() => ({
  checkReadmeFiles: vi.fn(),
  handleReadmeCliError: vi.fn(),
}));

vi.mock("@/scripts/features/docs", async () => ({
  checkReadmeFiles: docsModuleMock.checkReadmeFiles,
  handleReadmeCliError: docsModuleMock.handleReadmeCliError,
}));

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
    docsModuleMock.checkReadmeFiles.mockResolvedValue([]);

    await import("./readme-check");

    expect(docsModuleMock.checkReadmeFiles).toHaveBeenCalledTimes(1);
    expect(docsModuleMock.checkReadmeFiles).toHaveBeenCalledWith({
      "./README.md": documentationContract,
    });
    expect(console.error).not.toHaveBeenCalled();
  });

  it("should skip README validation when the entrypoint does not match", async () => {
    process.argv = ["node", "/workspace/scripts/bin/other-script.ts"];

    await import("./readme-check");

    expect(docsModuleMock.checkReadmeFiles).not.toHaveBeenCalled();
  });

  it("should pass handleReadmeCliError to runTask and handle fatal errors correctly", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];

    const validationError = new Error("README is missing required sections");
    docsModuleMock.checkReadmeFiles.mockRejectedValue(validationError);
    docsModuleMock.handleReadmeCliError.mockReturnValue("MOCK_FORMATTED_ERROR");

    await import("./readme-check");

    expect(docsModuleMock.handleReadmeCliError).toHaveBeenCalledWith(
      validationError,
    );
    expect(console.error).toHaveBeenCalledWith("MOCK_FORMATTED_ERROR");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("should pass 'readme-check' as the task name to runTask", async () => {
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
      docsModuleMock.handleReadmeCliError,
    );
  });
});
