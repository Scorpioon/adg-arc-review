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

  useEffect(() => {
    const mqTablet = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
    const mqDesktop = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    const update = () => setDeviceClass(computeDeviceClass());
    mqTablet.addEventListener("change", update);
    mqDesktop.addEventListener("change", update);
    window.addEventListener("resize", update);
    return () => {
      mqTablet.removeEventListener("change", update);
      mqDesktop.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return deviceClass;
}
