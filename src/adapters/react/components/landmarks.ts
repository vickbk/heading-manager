"use client";

import { createRegion } from "./create-region";

/**
 * `<section>` HTML sectioning region wrapper.
 *
 * Provides a nested `HeadingLevelCtx` to descendants, automatically advancing
 * the normalized heading level for nested `<Heading>` components.
 *
 * @param props - Standard `<section>` attributes plus the optional `h6Clamp`
 *   heading-level policy.
 * @param props.h6Clamp - Overrides the inherited H6 clamping policy.
 *   When omitted, the parent context policy is inherited.
 * @param ref - Forwarded ref attached to the underlying `<section>` element.
 *
 * @example
 * ```tsx
 * <Section h6Clamp={false}>
 *   <Heading>Section Heading</Heading>
 * </Section>
 * ```
 *
 * @a11y Maps to the semantic HTML `<section>` element and establishes a
 * scoped heading hierarchy for accessibility-oriented document structure.
 */
export const Section = createRegion<HTMLElement>("section");

/**
 * `<article>` HTML self-contained content region wrapper.
 *
 * Provides a nested `HeadingLevelCtx` to descendants, automatically advancing
 * the normalized heading level for nested `<Heading>` components.
 *
 * @param props - Standard `<article>` attributes plus the optional `h6Clamp`
 *   heading-level policy.
 * @param props.h6Clamp - Overrides the inherited H6 clamping policy.
 *   When omitted, the parent context policy is inherited.
 * @param ref - Forwarded ref attached to the underlying `<article>` element.
 *
 * @example
 * ```tsx
 * <Article h6Clamp>
 *   <Heading>Article Title</Heading>
 * </Article>
 * ```
 *
 * @a11y Maps to the semantic HTML `<article>` element and establishes a
 * scoped heading hierarchy for self-contained content.
 */
export const Article = createRegion<HTMLElement>("article");

/**
 * `<header>` introductory content region wrapper.
 *
 * Provides a nested `HeadingLevelCtx` to descendants, automatically advancing
 * the normalized heading level for nested `<Heading>` components.
 *
 * @param props - Standard `<header>` attributes plus the optional `h6Clamp`
 *   heading-level policy.
 * @param props.h6Clamp - Overrides the inherited H6 clamping policy.
 *   When omitted, the parent context policy is inherited.
 * @param ref - Forwarded ref attached to the underlying `<header>` element.
 *
 * @example
 * ```tsx
 * <Header>
 *   <Heading>Header Title</Heading>
 * </Header>
 * ```
 *
 * @a11y Maps to the semantic HTML `<header>` element for introductory or
 * navigational content.
 */
export const Header = createRegion<HTMLElement>("header");

/**
 * `<aside>` complementary content region wrapper.
 *
 * Provides a nested `HeadingLevelCtx` to descendants, automatically advancing
 * the normalized heading level for nested `<Heading>` components.
 *
 * @param props - Standard `<aside>` attributes plus the optional `h6Clamp`
 *   heading-level policy.
 * @param props.h6Clamp - Overrides the inherited H6 clamping policy.
 *   When omitted, the parent context policy is inherited.
 * @param ref - Forwarded ref attached to the underlying `<aside>` element.
 *
 * @example
 * ```tsx
 * <Aside h6Clamp={false}>
 *   <Heading>Related Content</Heading>
 * </Aside>
 * ```
 *
 * @a11y Maps to the semantic HTML `<aside>` element for complementary
 * content.
 */
export const Aside = createRegion<HTMLElement>("aside");

/**
 * `<legend>` fieldset caption wrapper.
 *
 * Provides a nested `HeadingLevelCtx` to descendants, automatically advancing
 * the normalized heading level for nested `<Heading>` components.
 *
 * @param props - Standard `<legend>` attributes plus the optional `h6Clamp`
 *   heading-level policy.
 * @param props.h6Clamp - Overrides the inherited H6 clamping policy.
 *   When omitted, the parent context policy is inherited.
 * @param ref - Forwarded ref attached to the underlying `<legend>` element.
 *
 * @remarks
 * Should be used within a `<fieldset>` to provide its programmatic caption.
 * A `<legend>` should not be used as a general-purpose landmark wrapper.
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
 * @a11y Maps to the semantic HTML `<legend>` element for providing a
 * programmatic caption for a form-control group.
 */
export const Legend = createRegion<HTMLLegendElement>("legend");
