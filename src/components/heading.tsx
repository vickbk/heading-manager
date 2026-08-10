"use client";

import { forwardRef, useContext, type HTMLAttributes } from "react";
import { HeadingCtx } from "../hooks/use-heading";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

export const Heading = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => {
  const level = useContext(HeadingCtx);

  const Tag = HEADING_TAGS[level] ?? "h6";

  return (
    <Tag {...props} ref={ref}>
      {children}
    </Tag>
  );
});
Heading.displayName = "Heading";
