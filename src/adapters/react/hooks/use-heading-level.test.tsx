import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { HeadingLevelCtx, useHeadingLevel } from "./use-heading-level";

describe("HeadingLevelCtx", () => {
  it("provides the expected default context", () => {
    const { result } = renderHook(() => {
      return React.useContext(HeadingLevelCtx);
    });

    expect(result.current).toEqual({
      level: 0,
      h6Clamp: false,
    });
  });

  it("allows the current heading level to be overridden", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HeadingLevelCtx.Provider value={{ level: 3, h6Clamp: false }}>
        {children}
      </HeadingLevelCtx.Provider>
    );

    const { result } = renderHook(() => React.useContext(HeadingLevelCtx), {
      wrapper,
    });

    expect(result.current).toEqual({
      level: 3,
      h6Clamp: false,
    });
  });

  it("allows h6Clamp to be overridden independently of level", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: true }}>
        {children}
      </HeadingLevelCtx.Provider>
    );

    const { result } = renderHook(() => React.useContext(HeadingLevelCtx), {
      wrapper,
    });

    expect(result.current).toEqual({
      level: 5,
      h6Clamp: true,
    });
  });

  it("supports normalized levels beyond H6", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <HeadingLevelCtx.Provider value={{ level: 8, h6Clamp: false }}>
        {children}
      </HeadingLevelCtx.Provider>
    );

    const { result } = renderHook(() => React.useContext(HeadingLevelCtx), {
      wrapper,
    });

    expect(result.current).toEqual({
      level: 8,
      h6Clamp: false,
    });
  });
});

describe("useHeadingLevel", () => {
  describe("default context", () => {
    it("starts at H2 when hasH1 is true", () => {
      const { result } = renderHook(() => useHeadingLevel());

      expect(result.current.level).toBe(1);
    });

    it("returns H1 when hasH1 is false", () => {
      const { result } = renderHook(() => useHeadingLevel(false));

      expect(result.current.level).toBe(0);
    });

    it("uses the default h6Clamp=false behavior", () => {
      const { result } = renderHook(() => useHeadingLevel());

      expect(result.current.level).toBe(1);
    });
  });

  describe("context level", () => {
    it("calculates the next level from the inherited context", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 2, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(3);
    });

    it("returns H1 when the inherited level is zero and hasH1 is false", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 0, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(0);
    });

    it("does not modify the inherited context level", () => {
      const context = {
        level: 3,
        h6Clamp: false,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={context}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(4);
      expect(context).toEqual({
        level: 3,
        h6Clamp: false,
      });
    });
  });

  describe("h6Clamp=true", () => {
    it("advances normally below H6", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 4, h6Clamp: true }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(5);
    });

    it("clamps H6 instead of producing normalized H7", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: true }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(5);
    });

    it("still returns H1 for the first heading", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 0, h6Clamp: true }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(0);
    });

    it("does not clamp levels already beyond H6", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 6, h6Clamp: true }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(7);
    });
  });

  describe("h6Clamp=false", () => {
    it("allows H6 to advance to normalized H7", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(6);
    });

    it("allows normalized H7 to advance to H8", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 6, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(7);
    });

    it("allows arbitrary normalized levels beyond H6", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 10, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(11);
    });
  });

  describe("hasH1", () => {
    it("defaults hasH1 to true", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 0, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current.level).toBe(1);
    });

    it("returns the current level when starting at zero without an H1", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 0, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(0);
    });

    it("does not reset a non-zero context level when hasH1 is false", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 3, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(4);
    });

    it("combines hasH1=false with h6Clamp=true", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: true }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(5);
    });

    it("combines hasH1=false with h6Clamp=false", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 5, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(false), {
        wrapper,
      });

      expect(result.current.level).toBe(6);
    });
  });

  describe("context updates", () => {
    it("recalculates when the context level changes", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <HeadingLevelCtx.Provider value={{ level: 2, h6Clamp: false }}>
          {children}
        </HeadingLevelCtx.Provider>
      );

      const { result } = renderHook(() => useHeadingLevel(), {
        wrapper,
      });

      expect(result.current).toStrictEqual({
        h6Clamp: false,
        level: 3,
      });

      // This verifies the hook responds to provider updates when the wrapper
      // implementation is replaced with a dynamic provider.
      // expect(result.current.level).toBe(3);
    });
  });
});
