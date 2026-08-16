"use client";

import { createRegion } from "./create-region";

/**
 * `<section>` HTML landmark region wrapper component.
 * @description Automatically increments `HeadingCtx` for nested `<Heading>` components.
 * @a11y Maps to HTML5 `<section>` element.
 */
export const Section = createRegion<HTMLElement>("section");

/**
 * `<article>` HTML landmark region wrapper component.
 * @description Automatically increments `HeadingCtx` for nested `<Heading>` components.
 * @a11y Maps to HTML5 `<article>` element.
 */
export const Article = createRegion<HTMLElement>("article");

/**
 * `<header>` HTML landmark region wrapper component.
 * @description Automatically increments `HeadingCtx` for nested `<Heading>` components.
 * @a11y Maps to HTML5 `<header>` element.
 */
export const Header = createRegion<HTMLElement>("header");

/**
 * `<aside>` HTML landmark region wrapper component.
 * @description Automatically increments `HeadingCtx` for nested `<Heading>` components.
 * @a11y Maps to HTML5 `<aside>` element.
 */
export const Aside = createRegion<HTMLElement>("aside");

/**
 * `<legend>` HTML landmark region wrapper component.
 * @description Automatically increments `HeadingCtx` for nested `<Heading>` components inside a `<fieldset>`.
 * @a11y Maps to HTML `<legend>` element.
 */
export const Legend = createRegion<HTMLLegendElement>("legend");
