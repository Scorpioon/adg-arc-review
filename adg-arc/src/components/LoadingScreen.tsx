interface LoadingScreenProps {
  progress: number;
  error: string | null;
  exiting: boolean;
}

// TG006B: readiness UI only — the operational boot layer, not the later
// TG009 cinematic entry curtain. `progress` is a deterministic percentage
// (completed milestones / total milestones, from useReadiness) that this
// component only renders; it never fabricates its own time-based animation.
// `exiting` (true once the real "ready" milestone lands) drives a purely
// cosmetic fade-out — App keeps this mounted for one short CSS transition
// after readiness is already true so the dismissal isn't an abrupt cut, not
// to delay the truthful ready state itself.
export default function LoadingScreen({ progress, error, exiting }: LoadingScreenProps) {
  return (
    <div
      className={`loading-screen${exiting ? " loading-screen--exiting" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="loading-screen__mark" aria-hidden="true">
        ADG·ARC
      </div>
      {error ? (
        <p className="loading-screen__error">{error}</p>
      ) : (
        <>
          <div className="loading-screen__track">
            <div className="loading-screen__bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="loading-screen__status">{progress}%</p>
        </>
      )}
    </div>
  );
}
