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

export function CloseIcon() {
  return (
    <IconBase>
      <path d="M6 6l12 12M18 6 6 18" />
    </IconBase>
  );
}
