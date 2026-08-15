import { describe, expect, it } from "vitest";
import { getHeaders } from "./get-headers";

describe("getHeaders", () => {
  const MOCK_TOKEN = "ghp_1234567890abcdefghijklmnopqrstuvwxyz";

  describe("Happy Path & Structure", () => {
    it("should return the correct headers object for a standard GitHub token", () => {
      const headers = getHeaders(MOCK_TOKEN);

      expect(headers).toEqual({
        Authorization: `Bearer ${MOCK_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2026-03-10",
        "Content-Type": "application/json",
      });
    });

    it("should contain exactly the 4 expected header keys in correct order", () => {
      const headers = getHeaders(MOCK_TOKEN);
      const keys = Object.keys(headers);

      expect(keys).toHaveLength(4);
      expect(keys).toEqual([
        "Authorization",
        "Accept",
        "X-GitHub-Api-Version",
        "Content-Type",
      ]);
    });

    it("should set exact fixed GitHub API request headers", () => {
      const headers = getHeaders(MOCK_TOKEN);

      expect(headers["Accept"]).toBe("application/vnd.github+json");
      expect(headers["X-GitHub-Api-Version"]).toBe("2026-03-10");
      expect(headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("Token Format Edge Cases", () => {
    it("should correctly handle an empty string token", () => {
      const headers = getHeaders("");
      expect(headers.Authorization).toBe("Bearer ");
    });

    it("should preserve leading and trailing whitespace inside the token string", () => {
      const whitespaceToken = "  ghp_padded_token_1234  ";
      const headers = getHeaders(whitespaceToken);
      expect(headers.Authorization).toBe("Bearer   ghp_padded_token_1234  ");
    });

    it("should format fine-grained Personal Access Tokens (github_pat_*) correctly", () => {
      const fineGrainedPat = "github_pat_11AAAAAAA000000000000000000000000000";
      const headers = getHeaders(fineGrainedPat);
      expect(headers.Authorization).toBe(`Bearer ${fineGrainedPat}`);
    });

    it("should handle tokens containing special characters, symbols, and unicode", () => {
      const specialCharToken = "token_with_!@#$%^&*()_+-=[]{}|;:,.<>?/~`_🔑";
      const headers = getHeaders(specialCharToken);
      expect(headers.Authorization).toBe(`Bearer ${specialCharToken}`);
    });
  });

  describe("Purity & Object Reference Isolation", () => {
    it("should return a new object instance on every invocation", () => {
      const headers1 = getHeaders(MOCK_TOKEN);
      const headers2 = getHeaders(MOCK_TOKEN);

      expect(headers1).toEqual(headers2);
      expect(headers1).not.toBe(headers2);
    });

    it("should remain pure and unaffected by mutations on previously returned header objects", () => {
      const headers1 = getHeaders(MOCK_TOKEN);
      headers1.Authorization = "Bearer MODIFIED_TOKEN";
      delete (headers1 as Partial<typeof headers1>)["Content-Type"];

      const headers2 = getHeaders(MOCK_TOKEN);
      expect(headers2.Authorization).toBe(`Bearer ${MOCK_TOKEN}`);
      expect(headers2["Content-Type"]).toBe("application/json");
    });
  });
});
