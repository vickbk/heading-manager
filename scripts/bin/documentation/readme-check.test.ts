import { shutConsole } from "@/tests/setup/console";
import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const checkReadmeSpy = vi.fn();
const handleCliSpy = vi.fn();

vi.mock("@vickbk/ci-tools/docs", () => ({
  checkReadmeFiles: checkReadmeSpy,
  handleReadmeCliError: handleCliSpy,
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

  it("should pass handleReadmeCliError to runTask and handle fatal errors correctly", async () => {
    process.argv = [
      "node",
      "/workspace/scripts/bin/documentation/readme-check.ts",
    ];

    const validationError = new Error("README is missing required sections");
    checkReadmeSpy.mockRejectedValue(validationError);
    handleCliSpy.mockReturnValue("MOCK_FORMATTED_ERROR");

    await import("./readme-check");

    expect(handleCliSpy).toHaveBeenCalledWith(validationError);
    expect(console.error).toHaveBeenCalledWith("MOCK_FORMATTED_ERROR");
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
