"use client";

import { createRegion } from "./create-region";

/**
 * `<section>` HTML landmark region wrapper component.
 *
 * @param props - Standard HTML attributes for the `<section>` element.
 * @param ref - Forwarded ref attached to the underlying `<section>` DOM element.
 * @returns Context-providing `<section>` landmark element that increments ambient `HeadingCtx`.
 *
 * @remarks
 * **Heading Context Behavior:**
 * Automatically increments ambient `HeadingCtx` by `1` for all descendant components, ensuring
 * child `<Heading>` elements render at the next nested sequential heading level.
 *
 * @example
 * ```tsx
 * <Section>
 *   <Heading>Section Heading</Heading>
 * </Section>
 * ```
 *
 * @a11y Maps to the HTML5 `<section>` element and establishes a scoped landmark region per WCAG 2.1 SC 1.3.1.
 */
export const Section = createRegion<HTMLElement>("section");

/**
 * `<article>` HTML landmark region wrapper component.
 *
 * @param props - Standard HTML attributes for the `<article>` element.
 * @param ref - Forwarded ref attached to the underlying `<article>` DOM element.
 * @returns Context-providing `<article>` landmark element that increments ambient `HeadingCtx`.
 *
 * @remarks
 * **Heading Context Behavior:**
 * Automatically increments ambient `HeadingCtx` by `1` for all descendant components, ensuring
 * child `<Heading>` elements render at the next nested sequential heading level.
 *
 * @example
 * ```tsx
 * <Article>
 *   <Heading>Article Title</Heading>
 * </Article>
 * ```
 *
 * @a11y Maps to the HTML5 `<article>` element representing a self-contained content region per WCAG 2.1 SC 1.3.1.
 */
export const Article = createRegion<HTMLElement>("article");

/**
 * `<header>` HTML landmark region wrapper component.
 *
 * @param props - Standard HTML attributes for the `<header>` element.
 * @param ref - Forwarded ref attached to the underlying `<header>` DOM element.
 * @returns Context-providing `<header>` landmark element that increments ambient `HeadingCtx`.
 *
 * @remarks
 * **Heading Context Behavior:**
 * Automatically increments ambient `HeadingCtx` by `1` for all descendant components, ensuring
 * child `<Heading>` elements render at the next nested sequential heading level.
 *
 * @example
 * ```tsx
 * <Header>
 *   <Heading>Header Title</Heading>
 * </Header>
 * ```
 *
 * @a11y Maps to the HTML5 `<header>` element representing introductory or navigational context per WCAG 2.1 SC 1.3.1.
 */
export const Header = createRegion<HTMLElement>("header");

/**
 * `<aside>` HTML landmark region wrapper component.
 *
 * @param props - Standard HTML attributes for the `<aside>` element.
 * @param ref - Forwarded ref attached to the underlying `<aside>` DOM element.
 * @returns Context-providing `<aside>` landmark element that increments ambient `HeadingCtx`.
 *
 * @remarks
 * **Heading Context Behavior:**
 * Automatically increments ambient `HeadingCtx` by `1` for all descendant components, ensuring
 * child `<Heading>` elements render at the next nested sequential heading level.
 *
 * @example
 * ```tsx
 * <Aside>
 *   <Heading>Sidebar Title</Heading>
 * </Aside>
 * ```
 *
 * @a11y Maps to the HTML5 `<aside>` element representing complementary content regions per WCAG 2.1 SC 1.3.1.
 */
export const Aside = createRegion<HTMLElement>("aside");

/**
 * `<legend>` HTML fieldset caption wrapper component.
 *
 * @param props - Standard HTML attributes for the `<legend>` element.
 * @param ref - Forwarded ref attached to the underlying `<legend>` DOM element.
 * @returns Context-providing `<legend>` element that increments ambient `HeadingCtx`.
 *
 * @remarks
 * **Heading Context Behavior:**
 * Automatically increments ambient `HeadingCtx` by `1` for nested heading components contained
 * within form `<fieldset>` controls.
 *
 * **Precaution:**
 * Should be used only in fieldsets and should not contain other landmarks
 *
 * @example
 * ```tsx
 * <fieldset>
 *   <Legend>
 *     <Heading>Group Title</Heading>
 *   </Legend>
 * </fieldset>
 * ```
 *
 * @a11y Maps to the HTML `<legend>` element providing programmatic captions for form control groups per WCAG 2.1 SC 1.3.1.
 */
export const Legend = createRegion<HTMLLegendElement>("legend");
