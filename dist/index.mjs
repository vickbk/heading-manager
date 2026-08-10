"use client";
import { createContext, forwardRef, useContext } from "react";
import { jsx } from "react/jsx-runtime";

//#region src/utils/heading-level.ts
/**
* Calculates the next 0-based heading level index (0 to 5).
*
* @param currentLevel 0-based index (0='h1', 1='h2', 2='h3', 3='h4', 4='h5', 5='h6')
* @param hasH1 Whether the current section contains an H1 heading
*/
function calculateNextHeadingLevel(currentLevel, hasH1) {
	if (!hasH1 && currentLevel === 0) return 0;
	return currentLevel === 5 ? 5 : currentLevel + 1;
}

//#endregion
//#region src/hooks/use-heading.ts
const HeadingCtx = createContext(0);
function useHeading(hasH1 = true) {
	const level = useContext(HeadingCtx);
	return calculateNextHeadingLevel(level, hasH1);
}

//#endregion
//#region src/components/heading.tsx
const HEADING_TAGS = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6"
];
const Heading = forwardRef(({ children, ...props }, ref) => {
	const level = useContext(HeadingCtx);
	const Tag = HEADING_TAGS[level] ?? "h6";
	return /* @__PURE__ */ jsx(Tag, {
		...props,
		ref,
		children
	});
});
Heading.displayName = "Heading";

//#endregion
//#region src/components/create-region.tsx
function createRegion(Tag) {
	const Component = forwardRef(({ children, ...props }, ref) => {
		const level = useHeading();
		return /* @__PURE__ */ jsx(Tag, {
			...props,
			ref,
			children: /* @__PURE__ */ jsx(HeadingCtx.Provider, {
				value: level,
				children
			})
		});
	});
	Component.displayName = String(Tag).charAt(0).toUpperCase() + String(Tag).slice(1);
	return Component;
}

//#endregion
//#region src/components/landmarks.ts
const Section = createRegion("section");
const Article = createRegion("article");
const Header = createRegion("header");
const Aside = createRegion("aside");
const Legend = createRegion("legend");

//#endregion
//#region src/components/main.tsx
const Main = forwardRef(({ pageHasH1 = true, children, ...props }, ref) => {
	const level = useHeading(pageHasH1);
	return /* @__PURE__ */ jsx("main", {
		...props,
		ref,
		children: /* @__PURE__ */ jsx(HeadingCtx.Provider, {
			value: level,
			children
		})
	});
});
Main.displayName = "Main";

//#endregion
//#region src/utils/get-region-identifier.ts
const HTML_LANDMARKS = "main, header, footer, nav, aside, section, article, legend";
const ARIA_ROLES = `[role="main"], [role="banner"], [role="contentinfo"], [role="navigation"], [role="complementary"], [role="region"], [role="search"], [role="form"], [role="article"]`;
const LANDMARK_SELECTOR = `${HTML_LANDMARKS}, ${ARIA_ROLES}`;
/**
* Resolves an element's identifier, favoring an explicit ARIA role if present.
*/
function getRegionIdentifier(element) {
	const role = element.getAttribute("role")?.trim().toLowerCase();
	const tag = element.tagName.toLowerCase();
	if (role) return `${tag}[role="${role}"]`;
	return tag;
}

//#endregion
//#region src/utils/draw-region.ts
const HEADING_SELECTOR = "h1, h2, h3, h4, h5, h6";
function drawRegion(element) {
	const tagName = getRegionIdentifier(element);
	const regions = [...element.querySelectorAll(LANDMARK_SELECTOR)].filter((child) => child.parentElement?.closest(LANDMARK_SELECTOR) === element);
	const directHeadings = [...element.querySelectorAll(HEADING_SELECTOR)].filter((heading) => heading.closest(LANDMARK_SELECTOR) === element);
	const headings = Array(directHeadings.length);
	return {
		tagName,
		headings,
		detailedHeadings: directHeadings.map((heading, index) => {
			const level = heading.tagName.toLowerCase();
			headings[index] = level;
			return {
				level,
				text: heading.textContent?.trim() || "",
				element: heading
			};
		}),
		children: regions.map((region) => drawRegion(region))
	};
}

//#endregion
export { Article, Aside, Header, Heading, HeadingCtx, Legend, Main, Section, drawRegion };
//# sourceMappingURL=index.mjs.map