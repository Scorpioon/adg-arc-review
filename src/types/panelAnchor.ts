// TG017: neutral shared type, extracted from the retired CaseSheet.tsx so
// MapView's tether-target prop and InfocardDossier's own anchor type both
// resolve through one declaration instead of two structurally-identical but
// independently maintained ones (TG013-002).
export interface PanelAnchor {
  x: number;
  y: number;
}
