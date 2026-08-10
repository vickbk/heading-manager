"use client";

import { HTMLAttributes, forwardRef } from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";

export const Main = forwardRef<
  HTMLElement,
  { pageHasH1?: boolean } & HTMLAttributes<HTMLElement>
>(({ pageHasH1 = true, children, ...props }, ref) => {
  const level = useHeading(pageHasH1);
  return (
    <main {...props} ref={ref}>
      <HeadingCtx.Provider value={level}>{children}</HeadingCtx.Provider>
    </main>
  );
});
Main.displayName = "Main";
