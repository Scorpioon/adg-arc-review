import type { RefObject } from "react";
import { CompassIcon, InfoIcon, RotateCcwIcon, RotateCwIcon, ZoomInIcon, ZoomOutIcon } from "./icons";
import { useT } from "../i18n/context";
import type { DeviceClass } from "../hooks/useViewportClass";
// ADGARC-FB-120 F6: shared owner of the menu panel DOM id — see
// AppMenuModal.tsx's APP_MENU_PANEL_ID comment.
import { APP_MENU_PANEL_ID } from "./AppMenuModal";

// TG020-R3 (FB-074, corrected): the pan D-pad is gone and the retained set —
// Home/reset, Zoom in, Zoom out, Rotate left, Rotate right — is exactly five
// canonical circular controls at *every* device tier, never a reduced
// per-mode inventory (the pre-correction pass had tablet/mobile drop zoom
// and/or rotate, which this authority explicitly forbids). `mode` still
// selects a `map-controls--<mode>` modifier class so CSS can tighten
// gap/stack-offset on narrower tiers (global.css) — it no longer changes
// which buttons render, only their spacing.
//
// TG042 (ADGARC-FB-116): the application-menu trigger (formerly its own
// top-left `.app-menu-trigger`, AppMenuModal.tsx) now renders as this
// stack's first/topmost button, directly above Reset/compass — the FB-116
// "(i) directly above compass" requirement. Reusing `.map-controls__btn`
// for it (rather than a parallel visual treatment) is also what satisfies
// FB-127's "floating menu trigger must become visually circular": this
// class is already a true circle at every tier, so the control needs no
// shape rule of its own.
interface MapControlsProps {
  mode: DeviceClass;
  disabled: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  menuTriggerRef: RefObject<HTMLButtonElement>;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: (direction: 1 | -1) => void;
  onReset: () => void;
}

export default function MapControls({
  mode,
  disabled,
  menuOpen,
  onToggleMenu,
  menuTriggerRef,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
}: MapControlsProps) {
  const t = useT();

  return (
    <div
      className={`map-controls map-controls--${mode}`}
      role="group"
      aria-label={t("mapControls.groupLabel")}
    >
      <button
        type="button"
        ref={menuTriggerRef}
        className="map-controls__btn"
        aria-haspopup="dialog"
        aria-expanded={menuOpen}
        aria-controls={APP_MENU_PANEL_ID}
        aria-label={menuOpen ? t("menu.trigger.close") : t("menu.trigger.open")}
        onClick={onToggleMenu}
      >
        <InfoIcon />
      </button>
      <button
        type="button"
        className="map-controls__btn"
        aria-label={t("mapControls.reset")}
        title={t("mapControls.resetTooltip")}
        disabled={disabled}
        onClick={onReset}
      >
        <CompassIcon />
      </button>
      <button
        type="button"
        className="map-controls__btn"
        aria-label={t("mapControls.zoomIn")}
        title={t("mapControls.zoomInTooltip")}
        disabled={disabled}
        onClick={onZoomIn}
      >
        <ZoomInIcon />
      </button>
      <button
        type="button"
        className="map-controls__btn"
        aria-label={t("mapControls.zoomOut")}
        title={t("mapControls.zoomOutTooltip")}
        disabled={disabled}
        onClick={onZoomOut}
      >
        <ZoomOutIcon />
      </button>
      <button
        type="button"
        className="map-controls__btn"
        aria-label={t("mapControls.rotateCcw")}
        title={t("mapControls.rotateCcwTooltip")}
        disabled={disabled}
        onClick={() => onRotate(-1)}
      >
        <RotateCcwIcon />
      </button>
      <button
        type="button"
        className="map-controls__btn"
        aria-label={t("mapControls.rotateCw")}
        title={t("mapControls.rotateCwTooltip")}
        disabled={disabled}
        onClick={() => onRotate(1)}
      >
        <RotateCwIcon />
      </button>
    </div>
  );
}
