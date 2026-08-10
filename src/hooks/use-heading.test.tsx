// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { HeadingLevel } from "../types";
import { HeadingCtx, useHeading } from "./use-heading";

describe("useHeading", () => {
  // Helper to wrap renderHook with a custom HeadingCtx provider value
  function renderUseHeading(providerValue?: HeadingLevel, hasH1?: boolean) {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      providerValue !== undefined ? (
        <HeadingCtx.Provider value={providerValue}>
          {children}
        </HeadingCtx.Provider>
      ) : (
        <>{children}</>
      );

    return renderHook(() => useHeading(hasH1), { wrapper });
  }

  // ==========================================
  // 1. DEFAULT CONTEXT (UNWRAPPED / ROOT)
  // ==========================================
  describe("default context behavior (level = 0)", () => {
    it("returns 1 (H2) when no Provider is present and hasH1 defaults to true", () => {
      const { result } = renderUseHeading();
      expect(result.current).toBe(1);
    });

    it("returns 1 (H2) when no Provider is present and hasH1 is explicitly true", () => {
      const { result } = renderUseHeading(undefined, true);
      expect(result.current).toBe(1);
    });

    it("returns 0 (H1) when no Provider is present and hasH1 is false", () => {
      const { result } = renderUseHeading(undefined, false);
      expect(result.current).toBe(0);
    });
  });

  // ==========================================
  // 2. EXPLICIT PROVIDER AT ROOT LEVEL (0)
  // ==========================================
  describe("explicit context provider at root level (0)", () => {
    it("returns 1 (H2) when HeadingCtx is 0 and hasH1 is true", () => {
      const { result } = renderUseHeading(0, true);
      expect(result.current).toBe(1);
    });

    it("returns 0 (H1) when HeadingCtx is 0 and hasH1 is false", () => {
      const { result } = renderUseHeading(0, false);
      expect(result.current).toBe(0);
    });
  });

  // ==========================================
  // 3. DEEPER CONTEXT LEVELS (1 TO 4)
  // ==========================================
  describe("deeper context levels (level > 0)", () => {
    it.each<[HeadingLevel, HeadingLevel]>([
      [1, 2], // H2 -> H3
      [2, 3], // H3 -> H4
      [3, 4], // H4 -> H5
      [4, 5], // H5 -> H6
    ])(
      "increments context level %i to %i when hasH1 is true",
      (providerLevel, expectedLevel) => {
        const { result } = renderUseHeading(providerLevel, true);
        expect(result.current).toBe(expectedLevel);
      },
    );

    it.each<[HeadingLevel, HeadingLevel]>([
      [1, 2], // H2 -> H3
      [2, 3], // H3 -> H4
      [3, 4], // H4 -> H5
      [4, 5], // H5 -> H6
    ])(
      "increments context level %i to %i even when hasH1 is false (hasH1 is ignored for level > 0)",
      (providerLevel, expectedLevel) => {
        const { result } = renderUseHeading(providerLevel, false);
        expect(result.current).toBe(expectedLevel);
      },
    );
  });

  // ==========================================
  // 4. UPPER BOUNDARY CAPPING (LEVEL = 5 / H6)
  // ==========================================
  describe("upper boundary capping at level 5 (H6)", () => {
    it("caps at 5 (H6) when context level is 5 and hasH1 is true", () => {
      const { result } = renderUseHeading(5, true);
      expect(result.current).toBe(5);
    });

    it("caps at 5 (H6) when context level is 5 and hasH1 is false", () => {
      const { result } = renderUseHeading(5, false);
      expect(result.current).toBe(5);
    });
  });

  // ==========================================
  // 5. NESTED CONTEXT PROVIDER HIERARCHY
  // ==========================================
  describe("nested context provider trees", () => {
    it("resolves the closest parent HeadingCtx value in a nested provider tree", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingCtx.Provider value={0}>
          <HeadingCtx.Provider value={2}>{children}</HeadingCtx.Provider>
        </HeadingCtx.Provider>
      );

      const { result } = renderHook(() => useHeading(true), { wrapper });

      // Closest provider value is 2 -> increments to 3
      expect(result.current).toBe(3);
    });
  });
});
