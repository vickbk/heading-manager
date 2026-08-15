import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReleaseType } from "./release-type";
import * as versionTagModule from "./version-tag";

describe("getReleaseType", () => {
  const mockResolveVersionTag = vi.spyOn(versionTagModule, "resolveVersionTag");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Stable Releases", () => {
    it.each([
      { input: "1.0.0", normalized: "1.0.0" },
      { input: "v0.2.0", normalized: "0.2.0" },
      { input: "v2.15.4", normalized: "2.15.4" },
    ])(
      "identifies stable version '$input' as IS_PRERELEASE = false with 'latest' tag",
      ({ input, normalized }) => {
        const result = getReleaseType(input);

        expect(mockResolveVersionTag).toHaveBeenCalledWith(input);
        expect(result).toEqual({
          normalized,
          version: normalized,
          IS_PRERELEASE: false,
          releaseTag: "latest",
        });
      },
    );
  });

  describe("Standard Prereleases", () => {
    it.each([
      {
        input: "v0.2.0-beta.2",
        normalized: "0.2.0-beta.2",
        expectedVersion: "0.2.0",
        expectedReleaseTag: "beta",
      },
      {
        input: "0.2.0-beta.1",
        normalized: "0.2.0-beta.1",
        expectedVersion: "0.2.0",
        expectedReleaseTag: "beta",
      },
      {
        input: "v1.0.0-rc.1",
        normalized: "1.0.0-rc.1",
        expectedVersion: "1.0.0",
        expectedReleaseTag: "rc",
      },
      {
        input: "v2.0.0-alpha.10",
        normalized: "2.0.0-alpha.10",
        expectedVersion: "2.0.0",
        expectedReleaseTag: "alpha",
      },
    ])(
      "correctly extracts releaseTag '$expectedReleaseTag' and version '$expectedVersion' from '$input'",
      ({ input, normalized, expectedVersion, expectedReleaseTag }) => {
        const result = getReleaseType(input);

        expect(result).toEqual({
          normalized,
          version: expectedVersion,
          IS_PRERELEASE: true,
          releaseTag: expectedReleaseTag,
        });
      },
    );
  });

  describe("Prereleases without Numeric Suffix Dots", () => {
    it.each([
      {
        input: "v0.1.0-canary",
        normalized: "0.1.0-canary",
        expectedVersion: "0.1.0",
        expectedReleaseTag: "canary",
      },
      {
        input: "1.0.0-next",
        normalized: "1.0.0-next",
        expectedVersion: "1.0.0",
        expectedReleaseTag: "next",
      },
      {
        input: "2.0.0-dev",
        normalized: "2.0.0-dev",
        expectedVersion: "2.0.0",
        expectedReleaseTag: "dev",
      },
      {
        input: "2.0.0-beta.1-patch",
        normalized: "2.0.0-beta.1-patch",
        expectedVersion: "2.0.0",
        expectedReleaseTag: "beta",
      },
    ])(
      "handles tags without trailing dot notation like '$input'",
      ({ input, normalized, expectedVersion, expectedReleaseTag }) => {
        const result = getReleaseType(input);

        expect(result).toEqual({
          normalized,
          version: expectedVersion,
          IS_PRERELEASE: true,
          releaseTag: expectedReleaseTag,
        });
      },
    );
  });

  describe("Edge Cases & Complex Version Formats", () => {
    it("handles multiple hyphens in prerelease string correctly", () => {
      const result = getReleaseType("v1.0.0-beta-patch.1");

      expect(result).toEqual({
        normalized: "1.0.0-beta-patch.1",
        version: "1.0.0",
        IS_PRERELEASE: true,
        releaseTag: "beta-patch",
      });
    });

    it("handles multiple dot segments in prerelease metadata", () => {
      const result = getReleaseType("1.0.0-beta.1.2");

      expect(result).toEqual({
        normalized: "1.0.0-beta.1.2",
        version: "1.0.0",
        IS_PRERELEASE: true,
        releaseTag: "beta",
      });
    });

    it("handles major version zero with prerelease tag", () => {
      const result = getReleaseType("0.0.1-alpha.0");

      expect(result).toEqual({
        normalized: "0.0.1-alpha.0",
        version: "0.0.1",
        IS_PRERELEASE: true,
        releaseTag: "alpha",
      });
    });

    it("falls back to 'latest' if raw prerelease resolves to an empty string", () => {
      const result = getReleaseType("1.0.0-");

      expect(result).toEqual({
        normalized: "1.0.0-",
        version: "1.0.0",
        IS_PRERELEASE: true,
        releaseTag: "latest",
      });
    });
  });
});
