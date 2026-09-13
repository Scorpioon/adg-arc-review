import type { CaseRecord } from "../data/cases";
import type { PassportState } from "../hooks/usePassport";
import { PassportRail } from "./PassportPane";

interface PassportMapOverlayProps {
  passport: PassportState;
  cases: CaseRecord[];
}

// TG010 S5B (ADGARC-FB-029 / DEC-008 §3.2): the passport progress rail
// relocates from the menu header to a top-center map overlay — canonical
// across desktop/tablet/mobile. Reuses the same PassportRail component and
// the same App-owned `passport`/`cases` authority the Pasaporte pane itself
// reads, so this is never a second progress computation, a second visited
// set, or a hardcoded physical-case count. PassportRail's cells are already
// non-interactive display chrome (see PassportPane.tsx), so this overlay is
// journey/status chrome only, never a second case-selection surface.
export default function PassportMapOverlay({ passport, cases }: PassportMapOverlayProps) {
  return <PassportRail passport={passport} cases={cases} variant="overlay" />;
}
