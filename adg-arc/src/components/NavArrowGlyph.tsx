// TG020-R3 (FB-062): the one canonical navigation-arrow glyph, shared by
// every surface the R3 authority names — map-top navbar, dossier lower
// navbar, Explora, Passport back. Deliberately typographic (a real "←"/"→"
// character), never a new chevron/SVG shape: the authority explicitly
// rejects introducing a second arrow language. `.nav-arrow-glyph` (global.css)
// pins font-family/weight/size/line-height explicitly so the glyph can never
// fall back to a control's own inherited/UA styling and drift from this
// shared look.
export type NavArrowDirection = "previous" | "next";

const GLYPH: Record<NavArrowDirection, string> = {
  previous: "←",
  next: "→",
};

export default function NavArrowGlyph({ direction }: { direction: NavArrowDirection }) {
  return (
    <span className="nav-arrow-glyph" aria-hidden="true">
      {GLYPH[direction]}
    </span>
  );
}
