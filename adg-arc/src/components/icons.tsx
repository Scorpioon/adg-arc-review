// TG006G Scope D: local, dependency-free SVG icon set replacing the
// debug-like Unicode/text glyphs previously used for map/navigation chrome
// (MapControls, menu trigger, close buttons). All icons are authored inline
// here (no icon-library dependency, no external asset files), share one
// stroke-based visual language, and use `currentColor` so hover/active/
// disabled button states keep controlling icon color automatically. Every
// icon is `aria-hidden`/`focusable="false"` — the accessible name always
// comes from the button's own `aria-label`, never from the icon.
import type { CSSProperties, ReactNode } from "react";

function IconBase({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={style}
    >
      {children}
    </svg>
  );
}

export function HomeIcon() {
  return (
    <IconBase>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </IconBase>
  );
}

export function ZoomInIcon() {
  return (
    <IconBase>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function ZoomOutIcon() {
  return (
    <IconBase>
      <path d="M5 12h14" />
    </IconBase>
  );
}

// Single canonical counter-clockwise arc+arrowhead, mirrored horizontally
// for clockwise — avoids a second near-duplicate path definition.
function RotateIcon({ mirrored }: { mirrored: boolean }) {
  return (
    <IconBase style={mirrored ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 4v5h5" />
      <path d="M5.3 15.3A8 8 0 1 0 7.4 5.4L4 9" />
    </IconBase>
  );
}

export function RotateCcwIcon() {
  return <RotateIcon mirrored={false} />;
}
export function RotateCwIcon() {
  return <RotateIcon mirrored={true} />;
}

// TG020-R3 (FB-075): replaces the map trigger's former hamburger (MenuIcon —
// no longer used anywhere, removed rather than left orphaned) with a
// canonical information glyph: circle outline, a short stem and a dot, the
// same stroke-based single-language every other icon in this file uses.
export function InfoIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16" />
      <line x1="12" y1="7.5" x2="12" y2="7.51" />
    </IconBase>
  );
}

// MTG01_R2 FB-030 (OPERATOR, evidence 07_map_information_button_position.png
// "nuevo acceso directo al Pasaporte debajo de (i)"): the Passport shortcut's
// own glyph. Deliberately distinct from every existing control in this file —
// a booklet outline with a stamped mark inside it, reading as the physical
// passport the product's own stamp vocabulary is built on, rather than
// reusing InfoIcon (which already means "menu") or CompassIcon. Same
// stroke-based single language, same 24-unit IconBase grid, as its
// neighbours.
export function PassportIcon() {
  return (
    <IconBase>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <line x1="8.5" y1="3.5" x2="8.5" y2="20.5" />
      <circle cx="14" cy="10" r="2.75" />
      <line x1="11.5" y1="15.5" x2="16.5" y2="15.5" />
    </IconBase>
  );
}

export function CloseIcon() {
  return (
    <IconBase>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  );
}

// TG022 P8 (FB-095, P8-D2): compass/north-orientation reset semantic,
// replacing the map controls' former house glyph (HomeIcon, still exported
// below for its other consumers) — an outer compass ring with a vertical
// north/south needle, visually distinct from RotateCcwIcon/RotateCwIcon's
// arc-and-arrowhead language and from the Pan* arrow family.
export function CompassIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 5.5 14.25 12 12 18.5 9.75 12 12 5.5Z" />
    </IconBase>
  );
}

// TG022 P6 (FB-078/FB-092): the canonical pan-arrow family, recovered
// byte-identical from Git history (commits 523761a / 1fdc388) — one
// stroke path expressed purely through rotation, replacing the literal
// left-arrow/right-arrow text glyph NavArrowGlyph used to render directly.
function ArrowIcon({ rotation }: { rotation: number }) {
  return (
    <IconBase style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M12 19V6" />
      <path d="M6.5 11.5 12 6l5.5 5.5" />
    </IconBase>
  );
}

export function PanUpIcon() {
  return <ArrowIcon rotation={0} />;
}

export function PanRightIcon() {
  return <ArrowIcon rotation={90} />;
}

export function PanDownIcon() {
  return <ArrowIcon rotation={180} />;
}

export function PanLeftIcon() {
  return <ArrowIcon rotation={270} />;
}
