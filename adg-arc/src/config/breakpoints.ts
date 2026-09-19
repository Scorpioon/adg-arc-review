// TG006I Scope A/B — single coherent breakpoint authority shared by every
// responsive surface (map controls, Case/Dossier presentation, tether
// visibility) instead of scattered one-off media queries. Values mirror
// global.css's own @media rules — CSS cannot import a TS constant, so both
// sides must be kept in sync by hand when either changes.
export const TABLET_MIN = 768;
export const DESKTOP_MIN = 1024;
