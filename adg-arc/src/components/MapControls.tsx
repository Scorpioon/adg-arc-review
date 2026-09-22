import { HomeIcon, RotateCcwIcon, RotateCwIcon, ZoomInIcon, ZoomOutIcon } from "./icons";
import { useT } from "../i18n/context";
import type { DeviceClass } from "../hooks/useViewportClass";

// TG020-R3 (FB-074, corrected): the pan D-pad is gone and the retained set —
// Home/reset, Zoom in, Zoom out, Rotate left, Rotate right — is exactly five
// canonical circular controls at *every* device tier, never a reduced
// per-mode inventory (the pre-correction pass had tablet/mobile drop zoom
// and/or rotate, which this authority explicitly forbids). `mode` still
// selects a `map-controls--<mode>` modifier class so CSS can tighten
// gap/stack-offset on narrower tiers (global.css) — it no longer changes
// which buttons render, only their spacing.
interface MapControlsProps {
  mode: DeviceClass;
  disabled: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: (direction: 1 | -1) => void;
  onReset: () => void;
}

export default function MapControls({
  mode,
  disabled,
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
        className="map-controls__btn"
        aria-label={t("mapControls.reset")}
        title={t("mapControls.resetTooltip")}
        disabled={disabled}
        onClick={onReset}
      >
        <HomeIcon />
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
