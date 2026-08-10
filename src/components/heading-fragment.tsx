"use client";

import React from "react";
import { HeadingCtx, useHeading } from "../hooks/use-heading";
import { HeadingLevel } from "../types";

export function HeadingFragment({
  children,
  level,
}: {
  children: React.ReactNode;
  level?: HeadingLevel;
}) {
  const computedNextLevel = useHeading();

  return (
    <HeadingCtx.Provider value={level ?? computedNextLevel}>
      {children}
    </HeadingCtx.Provider>
  );
}

HeadingFragment.displayName = "HeadingFragment";
