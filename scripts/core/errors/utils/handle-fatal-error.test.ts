import process from "node:process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleFatalError } from "./handle-fatal-error";

describe("handleFatalError", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Intercept console.error to prevent pollution during test runs
    consoleErrorSpy = console.error;

    // Prevent process.exit from terminating the test runner node process
    processExitSpy = vi
      .spyOn(process, "exit")
      .mockImplementation((() => {}) as (
        code?: number | string | null,
      ) => never);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Default Parameters & Core Behavior", () => {
    it("should log formatted error with default prefix and exit with code 1", () => {
      const error = new Error("Database connection failed");

      handleFatalError(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Fatal Error: Database connection failed",
      );

      expect(processExitSpy).toHaveBeenCalledTimes(1);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should handle raw string errors with default parameters", () => {
      handleFatalError("Invalid configuration file");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Fatal Error: Invalid configuration file",
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("Custom String Prefixes", () => {
    it("should prepend custom string prefix to the normalized error message", () => {
      handleFatalError(
        new Error("File not found"),
        "[Coverage Runner] Fatal Error",
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Coverage Runner] Fatal Error: File not found",
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should handle empty string as a prefix", () => {
      handleFatalError(new Error("Permission denied"), "");

      expect(consoleErrorSpy).toHaveBeenCalledWith(": Permission denied");
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should handle multiline string error messages with a custom prefix", () => {
      const multilineError = new Error("Line 1\nLine 2\nLine 3");

      handleFatalError(multilineError, "[Deploy Pipeline]");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Deploy Pipeline]: Line 1\nLine 2\nLine 3",
      );
    });
  });

  describe("Custom LogFormatter Function", () => {
    it("should pass normalized message to a custom log formatter function", () => {
      const customFormatter = vi
        .fn()
        .mockImplementation((msg: string) => `❌ [CRITICAL FAILURE] -> ${msg}`);

      handleFatalError(new Error("Disk space full"), customFormatter);

      expect(customFormatter).toHaveBeenCalledTimes(1);
      expect(customFormatter).toHaveBeenCalledWith("Disk space full");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "❌ [CRITICAL FAILURE] -> Disk space full",
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should allow log formatter function to return an empty string", () => {
      handleFatalError(new Error("Silent fatal error"), () => "");

      expect(consoleErrorSpy).toHaveBeenCalledWith("");
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("should fallback gracefully if formatter returns non-string value at runtime", () => {
      // Simulating dynamic untyped JS runtime caller returning a number
      const badFormatter = () => 500 as unknown as string;

      handleFatalError(new Error("Malformed formatter"), badFormatter);

      expect(consoleErrorSpy).toHaveBeenCalledWith(500);
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("Custom Exit Codes", () => {
    it("should accept custom exit code 2", () => {
      handleFatalError(new Error("CLI usage error"), "Usage Error", 2);

      expect(processExitSpy).toHaveBeenCalledWith(2);
    });

    it("should accept exit code 0 if explicitly passed", () => {
      handleFatalError(new Error("Graceful shutdown required"), "Shutdown", 0);

      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it("should forward negative or non-standard exit code numbers", () => {
      handleFatalError(new Error("System signal fault"), "Signal Fault", 127);

      expect(processExitSpy).toHaveBeenCalledWith(127);
    });
  });

  describe("Integration with getErrorMessage (Various Error Types)", () => {
    it("should format plain objects with message property", () => {
      const plainObjError = { message: "Unauthorized token", code: 401 };

      handleFatalError(plainObjError, "[Auth Error]");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Auth Error]: Unauthorized token",
      );
    });

    it("should format serialized JSON for objects lacking message property", () => {
      const objError = { status: 500, detail: "Internal Server Error" };

      handleFatalError(objError, "[API Error]");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[API Error]: {"status":500,"detail":"Internal Server Error"}',
      );
    });

    it("should format null and undefined errors without throwing", () => {
      handleFatalError(null, "[Null Error]");
      expect(consoleErrorSpy).toHaveBeenCalledWith("[Null Error]: null");

      handleFatalError(undefined, "[Undefined Error]");
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Undefined Error]: undefined",
      );
    });

    it("should format circular reference objects without throwing", () => {
      const circularObj: Record<string, unknown> = { key: "value" };
      circularObj.self = circularObj;

      handleFatalError(circularObj, "[Circular Error]");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Circular Error]: [object Object]",
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe("Edge Cases & Exceptional Failure Modes", () => {
    it("should still call process.exit(1) if log formatter function throws an error", () => {
      const throwingFormatter = () => {
        throw new Error("Formatter crashed");
      };

      expect(() => {
        handleFatalError(new Error("Initial error"), throwingFormatter);
      }).toThrow("Formatter crashed");

      // Even if formatter throws prior to console.error, test verifies throw location
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    it("should execute console.error and process.exit strictly in sequence", () => {
      const executionOrder: string[] = [];

      consoleErrorSpy.mockImplementation(() => {
        executionOrder.push("console.error");
      });

      processExitSpy.mockImplementation(() => {
        executionOrder.push("process.exit");
        return undefined as never;
      });

      handleFatalError(new Error("Sequence test"));

      expect(executionOrder).toEqual(["console.error", "process.exit"]);
    });
  });
});
