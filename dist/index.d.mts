
import { HTMLAttributes } from "react";
//#region src/components/heading.d.ts
declare const Heading: import("react").ForwardRefExoticComponent<HTMLAttributes<HTMLHeadingElement> & import("react").RefAttributes<HTMLHeadingElement>>;
//#endregion
//#region src/components/landmarks.d.ts
declare const Section: import("react").ForwardRefExoticComponent<import("react").HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>>;
declare const Article: import("react").ForwardRefExoticComponent<import("react").HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>>;
declare const Header: import("react").ForwardRefExoticComponent<import("react").HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>>;
declare const Aside: import("react").ForwardRefExoticComponent<import("react").HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>>;
declare const Legend: import("react").ForwardRefExoticComponent<import("react").HTMLAttributes<HTMLLegendElement> & import("react").RefAttributes<HTMLLegendElement>>;
//#endregion
//#region src/components/main.d.ts
declare const Main: import("react").ForwardRefExoticComponent<{
  pageHasH1?: boolean;
} & HTMLAttributes<HTMLElement> & import("react").RefAttributes<HTMLElement>>;
//#endregion
//#region src/types.d.ts
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 0;
type HeadingDetail = {
  /** Tag string (e.g. "h2") or explicit numerical level (e.g. 2) */
  level: string | number;
  /** Visible inner text of the heading element (e.g. "Pricing Plans") */
  text?: string;
  /** Optional reference to the underlying DOM node or custom element context */
  element?: unknown;
};
type RegionMapping = {
  tagName: string;
  /** Legacy string-only headings array */
  headings: string[];
  /** Rich heading metadata with inner text and DOM element references */
  detailedHeadings?: HeadingDetail[];
  children: RegionMapping[];
};
//#endregion
//#region src/hooks/use-heading.d.ts
declare const HeadingCtx: import("react").Context<HeadingLevel>;
//#endregion
//#region src/utils/draw-region.d.ts
declare function drawRegion<T extends Element>(element: T): RegionMapping;
//#endregion
export { Article, Aside, Header, Heading, HeadingCtx, Legend, Main, Section, drawRegion };
//# sourceMappingURL=index.d.mts.map