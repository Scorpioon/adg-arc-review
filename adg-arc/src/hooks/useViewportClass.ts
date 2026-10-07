import { useEffect, useState } from "react";
import { DESKTOP_MIN, TABLET_MIN } from "../config/breakpoints";

export type DeviceClass = "mobile" | "tablet" | "desktop";

function computeDeviceClass(): DeviceClass {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < TABLET_MIN) return "mobile";
  if (width < DESKTOP_MIN) return "tablet";
  return "desktop";
}

// TG006I Scope A — width-based device-class heuristic (mobile / tablet /
// desktop), the single source both MapControls' control inventory and
// CaseSheet's responsive geometry key off (config/breakpoints.ts). Width-
// based rather than pointer-sniffed: deterministic, testable by resizing,
// and reuses the exact 768px boundary CaseSheet's pre-TG006I floating-panel
// breakpoint already used. Known limitation, recorded rather than silently
// assumed away: a narrow non-touch desktop window is classified the same as
// a real tablet — an intentional simplicity/determinism tradeoff per the
// handoff's "prefer native capabilities... coherent rather than scattered
// one-off" guidance, not an attempt at UA/pointer sniffing.
export function useViewportClass(): DeviceClass {
  const [deviceClass, setDeviceClass] = useState<DeviceClass>(() => computeDeviceClass());

  // TG013-012 / TG036 (FB-119) corrective: was three independent listeners
  // (two matchMedia "change" + one window "resize") all wired to the same
  // handler. Any width change that crosses the tablet/desktop breakpoint
  // also fires a native "resize" event, so the two matchMedia listeners
  // were a redundant second/third source for the same recomputation — one
  // coherent source now drives every update, with identical classification
  // output for every width change.
  useEffect(() => {
    const update = () => setDeviceClass(computeDeviceClass());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return deviceClass;
}
