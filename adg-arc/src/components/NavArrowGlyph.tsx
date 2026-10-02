// TG022 P6 (FB-078/FB-092): the one canonical navigation-arrow glyph, shared
// by every surface the R3 authority names — map-top navbar, dossier lower
// navbar, Explora, Passport back. Session 33's recovery established that the
// literal left-arrow/right-arrow text glyph this file used to render
// (`.nav-arrow-glyph`, global.css) WAS the second arrow language FB-062 warned against — the
// product's one arrow language is the shared IconBase pan-arrow SVG family
// (icons.tsx), recovered byte-identical from Git history. NavArrowGlyph's
// own public contract (component name, NavArrowDirection, direction prop) is
// unchanged, so every existing consumer render site requires zero JSX
// changes.
import { PanLeftIcon, PanRightIcon } from "./icons";

export type NavArrowDirection = "previous" | "next";

export default function NavArrowGlyph({ direction }: { direction: NavArrowDirection }) {
  return direction === "previous" ? <PanLeftIcon /> : <PanRightIcon />;
}
