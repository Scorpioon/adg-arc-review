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

// Single canonical up-arrow path, reused for all four pan directions via
// rotation — avoids four near-duplicate path definitions.
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

export function MenuIcon() {
  return (
    <IconBase>
      <path d="M4 7h16M4 12h16M4 17h16" />
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
