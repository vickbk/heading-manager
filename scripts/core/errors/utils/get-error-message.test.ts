import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./get-error-message";

describe("getErrorMessage", () => {
  describe("Error Instances & Subclasses", () => {
    it("should extract message from standard Error instances", () => {
      const error = new Error("Something went wrong");
      expect(getErrorMessage(error)).toBe("Something went wrong");
    });

    it("should handle native Error subclasses (TypeError, RangeError, SyntaxError)", () => {
      expect(getErrorMessage(new TypeError("Invalid argument type"))).toBe(
        "Invalid argument type",
      );
      expect(getErrorMessage(new RangeError("Value out of bounds"))).toBe(
        "Value out of bounds",
      );
      expect(getErrorMessage(new SyntaxError("Unexpected token"))).toBe(
        "Unexpected token",
      );
    });

    it("should handle custom Error subclasses", () => {
      class CustomAppError extends Error {
        public code: number;
        constructor(message: string, code: number) {
          super(message);
          this.name = "CustomAppError";
          this.code = code;
        }
      }

      const error = new CustomAppError("Unauthorized access", 401);
      expect(getErrorMessage(error)).toBe("Unauthorized access");
    });

    it("should handle Error instances with empty string messages", () => {
      const error = new Error("");
      expect(getErrorMessage(error)).toBe("");
    });
  });

  describe("Plain Objects with String Message Property", () => {
    it("should extract message from plain objects with a string message property", () => {
      const errorObj = { message: "API connection timeout", status: 504 };
      expect(getErrorMessage(errorObj)).toBe("API connection timeout");
    });

    it("should handle objects created with getters for message", () => {
      const errorObj = {
        get message() {
          return "Dynamic error message";
        },
      };
      expect(getErrorMessage(errorObj)).toBe("Dynamic error message");
    });

    it("should extract inherited message property from object prototype", () => {
      const proto = { message: "Inherited error message" };
      const errorObj = Object.create(proto);

      expect(getErrorMessage(errorObj)).toBe("Inherited error message");
    });
  });

  describe("Plain Objects without String Message Property", () => {
    it("should JSON stringify objects without a message property", () => {
      const errorObj = { code: "ERR_NETWORK", statusCode: 500 };
      expect(getErrorMessage(errorObj)).toBe(
        '{"code":"ERR_NETWORK","statusCode":500}',
      );
    });

    it("should JSON stringify objects where message is NOT a string", () => {
      const errorWithNumMessage = { message: 404, detail: "Not found" };
      expect(getErrorMessage(errorWithNumMessage)).toBe(
        '{"message":404,"detail":"Not found"}',
      );

      const errorWithNullMessage = { message: null };
      expect(getErrorMessage(errorWithNullMessage)).toBe('{"message":null}');
    });

    it("should serialize arrays into JSON strings", () => {
      const errorArray = ["Error 1", "Error 2"];
      expect(getErrorMessage(errorArray)).toBe('["Error 1","Error 2"]');
    });

    it("should return empty object representation for empty objects", () => {
      expect(getErrorMessage({})).toBe("{}");
    });
  });

  describe("Circular References & Unserializable Objects", () => {
    it("should fall back to String(error) when JSON.stringify throws on circular references", () => {
      const circularObj: Record<string, unknown> = { name: "CircularError" };
      circularObj.self = circularObj;

      expect(getErrorMessage(circularObj)).toBe("[object Object]");
    });

    it("should fall back to String(error) when object contains BigInt (JSON.stringify failure)", () => {
      const errorWithBigInt = { id: 12345678901234567890n };

      expect(getErrorMessage(errorWithBigInt)).toBe("[object Object]");
    });
  });

  describe("Primitives & Non-Object Values", () => {
    it("should handle literal string errors", () => {
      expect(getErrorMessage("Direct string error")).toBe(
        "Direct string error",
      );
      expect(getErrorMessage("")).toBe("");
    });

    it("should handle numeric errors", () => {
      expect(getErrorMessage(500)).toBe("500");
      expect(getErrorMessage(0)).toBe("0");
      expect(getErrorMessage(-1)).toBe("-1");
      expect(getErrorMessage(NaN)).toBe("NaN");
    });

    it("should handle boolean values", () => {
      expect(getErrorMessage(false)).toBe("false");
      expect(getErrorMessage(true)).toBe("true");
    });

    it("should handle BigInt primitive values", () => {
      expect(getErrorMessage(9007199254740991n)).toBe("9007199254740991");
    });

    it("should handle Symbol primitive values", () => {
      const sym = Symbol("FATAL_ERROR");
      expect(getErrorMessage(sym)).toBe("Symbol(FATAL_ERROR)");
    });

    it("should handle functions thrown as errors", () => {
      const fnError = () => "I am a function";
      expect(getErrorMessage(fnError)).toContain("I am a function");
    });
  });

  describe("Null & Undefined Handling", () => {
    it("should correctly stringify null without throwing type errors", () => {
      expect(getErrorMessage(null)).toBe("null");
    });

    it("should correctly stringify undefined", () => {
      expect(getErrorMessage(undefined)).toBe("undefined");
    });
  });
});
