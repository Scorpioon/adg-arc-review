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

// TG006A-FB-003, corrected per operator browser review: one coherent
// bottom-left navigation dock — D-pad (pan + home/reset) as the central
// visual grammar, with zoom and rotation as small adjacent stacks. Replaces
// the removed native NavigationControl entirely (not merely relocated),
// since the top-right corner conflicts with the open desktop CaseSheet.
const PAN_STEP_PX = 140;

interface MapControlsProps {
  disabled: boolean;
  onPan: (dx: number, dy: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: (direction: 1 | -1) => void;
  onReset: () => void;
}

export default function MapControls({
  disabled,
  onPan,
  onZoomIn,
  onZoomOut,
  onRotate,
  onReset,
}: MapControlsProps) {
  return (
    <div className="map-controls" role="group" aria-label="Map navigation">
      <div className="map-controls__pad">
        <button
          type="button"
          className="map-controls__btn map-controls__btn--up"
          aria-label="Pan up"
          disabled={disabled}
          onClick={() => onPan(0, -PAN_STEP_PX)}
        >
          <PanUpIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--left"
          aria-label="Pan left"
          disabled={disabled}
          onClick={() => onPan(-PAN_STEP_PX, 0)}
        >
          <PanLeftIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--reset"
          aria-label="Reset map view to default Barcelona/DhUB overview"
          title="Reset view (0)"
          disabled={disabled}
          onClick={onReset}
        >
          <HomeIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--right"
          aria-label="Pan right"
          disabled={disabled}
          onClick={() => onPan(PAN_STEP_PX, 0)}
        >
          <PanRightIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn map-controls__btn--down"
          aria-label="Pan down"
          disabled={disabled}
          onClick={() => onPan(0, PAN_STEP_PX)}
        >
          <PanDownIcon />
        </button>
      </div>
      <div className="map-controls__zoom">
        <button
          type="button"
          className="map-controls__btn"
          aria-label="Zoom in"
          disabled={disabled}
          onClick={onZoomIn}
        >
          <ZoomInIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn"
          aria-label="Zoom out"
          disabled={disabled}
          onClick={onZoomOut}
        >
          <ZoomOutIcon />
        </button>
      </div>
      <div className="map-controls__rotate">
        <button
          type="button"
          className="map-controls__btn"
          aria-label="Rotate map counter-clockwise"
          disabled={disabled}
          onClick={() => onRotate(-1)}
        >
          <RotateCcwIcon />
        </button>
        <button
          type="button"
          className="map-controls__btn"
          aria-label="Rotate map clockwise"
          disabled={disabled}
          onClick={() => onRotate(1)}
        >
          <RotateCwIcon />
        </button>
      </div>
    </div>
  );
}
