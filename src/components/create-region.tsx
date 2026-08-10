"use client";

import { forwardRef, HTMLAttributes, JSX } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

// Helper to create landmark region wrappers cleanly without code repetition
export function createRegion<T extends HTMLElement>(
  Tag: keyof JSX.IntrinsicElements,
) {
  const Component = forwardRef<T, HTMLAttributes<T>>(
    ({ children, ...props }, ref) => {
      const level = useHeading();
      // To avoid ts error use a section tag wrapper to clear the legend type mismatch
      const SectionTag = Tag as "section";

      return (
        <SectionTag {...props} ref={ref}>
          <HeadingCtx.Provider value={level}>{children}</HeadingCtx.Provider>
        </SectionTag>
      );
    },
  );
  Component.displayName =
    String(Tag).charAt(0).toUpperCase() + String(Tag).slice(1);
  return Component;
}
