"use client";

import { createRegion } from "./create-region";

export const Section = createRegion<HTMLElement>("section");
export const Article = createRegion<HTMLElement>("article");
export const Header = createRegion<HTMLElement>("header");
export const Aside = createRegion<HTMLElement>("aside");
export const Legend = createRegion<HTMLLegendElement>("legend");
