import type { CSSProperties } from "react";

// DhUB-specific type specimen. Translates the Horizontype Monospaced/DhUB
// pairing rationale (monospaced rhythm, geometric alignment, angled
// interruption, cantilever-like extension — see data/cases.ts
// `correlation.rationale`) into a small, restrained composition. This is a
// one-off for DhUB, not a reusable specimen system — see TG005 handoff §15.
const GLYPHS = ["H", "O", "R", "I", "Z", "O", "N", "T", "Y", "P", "E"];

export default function DhubSpecimen() {
  return (
    <div
      className="dhub-specimen"
      role="img"
      aria-label="Horizontype Monospaced type specimen: a modular row of glyphs with a stepped, cantilever-like offset, echoing DhUB's angled planes."
    >
      <div className="dhub-specimen__row">
        {GLYPHS.map((glyph, i) => (
          <span
            key={i}
            className="dhub-specimen__glyph"
            aria-hidden="true"
            style={{ "--i": i } as CSSProperties}
          >
            {glyph}
          </span>
        ))}
      </div>
      <div className="dhub-specimen__plane" aria-hidden="true" />
    </div>
  );
}
