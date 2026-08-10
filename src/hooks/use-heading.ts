"use client";

import { createContext, useContext } from "react";
import type { HeadingLevel } from "../types";
import { calculateNextHeadingLevel } from "../utils/heading-level";

export const HeadingCtx = createContext<HeadingLevel>(0);

export function useHeading(hasH1 = true) {
  const level = useContext(HeadingCtx);
  return calculateNextHeadingLevel(level, hasH1);
}
