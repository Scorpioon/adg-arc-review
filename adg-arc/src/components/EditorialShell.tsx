import type { ReactNode, RefObject } from "react";

interface EditorialShellProps {
  title: string;
  onClose: () => void;
  closeLabel: string;
  closeButtonRef: RefObject<HTMLButtonElement>;
  children: ReactNode;
  // TG022 P1 (R4 audit §8.1 / FB-097): an optional non-scrolling band between
  // the topbar and the scrollable body — the mirror image of the `footer`
  // slot below, and the same kind of thing: a slot, not a product concept.
  // The shell neither knows nor cares that the application menu puts its
  // `← ordinal label` destination header here, and it never special-cases any
  // particular destination; a consumer that passes nothing (the root menu,
  // the dossier) gets exactly the previous composition. Deliberately NOT
  // sticky — a band that must stay put is a `flex: none` sibling of the
  // scroller, never a sticky layer inside it (R4 audit §8.2 rule 2).
  destinationHeader?: ReactNode;
  // TG011 Pass A (ADGARC-FB-040): an optional non-scrolling band pinned to
  // the bottom of the shell, below the scrollable body. A slot rather than a
  // product concept: the shell neither knows nor cares that the application
  // menu puts its partner-credit band here, and a consumer that passes
  // nothing gets exactly the previous two-element composition.
  footer?: ReactNode;
}

// TG010 Final Experience P1 (ADGARC-DEC-010): the reusable yellow-topbar /
// [X]-close / body chrome shared by every canonical editorial surface — the
// application menu today, Passport and the dossier from P2 onward. Pure
// chrome only: no routing, no destination/product state, no content schema.
// The caller owns everything in `children` and decides what `title`/
// `onClose` mean; this never becomes a generic modal framework.
export default function EditorialShell({
  title,
  onClose,
  closeLabel,
  closeButtonRef,
  children,
  destinationHeader,
  footer,
}: EditorialShellProps) {
  return (
    <>
      <header className="editorial-shell__topbar">
        <span className="editorial-shell__title">{title}</span>
        <button
          type="button"
          ref={closeButtonRef}
          className="editorial-shell__close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <span aria-hidden="true">[X]</span>
        </button>
      </header>
      {/* Outside .editorial-shell__body on purpose, exactly like `footer`
          below: the body keeps flex:1 and owns the scroll, this stays
          flex:none directly beneath the topbar. */}
      {destinationHeader}
      <div className="editorial-shell__body" aria-live="polite">
        {children}
      </div>
      {/* Outside .editorial-shell__body on purpose — see the ADGARC-FB-040
          note on .app-menu__footer in global.css. The body keeps flex:1 and
          owns the scroll; this stays flex:none at the panel bottom. */}
      {footer}
    </>
  );
}
