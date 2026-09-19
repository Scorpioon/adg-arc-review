import {
  HomeIcon,
  PanDownIcon,
  PanLeftIcon,
  PanRightIcon,
  PanUpIcon,
  RotateCcwIcon,
  RotateCwIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./icons";
import { useT } from "../i18n/context";
import type { DeviceClass } from "../hooks/useViewportClass";

// TG006A-FB-003, corrected per operator browser review: one coherent
// bottom-left navigation dock — D-pad (pan + home/reset) as the central
// visual grammar, with zoom and rotation as small adjacent stacks. Replaces
// the removed native NavigationControl entirely (not merely relocated),
// since the top-right corner conflicts with the open desktop CaseSheet.
//
// TG006I Scope A real-device extension (ADGARC-FB-003/ADGARC-REV-002): the
// desktop inventory above is no longer carried unchanged into touch-first
// layouts. `mode` (from useViewportClass, the single device-class
// authority) selects one of three deliberately different control
// inventories — desktop keeps everything; tablet drops the D-pad/rotate
// (native touch gestures cover pan/rotate) but keeps zoom+reset; mobile is
// gesture-first and keeps only reset, the one control FB-003 judges to
// "materially help" beyond native pinch/drag. Every button's aria-label and
// hover/focus tooltip come from the same i18n key pair (`X` / `X + "Tooltip"`)
// so accessible name and visible tooltip can never drift — the "shared
// control definitions" the handoff calls for, kept in the i18n catalog
// rather than a second parallel metadata module (ADGARC-FB-003 Scope F).
const PAN_STEP_PX = 140;

interface MapControlsProps {
  mode: DeviceClass;
  disabled: boolean;
  onPan: (dx: number, dy: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: (direction: 1 | -1) => void;
  onReset: () => void;
}

export default function MapControls({
  mode,
  disabled,
  onPan,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
}: MapControlsProps) {
  const t = useT();

  const resetButton = (
    <button
      type="button"
      className="map-controls__btn map-controls__btn--reset"
      aria-label={t("mapControls.reset")}
      title={t("mapControls.resetTooltip")}
      disabled={disabled}
      onClick={onReset}
    >
      <HomeIcon />
    </button>
  );

  const zoomStack = (
    <div className="map-controls__zoom">
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
    </div>
  );

  // Mobile: gesture-first — no D-pad, no rotate stack, no zoom stack
  // (native pinch covers it). Reset/Home is the one small explicit control
  // FB-003 judges worth keeping.
  if (mode === "mobile") {
    return (
      <div
        className="map-controls map-controls--mobile"
        role="group"
        aria-label={t("mapControls.groupLabel")}
      >
        {resetButton}
      </div>
    );
  }

  // Tablet: reduced density — no D-pad, no rotate (native touch gestures
  // cover both), but zoom+reset stay since they add value beyond a single
  // pinch gesture on a larger canvas.
  if (mode === "tablet") {
    return (
      <div
        className="map-controls map-controls--tablet"
        role="group"
        aria-label={t("mapControls.groupLabel")}
      >
        {resetButton}
        {zoomStack}
      </div>
    );
  }

  return (
    <div className="map-controls" role="group" aria-label={t("mapControls.groupLabel")}>
      <div className="map-controls__pad">
        <button
          type="button"
          className="map-controls__btn map-controls__btn--up"
          aria-label={t("mapControls.panUp")}
          title={t("mapControls.panUpTooltip")}
          disabled={disabled}
          onClick={() => onPan(0, -PAN_STEP_PX)}
        >
          <PanUpIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--left"
          aria-label={t("mapControls.panLeft")}
          title={t("mapControls.panLeftTooltip")}
          disabled={disabled}
          onClick={() => onPan(-PAN_STEP_PX, 0)}
        >
          <PanLeftIcon />
        </button>
        {resetButton}
        <button
          type="button"
          className="map-controls__btn map-controls__btn--right"
          aria-label={t("mapControls.panRight")}
          title={t("mapControls.panRightTooltip")}
          disabled={disabled}
          onClick={() => onPan(PAN_STEP_PX, 0)}
        >
          <PanRightIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--down"
          aria-label={t("mapControls.panDown")}
          title={t("mapControls.panDownTooltip")}
          disabled={disabled}
          onClick={() => onPan(0, PAN_STEP_PX)}
        >
          <PanDownIcon />
        </button>
      </div>
      {zoomStack}
      <div className="map-controls__rotate">
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
    </div>
  );
}
