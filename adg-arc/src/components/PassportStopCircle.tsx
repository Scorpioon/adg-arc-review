// TG011 Pass C (ADGARC-FB-043 / ADGARC-DEC-010 §11.3): the single circle
// primitive carrying the canonical Passport stop-state vocabulary — visited
// fill, selection stroke, reserved slot. The Passport pane rail uses it now;
// the separately allocated map-top navbar (ADGARC-FB-046) is meant to reuse
// it later, so the two surfaces can never drift into two implementations of
// the same state read.
//
// Deliberately ignorant of every product authority: it knows an ordinal and
// the states it was handed, and nothing about `caseSlug`, the URL/history,
// stamping, localStorage, MapLibre, map selection or pagination. Whoever
// renders it owns all of that. It is a visual primitive, not a framework.
interface PassportStopCircleProps {
  ordinal: number;
  // Visit / stamp state — carries the fill colour only. DEC-010 §11.3:
  // never derived from `current`, and never derives it.
  visited: boolean;
  // Selection / carousel-focus state — carries the 3px resting stroke only.
  // Independent of `visited`: current+unvisited is grey fill + stroke,
  // current+visited is yellow fill + stroke.
  current: boolean;
  // A reserved position whose source identity is unresolved (FB-043 source
  // discipline / DEC-010 §D4): rendered and named honestly, never
  // activatable, never given invented content.
  disabled: boolean;
  bold: boolean;
  // The full accessible name, composed by the caller from the i18n catalog —
  // this primitive never builds copy of its own.
  accessibleLabel: string;
  onActivate?: (ordinal: number) => void;
}

export default function PassportStopCircle({
  ordinal,
  visited,
  current,
  disabled,
  bold,
  accessibleLabel,
  onActivate,
}: PassportStopCircleProps) {
  return (
    <button
      type="button"
      className="passport-stop-circle"
      data-visited={visited ? "true" : "false"}
      data-current={current ? "true" : "false"}
      data-bold={bold ? "true" : "false"}
      data-reserved={disabled ? "true" : "false"}
      disabled={disabled}
      aria-current={current && !disabled ? "true" : undefined}
      onClick={() => onActivate?.(ordinal)}
    >
      <span className="passport-stop-circle__ordinal" aria-hidden="true">
        {ordinal}
      </span>
      {/* Status is never carried by colour alone (standing accessibility
          invariant): the rail keeps the existing ✓ / · vocabulary as a small
          mark below the ordinal, and the accessible name states the same
          thing in words. A reserved position has no visit state, so it
          carries neither mark. */}
      {!disabled && (
        <span className="passport-stop-circle__mark" aria-hidden="true">
          {visited ? "✓" : "·"}
        </span>
      )}
      <span className="visually-hidden">{accessibleLabel}</span>
    </button>
  );
}
