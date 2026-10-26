import type { RefObject } from "react";
import {
  CompassIcon,
  InfoIcon,
  PassportIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./icons";
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
//
// MTG01_R2 FB-029/FB-030 (OPERATOR, evidence
// 07_map_information_button_position.png): the left column is now TWO groups,
// not one six-button stack.
//
//   * The top group carries the (i) / application-menu control — raised to the
//     top of the map column, which is what FB-029's annotated arrow asks for —
//     and, directly beneath it, the new dedicated Passport shortcut (FB-030).
//   * The bottom group keeps the five true map-camera controls (compass/reset,
//     zoom, rotate) where they already were, above MapLibre's attribution.
//
// Splitting the DOM rather than reordering with CSS keeps the reading and tab
// order identical to the visual order. Both groups reuse `.map-controls__btn`
// unchanged, so nothing about the circular geometry, hover/active/disabled
// treatment or the `--z-map-chrome` tier changes.
//
// Positioning note (global.css): the top group cannot simply sit at the map's
// top-left, because below 768px `.passport-map-navbar` stops being a centered
// pill and spans the full top width. The top group is therefore offset below
// that band through one declared `--map-top-chrome-clearance` token rather
// than a guessed literal. This needs OPERATOR visual confirmation at 380/480/
// 767/768 — it is the one geometric judgement in this feedback that the
// evidence image (a desktop capture, where the navbar is a narrow centered
// pill and the top-left is free) does not itself settle.
interface MapControlsProps {
  mode: DeviceClass;
  disabled: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  menuTriggerRef: RefObject<HTMLButtonElement>;
  // MTG01_R2 FB-030: opens the existing Passport destination. App owns what
  // that means (AppMenuModal's `passport` destination, through the same
  // App-level menu state every other entry point uses) — this component only
  // reports the press, exactly as it does for the menu trigger above. It
  // grants no stamp, reads no passport state and touches no QR/proof
  // authority.
  onOpenPassport: () => void;
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
  onOpenPassport,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
}: MapControlsProps) {
  const t = useT();

  return (
    <>
      <div
        className={`map-controls map-controls--top map-controls--${mode}`}
        role="group"
        aria-label={t("mapControls.topGroupLabel")}
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
          aria-haspopup="dialog"
          aria-controls={APP_MENU_PANEL_ID}
          aria-label={t("mapControls.passport")}
          title={t("mapControls.passport")}
          onClick={onOpenPassport}
        >
          <PassportIcon />
        </button>
      </div>
      <div
        className={`map-controls map-controls--stack map-controls--${mode}`}
        role="group"
        aria-label={t("mapControls.groupLabel")}
      >
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
    </>
  );
}
