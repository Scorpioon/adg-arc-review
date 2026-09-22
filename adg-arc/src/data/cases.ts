// Canonical case dataset for the ADG-ARC 31-case (10 physical + 21
// digital-only) collection. Physical cases 01-10 were originally transcribed
// from the recovered definitive physical+digital typography/architecture
// spreadsheet ("TIPOGRAFÍA Y ARQUITECTURA VERSIÓN DEFINITIVA — FISICOS +
// DIGITAL"); as of TG020-R2 the final physical-totem artwork PDF
// (P2Totems_A&T.pdf, source:p2totems-final-physical) is canonical for those
// ten cases and supersedes that spreadsheet wherever the two conflict — see
// ADGARC_TG020_R2_PHYSICAL_CANON_RECONCILIATION_v1.0.md. Anything a source
// leaves blank stays explicitly null/'tbd' here rather than being invented —
// see TG005 handoff §3.5.

export type SourceId =
  | "source:csv-tipografia-arquitectura"
  | "product:tg004-prototype-coordinate"
  // TG020 Phase 1: the 21 digital_only fiches (source doc) plus the
  // authored Walden 7 completion (authority doc) — one coarse-grained
  // SourceId, matching the granularity of the two constants above.
  | "source:tg020-digital-cases"
  // TG020-R2: the final physical-totem artwork PDF, canonical SOT for the
  // ten physical cases (P2Totems_A&T.pdf, sha256
  // a7025a1a51d10ba601de8ea6c5cf1b8f8d96726db0a62df26d4cb146c26038cb). See
  // ADGARC_TG020_R2_PHYSICAL_CANON_RECONCILIATION_v1.0.md §1.
  | "source:p2totems-final-physical";

// TG020-R2: no physical case's `correlation.provenance` cites
// "source:csv-tipografia-arquitectura" any longer (PDF_SOURCE supersedes it
// for all ten) — the union member is kept as a historical record of prior
// provenance, but the const binding is removed since nothing references it
// (noUnusedLocals).
const PROTOTYPE_COORDINATE: SourceId = "product:tg004-prototype-coordinate";
const TG020_SOURCE: SourceId = "source:tg020-digital-cases";
const PDF_SOURCE: SourceId = "source:p2totems-final-physical";

// TG020: evolves the former bare `year: number` into a machine/display pair
// so a fuzzy or ranged source date can be shown honestly without inventing a
// precise year. `year` stays the sortable/machine value (the most recent
// exact year for a range, null when the source gives no reliable single
// year — century/decade wording only); `displayLabel` is what the dossier
// actually renders, source-faithful (e.g. "1906 - 1912", "~S. XX", "Anys
// 60", "1929"). The 10 pre-TG020 physical cases all carry an exact single
// year, so their `displayLabel` is simply that year's string form — no
// content change, just the shape evolving to also fit ranges/fuzz.
export interface CaseDate {
  year: number | null;
  displayLabel: string;
}

export interface CaseIdentity {
  name: string;
  sourceName?: string;
  date: CaseDate;
  architect: string;
  address?: string | null;
}

export interface CaseArchitecture {
  movement?: string | null;
  movementStatus: "verified" | "tbd";
  // Only populated for cases with a full TG005 editorial pass (DhUB) —
  // defensible formal observations already present in the source pairing
  // rationale, not an invented architectural history.
  traits?: string[];
}

export interface CaseTypography {
  primaryFamily: string;
  // TG020: nullable — most of the 21 digital fiches name a typeface without
  // crediting its designer in the source text, and that fact stays null
  // rather than invented (never rendered in the UI; see cases.ts header).
  designer?: string | null;
  sourceUrl?: string | null;
  // Secondary typefaces are PARKED for every case per TG005 handoff §3.3 —
  // never active product content, never surfaced in the interface.
  secondaryStatus: "parked";
  // Internal-only record that the source row also carried a secondary
  // typeface. Never rendered — see handoff §3.3.
  secondarySourceNoted?: boolean;
  // TG020-R2 additive canonical capture, populated for physical 01-10 from
  // P2Totems_A&T.pdf; absent/null for digital-only records rather than
  // invented. See ADGARC_TG020_R2_PHYSICAL_CANON_RECONCILIATION_v1.0.md §7.
  classification?: string | null;
  year?: number | null;
}

export interface CaseCorrelation {
  // Concise, interface-readable Spanish adaptation of the source argument
  // (`Justificació`) — conservative paraphrase/shortening only, no new
  // facts or criticism. Populated for all 10 cases as of TG007; DhUB's
  // (TG005) predates the Spanish-display-copy convention and was kept
  // as-is rather than rewritten. See TG007 handoff §"El diálogo".
  rationale?: string;
  // Verbatim architecture<->typography justification transcribed from the
  // spreadsheet's `Justificació` column, kept separate from any adapted
  // `rationale` per handoff §14.
  sourceRationale: string;
  provenance: SourceId;
}

// TG006D coordinate status vocabulary — see
// ADGARC_TG006D_COORDINATE_EVIDENCE_PACK_v0.1.md §"Authority rule". The
// recovered spreadsheet carries no coordinates for 9 of the 10 cases;
// coordinates are therefore a derived enrichment layer that must remain
// honest about how confidently each point locates the actual building.
export type CoordinateStatus =
  // The building/institution itself publishes the coordinate (DHub).
  | "verified_official"
  // An external architecture/institution/map source identifies the named
  // building and supplies a building/object-level coordinate.
  | "verified_external_building"
  // External geodata identifies the relevant street/address area only —
  // not yet an independently verified building centroid. Never presented
  // to the user as exact/verified.
  | "provisional_external_street";

export interface CaseCoordinates {
  longitude: number;
  latitude: number;
  // Camera focus zoom for this case, not a coordinate-accuracy signal —
  // a product/UI decision independent of `status`/`precision`.
  zoom: number;
  // Free-text evidence description (external source name/page, or the
  // original in-product provenance for DHub) — deliberately broader than
  // `SourceId`, since most of these coordinates are not spreadsheet-sourced.
  provenance: string;
  status: CoordinateStatus;
  // Free-text granularity note from the evidence pack, e.g. "building",
  // "architectural ensemble", "institution/building", "street".
  precision: string;
}

// TG006H physical/digital classification (handoff Scope D): the current 10
// cases correspond to physical ~2m totems with QR entry into this app;
// future cases may be digital-only. Never fabricated — only the current 10
// are set to `physical_digital` below, and no `digital_only` case exists yet.
export type ExperienceType = "physical_digital" | "digital_only";

// TG006C durable media contract (ADGARC-FB-006). No case currently has a
// verified local asset with sufficient provenance/rights evidence — every
// record below sets `heroMedia: null` deliberately rather than omitting the
// field or inventing a path/credit/license. An image embedded in an
// archival PDF/source document is not, by itself, authorized media.
export interface CaseHeroMedia {
  src: string;
  alt: string;
  credit?: string | null;
  provenance: string;
  rightsStatus: string;
}

// TG012 editorial display-copy layer. `infocard` is additive only — it must
// never duplicate a fact that already has a canonical home elsewhere on
// CaseRecord (identity, architecture, typography, coordinates, etc.). See
// ADGARC_TG012 Prompt 039 §2 Amendment A.
export type InfocardQuoteKind = "literal_quote" | "paraphrase" | "synthesis";

// Local to cases.ts — deliberately narrower than `SourceId`, which was built
// for factual/coordinate provenance, not this final editorial copy set. See
// ADGARC_TG012 Prompt 039 §2 Amendment B.
export interface InfocardEditorialProvenance {
  // Exact mapping v0.3 location, e.g. "§4 > 1C L'edifici" or "§21.1 > 3 Casa de la Marina".
  mappingRef: string;
  // Mapping's own source-locator language, preserved rather than re-identified.
  sourceLocator: string;
}

export interface InfocardEditorialCopy {
  displayText: string;
  provenance: InfocardEditorialProvenance;
}

export interface InfocardHighlightedPhrase extends InfocardEditorialCopy {
  kind: InfocardQuoteKind;
  attribution: string;
  bibliographicContext?: string | null;
}

export interface InfocardContent {
  // Nullable at the type level: future/other cases may legitimately have no
  // approved highlighted phrase, even though v0.3 §21.1 resolves all ten
  // current cases.
  highlightedPhrase: InfocardHighlightedPhrase | null;
  buildingProse: InfocardEditorialCopy;
  architectureCopy: InfocardEditorialCopy;
  typographyCopy: InfocardEditorialCopy;
  dialogueCopy: InfocardEditorialCopy;
  // TG020-R2 additive canonical capture: the PDF's typography-page quote,
  // data-only in this pass — no dossier page surfaces it yet (R2 §7/§4).
  // Populated for physical 01-10; absent for digital-only records.
  typographyHighlightedPhrase?: InfocardHighlightedPhrase | null;
}

export interface CaseRecord {
  slug: string;
  identity: CaseIdentity;
  experienceType: ExperienceType;
  architecture: CaseArchitecture;
  typography: CaseTypography;
  correlation: CaseCorrelation;
  heroMedia: CaseHeroMedia | null;
  // No case in the current spreadsheet set has a coordinate in source
  // truth except DhUB (an existing, non-spreadsheet product/prototype
  // point carried over from TG004). TG006D adds the other 9 as an
  // externally-sourced enrichment layer per
  // ADGARC_TG006D_COORDINATE_EVIDENCE_PACK_v0.1.md — `status`/`precision`
  // preserve how confidently each one locates the actual building; none
  // are invented or manually nudged. `coordinates` stays nullable for any
  // future case this evidence pack does not cover. Each case is still
  // fully reachable via `?case=<slug>` regardless of coordinate presence.
  coordinates: CaseCoordinates | null;
  // True only for the fuller editorial ficha produced in TG005 (DhUB):
  // architecture `traits` stay scoped to this flag by product decision
  // (ADGARC-DEC-001) — it no longer gates `correlation.rationale`, which
  // TG007 populates for all 10 cases. See TG007 handoff.
  editorial: boolean;
  infocard: InfocardContent;
}

export const cases: CaseRecord[] = [
  {
    slug: "casa-caracoles",
    identity: {
      name: "Cases dels Cargols",
      date: { year: 1895, displayLabel: "1895" },
      architect: "Carles Bosch i Negre",
      address: "Entença, 2",
    },
    experienceType: "physical_digital",
    architecture: { movement: "Modernisme Català", movementStatus: "verified" },
    typography: {
      primaryFamily: "Glucosa",
      designer: "Jordi Embodas, Gerard Sierra",
      sourceUrl: "https://tipografies.com/fonts/glucosa",
      secondaryStatus: "parked",
      secondarySourceNoted: true,
      classification: "Sans Serif",
      year: 2024,
    },
    correlation: {
      sourceRationale:
        "La relació amb l'edifici neix del contrast entre estructura i ornament. Els eixos verticals de columnes, pilastres i balcons equivalen als traços ferms de Glucosa, mentre que els volums corbats i els motius vegetals introdueixen la seva dimensió orgànica. En tots dos casos, una construcció clara se suavitza amb detalls expressius que aporten ritme, singularitat i identitat.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.156268,
      latitude: 41.375488,
      zoom: 17,
      provenance:
        'Arquitectura Modernista, "Cases Miquel Ribera Ros (o dels Cargols)" — map location for Entença, 2 - Tamarit, 89. External canonical naming differs from the recovered case name; the address/building match is strong.',
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText:
          "L'art ornamental no ha de ser un afegit, sinó la línia viva que dona estructura i ànima a l'edifici.",
        attribution: "Síntesi del pensament arquitectònic de Victor Horta.",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020-R2 §Cases dels Cargols — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.1 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Edifici d'habitatges construït en un xamfrà de la trama urbana de l'Eixample de Barcelona a la fi del segle XIX.",
        provenance: {
          mappingRef: "§4 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Les Cases dels Cargols destaquen per una façana modernista de composició simètrica, adaptada al xamfrà de l'Eixample. Formes orgàniques, elements vegetals i més de 400 cargols esculpits construeixen una ornamentació singular. El motiu del cargol, vinculat a l'origen pagès dels propietaris, dona identitat i ritme al conjunt.",
        provenance: {
          mappingRef: "TG020-R2 §Cases dels Cargols — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.1 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Glucosa és una tipografia contemporània que combina referents d'orígens diversos. La seva estructura es construeix amb traços ferms i decidits, però evita la rigidesa gràcies a un acabat orgànic: cantonades lleugerament arrodonides, punts quadrats i formes erosionades. El resultat és net a gran escala, suau en el detall i ple de caràcter.",
        provenance: {
          mappingRef: "TG020-R2 §Glucosa — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.2 > CARÀCTERS",
        },
      },
      dialogueCopy: {
        displayText:
          "La relació amb l'edifici neix del contrast entre estructura i ornament. Els eixos verticals de columnes, pilastres i balcons equivalen als traços ferms de Glucosa, mentre que els volums corbats i els motius vegetals introdueixen la seva dimensió orgànica. En tots dos casos, una construcció clara se suavitza amb detalls expressius que aporten ritme, singularitat i identitat.",
        provenance: {
          mappingRef: "TG020-R2 §Glucosa — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.2 > DIÀLEG",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Hi ha una sensació d'harmonia i un ritme ininterromput que recorre tot el conjunt.",
        attribution: "Frederic W. Goudy",
        bibliographicContext: "Typologia, 1940.",
        provenance: {
          mappingRef: "TG020-R2 §Glucosa — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.2 > Cita",
        },
      },
    },
  },
  {
    slug: "casa-rodriguez-arias",
    identity: {
      name: "Casa Rodríguez Arias",
      date: { year: 1931, displayLabel: "1931" },
      architect: "Germà Rodríguez Arias",
      address: "Vía Augusta 61",
    },
    experienceType: "physical_digital",
    architecture: { movement: "Racionalisme (GATPAC)", movementStatus: "verified" },
    typography: {
      primaryFamily: "Arboria",
      designer: "José Manuel Urós",
      sourceUrl: "https://type-o-tones.com/fonts/arboria",
      secondaryStatus: "parked",
      secondarySourceNoted: true,
      classification: "Sans Serif Geomètrica d'Arrel Grotesca",
      year: 2013,
    },
    correlation: {
      sourceRationale:
        "Arboria dialoga amb la Casa Rodríguez Arias a través d'una geometria ordenada que admet desviacions expressives. Els traços regulars i les contraformes remeten al pla d'estuc, les finestres horitzontals i els elements estandarditzats de la façana. Alhora, els motius art déco i els gestos humanistes equivalen a les petites asimetries dels balcons, que introdueixen dinamisme sense trencar l'equilibri.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.151595,
      latitude: 41.399936,
      zoom: 17,
      provenance:
        'La Casa de la Arquitectura, "Casa Rodríguez Arias". That record displays "Vi. Augusta, 62"; Wikimedia heritage data identifies the same building at Via Augusta 61. The recovered source address (Vía Augusta 61) is preserved as-is — the 61/62 discrepancy is not silently reconciled.',
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText: "La geometria és el llenguatge de l'home",
        attribution: "Le Corbusier",
        bibliographicContext: "Vers une architecture, 1923",
        provenance: {
          mappingRef: "TG020-R2 §Casa Rodríguez Arias — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.3 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Edifici d'habitatges entre mitgeres, projectat en el context del racionalisme internacional dels anys vint i trenta impulsat a Catalunya pel GATPAC.",
        provenance: {
          mappingRef: "§5 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La Casa Rodríguez Arias és un exemple d'arquitectura racionalista basada en la geometria, la modularitat i la simplicitat. La façana combina murs, finestres i balcons sense ornamentació, ordenats mitjançant mides estandarditzades. La variació en l'amplada dels balcons introdueix una subtil asimetria dins d'una composició essencialment regular.",
        provenance: {
          mappingRef: "TG020-R2 §Casa Rodríguez Arias — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.3 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Arboria és una sans serif nascuda de la transformació d'una tipografia arquitectònica arquetípica i de l'exploració del llenguatge grotesc. La base geomètrica es tempera amb motius art déco i detalls humanistes, que n'eviten la fredor. El resultat combina claredat, regularitat i una personalitat expressiva, apta tant per a titulars com per a textos.",
        provenance: {
          mappingRef: "TG020-R2 §Arboria — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.4 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Les formes bàsiques de les lletres es poden canviar i continuar sent funcionals.",
        attribution: "Zuzana Licko",
        bibliographicContext: "entrevista de Rudy VanderLans, Emigre núm. 15, 1990.",
        provenance: {
          mappingRef: "TG020-R2 §Arboria — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.4 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "Arboria dialoga amb la Casa Rodríguez Arias a través d'una geometria ordenada que admet desviacions expressives. Els traços regulars i les contraformes remeten al pla d'estuc, les finestres horitzontals i els elements estandarditzats de la façana. Alhora, els motius art déco i els gestos humanistes equivalen a les petites asimetries dels balcons, que introdueixen dinamisme sense trencar l'equilibri.",
        provenance: {
          mappingRef: "TG020-R2 §Arboria — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.4 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "casa-de-la-marina",
    identity: {
      name: "Casa de la Marina",
      sourceName: "Casa de la Marina en la Barceloneta",
      date: { year: 1955, displayLabel: "1955" },
      architect: "José Antonio Coderch, Manuel Valls",
      address: "Paseo Juan de Borbón 43",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Racionalisme Català de Postguerra",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "AT Haüss",
      designer: "Pedro Arilla",
      sourceUrl: null,
      secondaryStatus: "parked",
      secondarySourceNoted: true,
      classification: "Sans Serif Neo Grotesca",
      year: 2022,
    },
    correlation: {
      sourceRationale:
        "La tipografia presenta formes sans serif netes i precises, connectades amb una façana organitzada mitjançant franges verticals i una repetició regular de lames. L'amplitud de pesos, d'Air a Super, dialoga amb l'alternança entre les gelosies lleugeres i els volums laterals massissos. En tots dos casos, proporció, ritme i estructura construeixen una identitat contemporània sense ornament superflu.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.188453,
      latitude: 41.377976,
      zoom: 17,
      provenance:
        'Inventrip Barcelona, "Marina\'s House", Pg Joan Borbó 42-43; independently confirmed by Arquitectura Catalana at Pg. Joan de Borbó 43.',
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Revaloració de les tècniques i materials tradicionals.",
        attribution: "Arquitectura catalana: de la postguerra al Grup R",
        bibliographicContext: "Enciclopèdia Catalana, 1998.",
        provenance: {
          mappingRef: "TG020-R2 §Casa de la Marina — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.5 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Edifici d'habitatges situat en una cantonada del barri de la Barceloneta, inscrit en el racionalisme català dels anys cinquanta.",
        provenance: {
          mappingRef: "§6 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La Casa de la Marina expressa el racionalisme català dels anys cinquanta a través d'una façana marcada pel ritme vertical de lames i franges de ceràmica vidriada. A l'interior, murs oblics de càrrega generen una estructura que optimitza l'espai i permet fer grans obertures als habitatges de les cantonades.",
        provenance: {
          mappingRef: "TG020-R2 §Casa de la Marina — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.5 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "At Haüss és una tipografia neo-grotesca contemporània que reinterpreta els models de mitjan segle XX sense nostàlgia. La seva estructura sòlida i equilibrada combina puresa formal, elegància i gran eficàcia comunicativa. Els seus vint estils van de la delicadesa d'Air a la robustesa de Super, amb eixos variables de pes i cursiva.",
        provenance: {
          mappingRef: "TG020-R2 §AT Haüss — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.6 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText: "L'essència de la Nova Tipografia és la claredat.",
        attribution: "Jan Tschichold",
        bibliographicContext: "Die neue Typographie, 1928.",
        provenance: {
          mappingRef: "TG020-R2 §AT Haüss — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.6 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "La tipografia presenta formes sans serif netes i precises, connectades amb una façana organitzada mitjançant franges verticals i una repetició regular de lames. L'amplitud de pesos, d'Air a Super, dialoga amb l'alternança entre les gelosies lleugeres i els volums laterals massissos. En tots dos casos, proporció, ritme i estructura construeixen una identitat contemporània sense ornament superflu.",
        provenance: {
          mappingRef: "TG020-R2 §AT Haüss — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.6 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "cocheras-de-sarria",
    identity: {
      name: "Cotxeres de Sarrià",
      sourceName: "Viviendas Cocheras de Sarriá",
      date: { year: 1970, displayLabel: "1970" },
      architect: "José Antonio Coderch",
      address: "Passeig Manuel Girona",
    },
    experienceType: "physical_digital",
    // TG012 §21.2: accepted final editorial movement label, superseding the
    // TG005 `tbd` placeholder. See handoff §3.4 for the prior TBD status.
    architecture: { movement: "Racionalisme Català", movementStatus: "verified" },
    typography: {
      primaryFamily: "Aribau Grotesk",
      designer: "Eduardo Manso",
      sourceUrl: "https://emtype.net/fonts/aribau-grotesk",
      secondaryStatus: "parked",
      classification: "Sans Serif Grotesca — Geomètrica",
      year: 2018,
    },
    correlation: {
      sourceRationale:
        "A les Cotxeres de Sarrià, la repetició dels edificis dentats construeix ritme, mentre els desplaçaments entre blocs obren carrers per a vianants i espais enjardinats. Aribau Grotesk hi dialoga amb una estructura clara i reiterada: les proporcions amples i les contraformes obertes donen aire al conjunt, i els detalls geomètrics introdueixen variació sense trencar-ne la unitat.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.127607417,
      latitude: 41.392270455,
      zoom: 16,
      provenance:
        'La Casa de la Arquitectura, "Bloques de viviendas Cotxeres de Sarrià", p.º de Manuel Girona 63. This is an ensemble, not a single-doorway centroid; external sources also describe a wider address range — treat this point as the ensemble navigation anchor.',
      status: "verified_external_building",
      precision: "architectural ensemble",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText:
          "L'urbanisme de qualitat neix d'una arquitectura de qualitat.",
        attribution: "Síntesi de l'ideari de J. A. Coderch.",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020-R2 §Cotxeres de Sarrià — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.7 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Conjunt d'habitatges plurifamiliars construït sobre els terrenys de les antigues cotxeres d'autobusos de Sarrià, organitzat com una macroilla amb carrers per a vianants i espais enjardinats.",
        provenance: {
          mappingRef: "§7 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Les Cotxeres de Sarrià representen l'evolució del racionalisme català dels anys setanta, vinculat a l'Escola de Barcelona. Els edificis dentats articulen les façanes i dibuixen carrers per a vianants amb espais enjardinats, amb una composició basada en la repetició i el ritme. El maó vist reforça el caràcter paisatgístic i unitari del conjunt.",
        provenance: {
          mappingRef: "TG020-R2 §Cotxeres de Sarrià — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.7 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Aribau Grotesk neix de la intersecció entre les tipografies geomètriques i les grotesques. Combina un contrast baix i proporcions amples amb trets de les grotesques americanes de començament del segle XX, com les contraformes obertes i la «g» de dos pisos. Les formes netes i els punts circulars li aporten un caràcter amable i contemporani.",
        provenance: {
          mappingRef: "TG020-R2 §Aribau Grotesk — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.8 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Penso la forma d'una lletra com si fos un esquelet revestit de maneres diferents.",
        attribution: "Margaret Calvert",
        bibliographicContext: "entrevista a The Guardian, 2026",
        provenance: {
          mappingRef: "TG020-R2 §Aribau Grotesk — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.8 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "A les Cotxeres de Sarrià, la repetició dels edificis dentats construeix ritme, mentre els desplaçaments entre blocs obren carrers per a vianants i espais enjardinats. Aribau Grotesk hi dialoga amb una estructura clara i reiterada: les proporcions amples i les contraformes obertes donen aire al conjunt, i els detalls geomètrics introdueixen variació sense trencar-ne la unitat.",
        provenance: {
          mappingRef: "TG020-R2 §Aribau Grotesk — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.8 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "hotel-arts",
    identity: {
      name: "Hotel Arts",
      sourceName: "Hotel Arts Villa Olímpica",
      // TG020-R2 PDF_CANON_SUSPECT finding: the PDF prints "Bruce Graham,
      // 1925" as the building's structured date metadata, while the same
      // panel's FORMA text describes the building in the context of the
      // Barcelona 1992 Olympics — a PDF-internal inconsistency. The PDF is
      // canon per R2 §1, so 1925 stands here rather than the prior 1992
      // until OPERATOR explicitly authorizes a different reading. See
      // ADGARC_TG020_R2_PHYSICAL_CANON_RECONCILIATION_v1.0.md §10.1.
      date: { year: 1925, displayLabel: "1925" },
      architect: "Bruce Graham",
      address: "Villa Olímpica",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "High Tech",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Mecano",
      designer: "Andreu Balius",
      sourceUrl: "https://typerepublic.com/fonts/mecano/",
      secondaryStatus: "parked",
      classification: "Sans Serif Geomètrica de Caràcter Display",
      year: 2007,
    },
    correlation: {
      sourceRationale:
        "Mecano dialoga amb l'Hotel Arts mitjançant un llenguatge geomètric, mecànic i tecnològic. Les astes verticals evoquen l'esveltesa de la torre, mentre que les diagonals de lletres com K, V, W i X ressonen amb les creus de l'exoesquelet d'acer. El contrast entre pesos i les contraformes àmplies reprodueix l'equilibri entre vidre, estructura, buit i solidesa.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.19622,
      latitude: 41.38689,
      zoom: 16.5,
      provenance:
        "Mapcarta/OpenStreetMap-derived Hotel Arts building record (way 35816740). The recovered spreadsheet address is broad; this point identifies the named building.",
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "He avançat cap a una arquitectura llegible, en la que qualsevol pugui comprendre totes les peçes de l'edifici.",
        attribution: "Richard Rogers",
        bibliographicContext: "El País, 1987.",
        provenance: {
          mappingRef: "TG020-R2 §Hotel Arts — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.9 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Hotel construït durant la transformació de Barcelona vinculada als Jocs Olímpics de 1992. La seva altura i presència el converteixen en una fita urbana del front marítim.",
        provenance: {
          mappingRef: "§8 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1-2",
        },
      },
      architectureCopy: {
        displayText:
          "L'Hotel Arts és un exemple d'arquitectura High Tech sorgit en el context de la transformació de la Barcelona dels Jocs Olímpics del 1992. La seva gran altura el converteix en una fita urbana. L'estructura metàl·lica exterior expressa el protagonisme de la tecnologia i permet més flexibilitat en la distribució interior de l'edifici.",
        provenance: {
          mappingRef: "TG020-R2 §Hotel Arts — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.9 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Mecano és una sans serif geomètrica de formes netes, àmplies i nítides. El seu dibuix transforma l'imaginari de la tecnologia mecànica en un alfabet de caràcter futurista, amb ecos de la ciència-ficció, el cinema de sèrie B i la cultura pop. Els cinc pesos permeten modular-ne la presència, de l'UltraLight al Black, mantenint una identitat precisa i juganera.",
        provenance: {
          mappingRef: "TG020-R2 §Mecano — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.10 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Hem de pensar en termes dels nostres mitjans electrònics i formes d'expressió contemporànies.",
        attribution: "Wim Crouwel",
        bibliographicContext:
          "“Type Design for the Computer Age”, Visible Language, vol. 4, núm. 1, 1970.",
        provenance: {
          mappingRef: "TG020-R2 §Mecano — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.10 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "Mecano dialoga amb l'Hotel Arts mitjançant un llenguatge geomètric, mecànic i tecnològic. Les astes verticals evoquen l'esveltesa de la torre, mentre que les diagonals de lletres com K, V, W i X ressonen amb les creus de l'exoesquelet d'acer. El contrast entre pesos i les contraformes àmplies reprodueix l'equilibri entre vidre, estructura, buit i solidesa.",
        provenance: {
          mappingRef: "TG020-R2 §Mecano — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.10 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "illa-diagonal",
    identity: {
      name: "L'Illa Diagonal",
      date: { year: 1988, displayLabel: "1988" },
      architect: "Rafael Moneo, Manuel S. Morales",
      address: "Avenida Diagonal 577",
    },
    experienceType: "physical_digital",
    // TG020-R2: PDF prints the movement as "POST_MODERNISME" (graphic
    // underscore treatment normalized to display capitalization per
    // ADGARC_TG020_R2_PHYSICAL_CANON_RECONCILIATION_v1.0.md §2/§6).
    architecture: {
      movement: "Postmodernisme",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Tochana",
      designer: "Marc Salinas",
      sourceUrl: null,
      secondaryStatus: "parked",
      classification: "Sans Serif Geomètrica",
      year: 2025,
    },
    correlation: {
      sourceRationale:
        "Tochana dialoga amb L'Illa Diagonal mitjançant una construcció geomètrica i modular. Les astes rectes i les contraformes rectangulars evoquen el ritme de les finestres, mentre la variació de pesos remet a l'alternança entre ple i buit. La rigidesa genera tensió i moviment, com el «gratacel abatut» varia alçades i reculades per evitar la monotonia.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.13519,
      latitude: 41.38954,
      zoom: 16,
      provenance:
        "Mapcarta/OpenStreetMap-derived \"L'illa Diagonal\" architectural ensemble. Public/current address records frequently use Av. Diagonal 557 while the recovered spreadsheet says 577 — the recovered source address is preserved unchanged; the discrepancy is recorded here as provenance metadata only, per the evidence pack's post-meeting follow-up.",
      status: "verified_external_building",
      precision: "architectural ensemble",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText: "Un gratacel abatut",
        attribution: "Joan Roig",
        bibliographicContext: "en referència a L'Illa Diagonal a El País, 1999.",
        provenance: {
          mappingRef: "TG020-R2 §L'Illa Diagonal — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.11 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Edifici de més de 300 metres de longitud destinat a galeries comercials, hotel, oficines i aparcament, concebut com una de les grans operacions urbanes de la Barcelona del 1992.",
        provenance: {
          mappingRef: "§9 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1-2",
        },
      },
      architectureCopy: {
        displayText:
          "L'Illa Diagonal és una de les grans operacions urbanes de la Barcelona del 1992. Concebuda com un \"gratacel abatut\", combina diferents alçades i reculades per evitar la monotonia. La façana alterna sòlid i buit amb un ritme regular de finestres modulades, mentre la planta baixa comercial prolonga l'espai públic cap a l'interior.",
        provenance: {
          mappingRef: "TG020-R2 §L'Illa Diagonal — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.11 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Tochana neix com a tipografia corporativa d'un campió mundial de biketrial. El seu caràcter contundent i auster es construeix amb formes geomètriques, traços angulars i una estructura rígida que transmeten força, precisió i equilibri. Cada lletra expressa la tensió entre estabilitat i moviment, així com el risc, el control i l'exigència física de la disciplina.",
        provenance: {
          mappingRef: "TG020-R2 §Tochana — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.12 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Les formes bàsiques de les lletres es poden canviar i continuar sent funcionals.",
        attribution: "Zuzana Licko",
        bibliographicContext: "entrevista de Rudy VanderLans, Emigre núm. 15, 1990.",
        provenance: {
          mappingRef: "TG020-R2 §Tochana — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.12 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "Tochana dialoga amb L'Illa Diagonal mitjançant una construcció geomètrica i modular. Les astes rectes i les contraformes rectangulars evoquen el ritme de les finestres, mentre la variació de pesos remet a l'alternança entre ple i buit. La rigidesa genera tensió i moviment, com el «gratacel abatut» varia alçades i reculades per evitar la monotonia.",
        provenance: {
          mappingRef: "TG020-R2 §Tochana — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.12 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "dhub",
    identity: {
      name: "DHub Barcelona",
      sourceName: "DHub",
      date: { year: 2014, displayLabel: "2014" },
      architect: "MBM Arquitectes",
      address: "Plaça de les Glòries Catalanes, 38, 08018 Barcelona",
    },
    experienceType: "physical_digital",
    // TG012 §21.2: accepted final editorial movement label, superseding the
    // TBD placeholder discussed at handoff §12. Traits are the formal
    // observations the source pairing rationale itself makes, not an
    // invented history.
    architecture: {
      movement: "Arquitectura Contemporània Neoindustrial",
      movementStatus: "verified",
      traits: [
        "geometric volumes",
        "sharp, pronounced angles",
        "inclined planes",
        "cantilevers and overhangs",
        "structural contrast between volumes",
      ],
    },
    typography: {
      primaryFamily: "ASM",
      designer: "Iñigo Jerez",
      sourceUrl: null,
      secondaryStatus: "parked",
      classification: "Sans Serif Monoespaiada",
      year: 2008,
    },
    correlation: {
      sourceRationale:
        "ASM dialoga amb el DHUB a través d'una geometria industrial construïda com a sistema. L'amplada constant dels caràcters remet a la modulació de la façana, mentre que les diagonals i les cursives troben correspondència en els biaixos del volum emergent. El subratllat es relaciona amb l'horitzontalitat de la plataforma urbana, que connecta edifici, espai públic i ciutat.",
      provenance: PDF_SOURCE,
    },
    // Existing product/prototype coordinate adopted and visually corrected
    // during TG004 — not sourced from the spreadsheet. See handoff §11.
    // TG006D: the official Disseny Hub Barcelona "Getting here / Com
    // arribar-hi" page independently publishes this exact value, so it is
    // now additionally the evidence pack's `verified_official` anchor —
    // the coordinate itself is unchanged and remains the editorial home.
    coordinates: {
      longitude: 2.1880918,
      latitude: 41.402451,
      zoom: 16.5,
      provenance: `${PROTOTYPE_COORDINATE}; confirmed exactly by the Disseny Hub Barcelona official "Getting here / Com arribar-hi" page.`,
      status: "verified_official",
      precision: "institution/building",
    },
    heroMedia: null,
    editorial: true,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText: "L'espai públic és la ciutat.",
        attribution: "Oriol Bohigas",
        bibliographicContext: "pròleg a L'espai públic: ciutat i ciutadania, 2001.",
        provenance: {
          mappingRef: "TG020-R2 §DHub Barcelona — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.13 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Equipament urbà dedicat al disseny, l'art i la cultura, concebut com un dels principals centres d'activitat d'aquest àmbit a Barcelona.",
        provenance: {
          mappingRef: "§10 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1 first sentence",
        },
      },
      architectureCopy: {
        displayText:
          "El DHub Barcelona destaca per una arquitectura avantguardista de caràcter industrial, definida per formes anguloses i una façana revestida de zinc. El projecte combina un gran volum en volada amb un cos semisoterrat, connectats per un ampli vestíbul concebut com un \"atri urbà\" que integra l'edifici amb la ciutat.",
        provenance: {
          mappingRef: "TG020-R2 §DHub Barcelona — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.13 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "ASM és una sans serif monoespaiada, enèrgica i molt llegible, creada com a tipografia corporativa d'Arts Santa Mònica. L'amplada constant dels caràcters construeix un ritme estable i d'aparença industrial. Els pesos Regular i Bold, les cursives i les versions subratllades formen un sistema flexible, en què el subratllat deixa de ser un recurs auxiliar per convertir-se en signe identitari.",
        provenance: {
          mappingRef: "TG020-R2 §ASM — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.14 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText: "La tipografia és llenguatge visible.",
        attribution: "Erik Spiekermann",
        bibliographicContext: "Beyond Tellerrand, 2014.",
        provenance: {
          mappingRef: "TG020-R2 §ASM — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.14 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "ASM dialoga amb el DHUB a través d'una geometria industrial construïda com a sistema. L'amplada constant dels caràcters remet a la modulació de la façana, mentre que les diagonals i les cursives troben correspondència en els biaixos del volum emergent. El subratllat es relaciona amb l'horitzontalitat de la plataforma urbana, que connecta edifici, espai públic i ciutat.",
        provenance: {
          mappingRef: "TG020-R2 §ASM — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.14 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "la-borda",
    identity: {
      name: "La Borda",
      sourceName: "Cooperativa de Vivienda La Borda",
      date: { year: 2018, displayLabel: "2018" },
      architect: "Estudi Lacol Arquitectura Cooperativa",
      // TG019 Pass B (operator feedback §4 / 00_AUTHORITY.md): the recovered
      // spreadsheet left this blank, so it stayed null through TG018 (see the
      // geo-coordinate provenance note below — that external address was
      // deliberately kept out of the product as unverified enrichment). This
      // exact string is the operator's own explicit, one-off authorization —
      // the only content mutation TG019 authorizes in this file.
      address: "Carrer de la Constitució, 85-89, 08014",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Nova Bauhaus Europea",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Geogrotesque Stencil",
      designer: "Eduardo Manso",
      sourceUrl: "https://emtype.net/fonts/geogrotesque-stencil",
      secondaryStatus: "parked",
      classification: "Sans Serif Stencil",
      year: 2009,
    },
    correlation: {
      sourceRationale:
        "El diàleg neix d'una construcció basada en peces, obertures i continuïtats. Els talls de les lletres evoquen els buits entre habitatges, passeres i tancaments; les astes, la trama estructural de fusta. Com a La Borda, cada element conserva la seva identitat mentre participa d'un sistema comú, on el buit articula relacions, circulació propera i vida col·lectiva.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.1348191305,
      latitude: 41.369624723,
      zoom: 17,
      provenance:
        'La Casa de la Arquitectura, "La Borda housing cooperative", Carrer de la Constitució 85. The recovered spreadsheet address is empty, so this external address is stored only as enrichment/provenance here — never presented as recovered-source data.',
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        // TG020-R2 CRITICAL QUOTE-STATUS CORRECTION: the PDF marks this
        // phrase a printed synthesis of Lacol's own ideari, not a literal
        // quotation — see R2 authority doc §6 case 08 / prompt "Critical
        // quote-status correction".
        kind: "synthesis",
        displayText: "L'arquitectura no és un fi; és una eina.",
        attribution: "Síntesi de l'ideari de Lacol",
        bibliographicContext: "Web Lacol, consulta: 2026.",
        provenance: {
          mappingRef: "TG020-R2 §La Borda — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.15 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Projecte d'habitatge cooperatiu amb espais comunitaris compartits, concebut per facilitar l'accés a un habitatge digne i assequible i allunyar-se del model especulatiu convencional.",
        provenance: {
          mappingRef: "§11 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1-2",
        },
      },
      architectureCopy: {
        displayText:
          "La Borda és un projecte d'habitatge cooperatiu basat en la inclusió, la vida comunitària i l'accessibilitat. Construït principalment amb fusta, integra 28 habitatges amb espais compartits com cuina, bugaderia, horts i pati central. El disseny bioclimàtic aprofita l'energia solar i la ventilació creuada, combinant sostenibilitat i vida col·lectiva.",
        provenance: {
          mappingRef: "TG020-R2 §La Borda — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.15 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Geogrotesque Stencil és una sans serif de display que trasllada la construcció semimodular i els acabats subtilment arrodonits de Geogrotesque al llenguatge de plantilla. Les obertures interrompen els traços sense desfer la unitat dels glifs. Les tres amplades de tall —A, B i C— permeten adaptar-la tant a l'escala d'impressió com a la rigidesa del suport.",
        provenance: {
          mappingRef: "TG020-R2 §Geogrotesque Stencil — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.16 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText: "El blanc de la paraula és el meu únic punt de suport.",
        attribution: "Gerrit Noordzij",
        bibliographicContext: "The Stroke: Theory of Writing, 2005.",
        provenance: {
          mappingRef: "TG020-R2 §Geogrotesque Stencil — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.16 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "El diàleg neix d'una construcció basada en peces, obertures i continuïtats. Els talls de les lletres evoquen els buits entre habitatges, passeres i tancaments; les astes, la trama estructural de fusta. Com a La Borda, cada element conserva la seva identitat mentre participa d'un sistema comú, on el buit articula relacions, circulació propera i vida col·lectiva.",
        provenance: {
          mappingRef: "TG020-R2 §Geogrotesque Stencil — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.16 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "biblioteca-ggm",
    identity: {
      name: "Biblioteca Gabriel García Márquez",
      sourceName: "Biblioteca Grabiel Garcia Marquez",
      // TG012 §21.2: accepted final editorial year, superseding the prior
      // recovered-source value.
      date: { year: 2022, displayLabel: "2022" },
      architect: "SUMA Arquitectura",
      address: "C/ del Treball, 219",
    },
    experienceType: "physical_digital",
    // TG012 §21.2: accepted final editorial movement label, superseding the
    // TG005 `tbd` placeholder. TG020-R2: PDF prints this movement as
    // "NUEVA BAUHAUS EUROPEA" (Spanish "Nueva"), unlike La Borda/GREENH@USE's
    // Catalan "Nova" on their own panels — kept exactly as printed per R2
    // §10.3, not silently normalized to match the other two.
    architecture: {
      movement: "Nueva Bauhaus Europea",
      movementStatus: "verified",
    },
    typography: {
      // TG020-R2 PDF_INTERNAL_CONFLICT: the structured designer-metadata
      // field prints "LAURA MESSEGUER" (double s) while the typography
      // quote's own attribution line prints "Laura Meseguer" (single s) —
      // both preserved verbatim in their respective fields rather than
      // silently reconciled. See R2 §6 case 09 / §10.2.
      primaryFamily: "Sisters",
      designer: "Laura Messeguer",
      sourceUrl: "https://type-o-tones.com/fonts/sisters",
      secondaryStatus: "parked",
      classification: "Sans Serif Display Stencil",
      year: 2020,
    },
    correlation: {
      sourceRationale:
        "Sisters dialoga amb la biblioteca a partir d'una lògica comuna de peces relacionades però diferents. Els quatre estils comparteixen estructura, com els volums apilats que formen l'edifici. Les obertures stencil troben correspondència en els plecs, perforacions i buits de la façana, mentre la combinació de variants tipogràfiques evoca una arquitectura unitària, diversa i construïda per capes.",
      provenance: PDF_SOURCE,
    },
    coordinates: {
      longitude: 2.199927,
      latitude: 41.417132,
      zoom: 17,
      provenance:
        "La Casa de la Arquitectura catalog entry for Biblioteca Gabriel García Márquez, C/ del Treball 219. Diputació de Barcelona open data independently publishes a near-identical location around 41.4171926, 2.1999465.",
      status: "verified_external_building",
      precision: "building",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Un volum escultòric inspirat en blocs de llibres apilats.",
        attribution: "Elena Orte i Guillermo Sevillano",
        bibliographicContext: "2022.",
        provenance: {
          mappingRef: "TG020-R2 §Biblioteca Gabriel García Márquez — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.17 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Biblioteca especialitzada en literatura llatinoamericana, dedicada a Gabriel García Márquez. El programa incorpora espais de lectura, àrea infantil, sala sensorial, espais polivalents i Ràdio Maconda.",
        provenance: {
          mappingRef: "§12 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La Biblioteca Gabriel García Márquez adapta el xamfrà barceloní a través d'un volum escultòric elevat sobre una plaça porticada. Un gran pati triangular articula els espais, aporta llum natural i afavoreix la ventilació. L'estructura de fusta redueix l'impacte ambiental i combina sostenibilitat i calidesa amb funcionalitat.",
        provenance: {
          mappingRef: "TG020-R2 §Biblioteca Gabriel García Márquez — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.17 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Sisters és una família display stencil de quatre estils en majúscules que comparteixen una mateixa base constructiva. Les variacions de contrast, pes i detall diferencien Sisters One, Two, Three i Four, concebudes per combinar-se sense perdre coherència. La seva energia neix precisament d'aquest equilibri entre parentiu i singularitat, amb influències industrials, modernes i art déco.",
        provenance: {
          mappingRef: "TG020-R2 §Sisters — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.18 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText:
          "Cada tipografia existeix dins d'una llarga conversa històrica.",
        attribution: "Laura Meseguer",
        bibliographicContext: "TypeParis, 2026.",
        provenance: {
          mappingRef: "TG020-R2 §Sisters — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.18 > Cita",
        },
      },
      // TG020-R2: superseded per authority §6 case 09 — the PDF's own
      // DIÀLEG argument (volums apilats / plecs / perforacions / buits)
      // replaces the prior lames/finestrals characterization O-039B
      // authorized; that operator decision no longer applies to this copy.
      dialogueCopy: {
        displayText:
          "Sisters dialoga amb la biblioteca a partir d'una lògica comuna de peces relacionades però diferents. Els quatre estils comparteixen estructura, com els volums apilats que formen l'edifici. Les obertures stencil troben correspondència en els plecs, perforacions i buits de la façana, mentre la combinació de variants tipogràfiques evoca una arquitectura unitària, diversa i construïda per capes.",
        provenance: {
          mappingRef: "TG020-R2 §Sisters — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.18 > DIÀLEG",
        },
      },
    },
  },
  {
    slug: "green-use-22",
    identity: {
      name: "GREENH@USE",
      sourceName: "Grenh@Use 140 22@",
      date: { year: 2025, displayLabel: "2025" },
      architect: "Peris+Toral Arquitectes",
      address: "carrer Veneçuela 100,106 c/de l'Agricultura 92",
    },
    experienceType: "physical_digital",
    // TG012 §21.2: accepted final editorial movement label, superseding the
    // TG005 `tbd` placeholder. TG020-R2: PDF prints Catalan "NOVA" on this
    // panel (matching La Borda), distinct from Biblioteca's Spanish
    // "NUEVA" — see R2 §10.3.
    architecture: {
      movement: "Nova Bauhaus Europea",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Bulevar",
      designer: "Atipo Foundry",
      sourceUrl: null,
      secondaryStatus: "parked",
      classification: "Sans Serif Grotesca Supercondensada",
      year: 2022,
    },
    correlation: {
      sourceRationale:
        "La construcció estreta i modulada de Bulevar dialoga amb la façana de GREENH@USE, articulada per la repetició de pilars, gelosies i obertures verticals. Les astes compactes evoquen l'estructura, mentre que les contraformes remeten als buits de les finestres. En tots dos casos, l'espai no és residual: els intervals entre ple i buit ordenen el conjunt i converteixen la repetició modular en ritme, combinant solidesa, permeabilitat i expressivitat urbana.",
      provenance: PDF_SOURCE,
    },
    // PROVISIONAL — a street-level demo/navigation anchor only, not yet a
    // verified building centroid. Never render/describe this coordinate as
    // exact or verified anywhere in the UI. Required follow-up per the
    // evidence pack: replace with a `verified_external_building` coordinate
    // once an exact building/object location is sourced.
    coordinates: {
      longitude: 2.2125247,
      latitude: 41.41395266,
      zoom: 15.5,
      provenance:
        'Premis FAD confirms the project as "Greenh@Use 140 Viviendas Sociales en 22@" at carrer Veneçuela 100,106 c/de l\'Agricultura 92; other public project sources confirm the broader "Veneçuela 96-106" address. External street geodata places Carrer de Veneçuela around this point — the exact building centroid has not yet been independently verified.',
      status: "provisional_external_street",
      precision: "street",
    },
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "literal_quote",
        displayText: "Posar en plural l'habitar és compartir.",
        attribution: "Marta Peris i José Toral",
        bibliographicContext: "2022.",
        provenance: {
          mappingRef: "TG020-R2 §GREENH@USE — Cita arquitectura",
          sourceLocator: "P2Totems_A&T.pdf p.19 > Cita",
        },
      },
      buildingProse: {
        displayText:
          "Edifici d'habitatge social integrat en un xamfrà de l'Eixample de Cerdà. Combina habitatges per a persones grans, lloguer social i allotjaments temporals per respondre a necessitats diverses.",
        provenance: {
          mappingRef: "§13 > 1C L'edifici",
          sourceLocator: "main .md > Descripció WEB ¶1-2",
        },
      },
      architectureCopy: {
        displayText:
          "GreenH@use és un projecte d'habitatge social integrat en un xamfrà de l'Eixample de Barcelona al Poble Nou. Els habitatges s'organitzen al voltant de patis interiors que afavoreixen la llum i la ventilació natural. Passarel·les comunitàries, gelosies de fusta i una coberta vidriada configuren un sistema bioclimàtic que combina confort, privacitat i eficiència energètica al conjunt.",
        provenance: {
          mappingRef: "TG020-R2 §GREENH@USE — Forma",
          sourceLocator: "P2Totems_A&T.pdf p.19 > FORMA",
        },
      },
      typographyCopy: {
        displayText:
          "Bulevar és una tipografia display supercondensada, potent i enèrgica, que porta al límit l'herència de les grotesques de cartell del segle XX. Les seves formes estretes combinen grans masses negres amb contraformes precises, corbes i una construcció modulada. La verticalitat dominant i els caràcters alternatius li aporten ritme, tensió i una personalitat contemporània, especialment efectiva en titulars.",
        provenance: {
          mappingRef: "TG020-R2 §Bulevar — Caràcters",
          sourceLocator: "P2Totems_A&T.pdf p.20 > CARÀCTERS",
        },
      },
      typographyHighlightedPhrase: {
        kind: "literal_quote",
        displayText: "L'espai en tipografia és com el temps en la música.",
        attribution: "Robert Bringhurst",
        bibliographicContext: "The Elements of Typographic Style, 1992.",
        provenance: {
          mappingRef: "TG020-R2 §Bulevar — Cita tipografia",
          sourceLocator: "P2Totems_A&T.pdf p.20 > Cita",
        },
      },
      dialogueCopy: {
        displayText:
          "La construcció estreta i modulada de Bulevar dialoga amb la façana de GREENH@USE, articulada per la repetició de pilars, gelosies i obertures verticals. Les astes compactes evoquen l'estructura, mentre que les contraformes remeten als buits de les finestres. En tots dos casos, l'espai no és residual: els intervals entre ple i buit ordenen el conjunt i converteixen la repetició modular en ritme, combinant solidesa, permeabilitat i expressivitat urbana.",
        provenance: {
          mappingRef: "TG020-R2 §Bulevar — Diàleg",
          sourceLocator: "P2Totems_A&T.pdf p.20 > DIÀLEG",
        },
      },
    },
  },
  // ---------------------------------------------------------------------
  // TG020 Phase 1 — 21 digital_only cases (ADGARC_TG020_PHASE1_AUTHORITY_v1.0
  // "New digital order" §11-31; editorial fiches transcribed/segmented from
  // ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md, Walden 7 authored per the
  // authority doc's own completion section). No geocoding in this phase —
  // `coordinates` stays null for all 21, and `address` stays null since the
  // source fiches name buildings, not street addresses (never fabricated).
  // `highlightedPhrase.kind` is "synthesis" throughout per the authority's
  // "do not interpret Frase destacada as proof of a literal quote" rule —
  // even where a fiche implies a named quote source, this source document
  // alone is not independent literal-quote authority.
  // ---------------------------------------------------------------------
  {
    slug: "pavello-mies-van-der-rohe",
    identity: {
      name: "Pavelló Mies van der Rohe",
      date: { year: 1929, displayLabel: "1929" },
      architect: "Ludwig Mies van der Rohe",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Estil Internacional", movementStatus: "verified" },
    typography: {
      primaryFamily: "Futura",
      designer: "Paul Renner",
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "Aquest pavelló, construït per representar Alemanya a l'Exposició Internacional de 1929, exemplifica la màxima del seu arquitecte: “less is more”. Materials nobles com el marbre i l'acer, combinats amb línies netes i horitzontals, defineixen un espai que prioritza la puresa formal i la llibertat visual.\n\n" +
        "La tipografia Futura, contemporània al pavelló, tradueix aquesta mateixa voluntat de simplicitat i ordre a través de formes geomètriques pures. És una tipografia sense floritures, precisa i atemporal. Arquitectura i lletra caminen aquí en paral·lel cap a la modernitat.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Menys és més.",
        attribution: "Síntesi, ideari de Mies van der Rohe",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 1: Pavelló Mies van der Rohe",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 1 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "Aquest pavelló, construït per representar Alemanya a l'Exposició Internacional de 1929, exemplifica la màxima del seu arquitecte: “less is more”.",
        provenance: {
          mappingRef: "TG020 §Fitxa 1: Pavelló Mies van der Rohe",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 1 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Materials nobles com el marbre i l'acer, combinats amb línies netes i horitzontals, defineixen un espai que prioritza la puresa formal i la llibertat visual.",
        provenance: {
          mappingRef: "TG020 §Fitxa 1: Pavelló Mies van der Rohe",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 1 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia Futura, contemporània al pavelló, tradueix aquesta mateixa voluntat de simplicitat i ordre a través de formes geomètriques pures. És una tipografia sense floritures, precisa i atemporal.",
        provenance: {
          mappingRef: "TG020 §Fitxa 1: Pavelló Mies van der Rohe",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 1 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "Arquitectura i lletra caminen aquí en paral·lel cap a la modernitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 1: Pavelló Mies van der Rohe",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 1 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "walden-7",
    identity: {
      name: "Walden 7",
      date: { year: 1975, displayLabel: "1975" },
      architect: "Ricardo Bofill / Taller de Arquitectura",
      address: null,
    },
    experienceType: "digital_only",
    architecture: {
      movement: "Brutalisme orgànic / arquitectura modular residencial",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Brut Grotesque",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "Walden 7 planteja l'habitatge col·lectiu com una estructura vertical formada per volums modulars, patis i recorreguts interconnectats. La massa ceràmica vermella, els grans buits interiors i l'acumulació de cossos converteixen l'edifici en una arquitectura contundent, però al mateix temps pensada per afavorir la vida comunitària.\n\n" +
        "Brut Grotesque trasllada aquesta contundència a la lletra: formes robustes, directes i de gran presència que funcionen gairebé com blocs construïts. El diàleg no depèn de l'ornament, sinó del pes, la repetició i la força estructural compartida entre edifici i tipografia.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Habitar en comunitat.",
        attribution: "Síntesi, Ricardo Bofill / Taller de Arquitectura",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 Authority §Walden 7 — authored completion",
          sourceLocator: "ADGARC_TG020_PHASE1_AUTHORITY_v1.0.md > Walden 7 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "Walden 7 planteja l'habitatge col·lectiu com una estructura vertical formada per volums modulars, patis i recorreguts interconnectats.",
        provenance: {
          mappingRef: "TG020 Authority §Walden 7 — authored completion",
          sourceLocator: "ADGARC_TG020_PHASE1_AUTHORITY_v1.0.md > Walden 7 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La massa ceràmica vermella, els grans buits interiors i l'acumulació de cossos converteixen l'edifici en una arquitectura contundent, però al mateix temps pensada per afavorir la vida comunitària.",
        provenance: {
          mappingRef: "TG020 Authority §Walden 7 — authored completion",
          sourceLocator: "ADGARC_TG020_PHASE1_AUTHORITY_v1.0.md > Walden 7 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Brut Grotesque trasllada aquesta contundència a la lletra: formes robustes, directes i de gran presència que funcionen gairebé com blocs construïts.",
        provenance: {
          mappingRef: "TG020 Authority §Walden 7 — authored completion",
          sourceLocator: "ADGARC_TG020_PHASE1_AUTHORITY_v1.0.md > Walden 7 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "El diàleg no depèn de l'ornament, sinó del pes, la repetició i la força estructural compartida entre edifici i tipografia.",
        provenance: {
          mappingRef: "TG020 Authority §Walden 7 — authored completion",
          sourceLocator: "ADGARC_TG020_PHASE1_AUTHORITY_v1.0.md > Walden 7 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "la-pedrera-casa-mila",
    identity: {
      name: "La Pedrera / Casa Milà",
      date: { year: 1912, displayLabel: "1906 - 1912" },
      architect: "Antoni Gaudí",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme orgànic", movementStatus: "verified" },
    typography: {
      primaryFamily: "Zaha Hadid Typeface",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La Pedrera és una obra mestra del modernisme, plena de corbes, formes orgàniques i una expressió gairebé escultòrica. Gaudí trenca amb la simetria clàssica i proposa una arquitectura fluida, inspirada en la natura.\n\n" +
        "La tipografia Zaha Hadid Typeface, igualment orgànica i fluida, tradueix en lletra aquest esperit: traços que flueixen com les façanes de l'edifici, allunyant-se de la rigidesa i celebrant el moviment.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "L'arquitectura és l'ordenació de la llum.",
        attribution: "Síntesi, ideari d'Antoni Gaudí",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 4: La Pedrera (Casa Milà)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 4 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "La Pedrera és una obra mestra del modernisme, plena de corbes, formes orgàniques i una expressió gairebé escultòrica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 4: La Pedrera (Casa Milà)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 4 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Gaudí trenca amb la simetria clàssica i proposa una arquitectura fluida, inspirada en la natura.",
        provenance: {
          mappingRef: "TG020 §Fitxa 4: La Pedrera (Casa Milà)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 4 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia Zaha Hadid Typeface, igualment orgànica i fluida, tradueix en lletra aquest esperit.",
        provenance: {
          mappingRef: "TG020 §Fitxa 4: La Pedrera (Casa Milà)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 4 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Traços que flueixen com les façanes de l'edifici, allunyant-se de la rigidesa i celebrant el moviment.",
        provenance: {
          mappingRef: "TG020 §Fitxa 4: La Pedrera (Casa Milà)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 4 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "torre-de-collserola",
    identity: {
      name: "Torre de Collserola",
      date: { year: 1992, displayLabel: "1992" },
      architect: "Norman Foster",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "High-Tech", movementStatus: "verified" },
    typography: {
      primaryFamily: "Eurostile",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "Dissenyada com a torre de telecomunicacions per als Jocs Olímpics de 1992, la Torre de Collserola és una estructura altament tecnològica, vertical i funcional. Situada al Tibidabo, combina estructura lleugera i eficiència màxima amb una presència simbòlica sobre la ciutat.\n\n" +
        "Eurostile és una tipografia d'esperit futurista, molt utilitzada en contextos tecnològics i industrials. Les seves formes quadrades i la seva aparença sòlida la fan idònia per representar aquest símbol high-tech de Barcelona.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Altura i tecnologia.",
        attribution: "Síntesi, Norman Foster",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 22: Torre de Collserola",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 22 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "Dissenyada com a torre de telecomunicacions per als Jocs Olímpics de 1992, la Torre de Collserola és una estructura altament tecnològica, vertical i funcional.",
        provenance: {
          mappingRef: "TG020 §Fitxa 22: Torre de Collserola",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 22 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Situada al Tibidabo, combina estructura lleugera i eficiència màxima amb una presència simbòlica sobre la ciutat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 22: Torre de Collserola",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 22 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Eurostile és una tipografia d'esperit futurista, molt utilitzada en contextos tecnològics i industrials.",
        provenance: {
          mappingRef: "TG020 §Fitxa 22: Torre de Collserola",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 22 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Les seves formes quadrades i la seva aparença sòlida la fan idònia per representar aquest símbol high-tech de Barcelona.",
        provenance: {
          mappingRef: "TG020 §Fitxa 22: Torre de Collserola",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 22 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "mercat-de-santa-caterina",
    identity: {
      name: "Mercat de Santa Caterina",
      date: { year: 2005, displayLabel: "2005 (reforma)" },
      architect: "Enric Miralles i Benedetta Tagliabue",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Arquitectura contemporània orgànica", movementStatus: "verified" },
    typography: {
      primaryFamily: "FF Blur",
      designer: "Neville Brody",
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "El Mercat de Santa Caterina va ser rehabilitat per oferir una nova mirada a un espai tradicional. La seva coberta acolorida, ondulada i gairebé viva, aporta un dinamisme visual que contrasta amb l'entorn històric i convida a reinterpretar la quotidianitat.\n\n" +
        "La tipografia FF Blur, creada per Neville Brody als anys 90, té una aparença fluida, borrosa i experimental que evoca molt bé l'energia visual del mercat. És una lletra en transformació constant, com l'espai del mercat que viu i es reinventa.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Tradició en moviment.",
        attribution: "Síntesi, Enric Miralles i Benedetta Tagliabue",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 20: Mercat de Santa Caterina",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 20 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "El Mercat de Santa Caterina va ser rehabilitat per oferir una nova mirada a un espai tradicional.",
        provenance: {
          mappingRef: "TG020 §Fitxa 20: Mercat de Santa Caterina",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 20 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La seva coberta acolorida, ondulada i gairebé viva, aporta un dinamisme visual que contrasta amb l'entorn històric i convida a reinterpretar la quotidianitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 20: Mercat de Santa Caterina",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 20 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia FF Blur, creada per Neville Brody als anys 90, té una aparença fluida, borrosa i experimental que evoca molt bé l'energia visual del mercat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 20: Mercat de Santa Caterina",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 20 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "És una lletra en transformació constant, com l'espai del mercat que viu i es reinventa.",
        provenance: {
          mappingRef: "TG020 §Fitxa 20: Mercat de Santa Caterina",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 20 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "macba",
    identity: {
      name: "MACBA",
      date: { year: 1995, displayLabel: "1995" },
      architect: "Richard Meier",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme racional blanc", movementStatus: "verified" },
    typography: {
      primaryFamily: "Helvetica Neue",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "El MACBA s'articula a partir de línies netes, superfícies blanques i una llum que es converteix en protagonista. L'edifici funciona com una caixa de llum, racional i clara, que reflecteix una arquitectura centrada en l'ordre i la contemplació.\n\n" +
        "La tipografia Helvetica Neue reforça aquesta mateixa idea: llegibilitat, neutralitat i equilibri. És una tipografia institucional i funcional que s'adapta perfectament al llenguatge clar i essencial del MACBA.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "La claredat és la nova bellesa.",
        attribution: "Síntesi, Richard Meier",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 5: MACBA",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 5 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "El MACBA s'articula a partir de línies netes, superfícies blanques i una llum que es converteix en protagonista.",
        provenance: {
          mappingRef: "TG020 §Fitxa 5: MACBA",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 5 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "L'edifici funciona com una caixa de llum, racional i clara, que reflecteix una arquitectura centrada en l'ordre i la contemplació.",
        provenance: {
          mappingRef: "TG020 §Fitxa 5: MACBA",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 5 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText: "La tipografia Helvetica Neue reforça aquesta mateixa idea: llegibilitat, neutralitat i equilibri.",
        provenance: {
          mappingRef: "TG020 §Fitxa 5: MACBA",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 5 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "És una tipografia institucional i funcional que s'adapta perfectament al llenguatge clar i essencial del MACBA.",
        provenance: {
          mappingRef: "TG020 §Fitxa 5: MACBA",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 5 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "casa-planells",
    identity: {
      name: "Casa Planells",
      date: { year: 1924, displayLabel: "1924" },
      architect: "Josep Maria Jujol",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme avançat / singular", movementStatus: "verified" },
    typography: {
      primaryFamily: "Didot",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La Casa Planells és una petita joia d'autor signada per Josep Maria Jujol, amb una planta triangular complexa i una façana elegantment corba. És un exemple d'inventiva arquitectònica dins les restriccions d'un espai molt limitat.\n\n" +
        "Didot, una tipografia d'alt contrast, refinada i clàssica, reflecteix la mateixa sensibilitat formal i sofisticació que Jujol aconsegueix amb pocs elements. Totes dues expressen una elegància arquitectònica i gràfica sense estridències.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Menys espai, més bellesa.",
        attribution: "Síntesi, Josep Maria Jujol",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 6: Casa Planells",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 6 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "La Casa Planells és una petita joia d'autor signada per Josep Maria Jujol, amb una planta triangular complexa i una façana elegantment corba.",
        provenance: {
          mappingRef: "TG020 §Fitxa 6: Casa Planells",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 6 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "És un exemple d'inventiva arquitectònica dins les restriccions d'un espai molt limitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 6: Casa Planells",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 6 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Didot, una tipografia d'alt contrast, refinada i clàssica, reflecteix la mateixa sensibilitat formal i sofisticació que Jujol aconsegueix amb pocs elements.",
        provenance: {
          mappingRef: "TG020 §Fitxa 6: Casa Planells",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 6 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "Totes dues expressen una elegància arquitectònica i gràfica sense estridències.",
        provenance: {
          mappingRef: "TG020 §Fitxa 6: Casa Planells",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 6 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "media-tic",
    identity: {
      name: "Media-TIC",
      date: { year: 2010, displayLabel: "2010" },
      architect: "Enric Ruiz-Geli (Cloud 9)",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Arquitectura paramètrica / ecològica", movementStatus: "verified" },
    typography: {
      primaryFamily: "Klim Geometric",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "El Media-TIC és un edifici tecnològic i sostenible, pioner en l'ús de façanes intel·ligents i materials avançats. La seva estructura reticulada i la pell translúcida responen a criteris científics i climàtics.\n\n" +
        "Klim Geometric és una tipografia moderna, precisa i digital, que s'alinea amb el caràcter innovador i experimental de l'edifici. Amb formes netes i simètriques, reflecteix la recerca d'eficiència i equilibri del disseny paramètric.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Arquitectura viva i adaptable.",
        attribution: "Síntesi, Enric Ruiz-Geli",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 7: Media-TIC",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 7 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "El Media-TIC és un edifici tecnològic i sostenible, pioner en l'ús de façanes intel·ligents i materials avançats.",
        provenance: {
          mappingRef: "TG020 §Fitxa 7: Media-TIC",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 7 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "La seva estructura reticulada i la pell translúcida responen a criteris científics i climàtics.",
        provenance: {
          mappingRef: "TG020 §Fitxa 7: Media-TIC",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 7 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Klim Geometric és una tipografia moderna, precisa i digital, que s'alinea amb el caràcter innovador i experimental de l'edifici.",
        provenance: {
          mappingRef: "TG020 §Fitxa 7: Media-TIC",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 7 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "Amb formes netes i simètriques, reflecteix la recerca d'eficiència i equilibri del disseny paramètric.",
        provenance: {
          mappingRef: "TG020 §Fitxa 7: Media-TIC",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 7 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "casa-bloc",
    identity: {
      name: "Casa Bloc",
      date: { year: 1936, displayLabel: "1933 - 1936" },
      architect: "Sert, Torres Clavé i Subirana",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Racionalisme social", movementStatus: "verified" },
    typography: {
      primaryFamily: "DIN",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La Casa Bloc va ser un projecte pioner d'habitatge social, dissenyat amb valors de funcionalitat, igualtat i racionalitat. Les línies són clares, les formes repetitives i els espais pensats per a la vida obrera digna.\n\n" +
        "La tipografia DIN (utilitzada en senyalització i normatives industrials) expressa aquests mateixos valors: sobrietat, eficiència, llegibilitat. És la lletra de les estructures clares i directes, com la pròpia Casa Bloc.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Viure amb dignitat.",
        attribution: "Síntesi, Sert, Torres Clavé i Subirana",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 8: Casa Bloc",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 8 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "La Casa Bloc va ser un projecte pioner d'habitatge social, dissenyat amb valors de funcionalitat, igualtat i racionalitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 8: Casa Bloc",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 8 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "Les línies són clares, les formes repetitives i els espais pensats per a la vida obrera digna.",
        provenance: {
          mappingRef: "TG020 §Fitxa 8: Casa Bloc",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 8 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia DIN (utilitzada en senyalització i normatives industrials) expressa aquests mateixos valors: sobrietat, eficiència, llegibilitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 8: Casa Bloc",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 8 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "És la lletra de les estructures clares i directes, com la pròpia Casa Bloc.",
        provenance: {
          mappingRef: "TG020 §Fitxa 8: Casa Bloc",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 8 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "edifici-telefonica",
    identity: {
      name: "Edifici Telefònica",
      date: { year: 1929, displayLabel: "1929" },
      architect: "Francesc Nebot",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Art déco", movementStatus: "verified" },
    typography: {
      primaryFamily: "Broadway",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "L'edifici de la Telefònica és un dels primers gratacels de Barcelona i una icona del 1929. Combina monumentalitat i ornamentació geomètrica pròpia de l'Art Déco, amb una verticalitat destacada.\n\n" +
        "La tipografia Broadway, amb formes decoratives i sofisticades, reflecteix perfectament l'esperit del període. Amb contrastos exagerats i formes teatralment geomètriques, transmet la mateixa sensació d'elegància urbana i optimisme.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "L'alçada també comunica.",
        attribution: "Síntesi, Francesc Nebot",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 9: Edifici Telefònica",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 9 > Frase destacada",
        },
      },
      buildingProse: {
        displayText: "L'edifici de la Telefònica és un dels primers gratacels de Barcelona i una icona del 1929.",
        provenance: {
          mappingRef: "TG020 §Fitxa 9: Edifici Telefònica",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 9 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "Combina monumentalitat i ornamentació geomètrica pròpia de l'Art Déco, amb una verticalitat destacada.",
        provenance: {
          mappingRef: "TG020 §Fitxa 9: Edifici Telefònica",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 9 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia Broadway, amb formes decoratives i sofisticades, reflecteix perfectament l'esperit del període.",
        provenance: {
          mappingRef: "TG020 §Fitxa 9: Edifici Telefònica",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 9 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Amb contrastos exagerats i formes teatralment geomètriques, transmet la mateixa sensació d'elegància urbana i optimisme.",
        provenance: {
          mappingRef: "TG020 §Fitxa 9: Edifici Telefònica",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 9 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "caixaforum-casaramona",
    identity: {
      name: "CaixaForum / Casaramona",
      date: { year: 1911, displayLabel: "1911" },
      architect: "Puig i Cadafalch",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme industrial", movementStatus: "verified" },
    typography: {
      primaryFamily: "Arnold Böcklin",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La fàbrica Casaramona és un exemple insòlit de com el modernisme va entrar al món industrial. La seva arquitectura funcional s'enriqueix amb detalls ornamentals, cobertes de teula i finestres de ferro forjat.\n\n" +
        "Arnold Böcklin, una tipografia amb formes orgàniques i decoratives, era molt popular a l'època i reflecteix bé l'exuberància modernista adaptada a usos pràctics. És una lletra que juga amb l'artesania i la funcionalitat, com la pròpia fàbrica.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Indústria amb ànima.",
        attribution: "Síntesi, Puig i Cadafalch",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 10: CaixaForum (Casaramona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 10 > Frase destacada",
        },
      },
      buildingProse: {
        displayText: "La fàbrica Casaramona és un exemple insòlit de com el modernisme va entrar al món industrial.",
        provenance: {
          mappingRef: "TG020 §Fitxa 10: CaixaForum (Casaramona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 10 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "La seva arquitectura funcional s'enriqueix amb detalls ornamentals, cobertes de teula i finestres de ferro forjat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 10: CaixaForum (Casaramona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 10 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Arnold Böcklin, una tipografia amb formes orgàniques i decoratives, era molt popular a l'època i reflecteix bé l'exuberància modernista adaptada a usos pràctics.",
        provenance: {
          mappingRef: "TG020 §Fitxa 10: CaixaForum (Casaramona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 10 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "És una lletra que juga amb l'artesania i la funcionalitat, com la pròpia fàbrica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 10: CaixaForum (Casaramona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 10 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "torre-glories",
    identity: {
      name: "Torre Glòries",
      date: { year: 2005, displayLabel: "2005" },
      architect: "Jean Nouvel",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Arquitectura biomòrfica / high-tech", movementStatus: "verified" },
    typography: {
      primaryFamily: "Gotham Rounded",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La Torre Glòries és una icona del skyline barceloní. Inspirada en formes naturals com un guèiser o una muntanya, la seva silueta orgànica i la façana intel·ligent la converteixen en un edifici viu i dinàmic.\n\n" +
        "Gotham Rounded, amb cantonades suaus i formes plenes, reflecteix aquesta organicitat i amabilitat tecnològica. És una tipografia moderna, urbana i versàtil que evoca fluïdesa i contemporaneïtat, com la pròpia torre.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Tecnologia amb forma humana.",
        attribution: "Síntesi, Jean Nouvel",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 11: Torre Glòries",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 11 > Frase destacada",
        },
      },
      buildingProse: {
        displayText: "La Torre Glòries és una icona del skyline barceloní.",
        provenance: {
          mappingRef: "TG020 §Fitxa 11: Torre Glòries",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 11 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Inspirada en formes naturals com un guèiser o una muntanya, la seva silueta orgànica i la façana intel·ligent la converteixen en un edifici viu i dinàmic.",
        provenance: {
          mappingRef: "TG020 §Fitxa 11: Torre Glòries",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 11 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Gotham Rounded, amb cantonades suaus i formes plenes, reflecteix aquesta organicitat i amabilitat tecnològica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 11: Torre Glòries",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 11 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "És una tipografia moderna, urbana i versàtil que evoca fluïdesa i contemporaneïtat, com la pròpia torre.",
        provenance: {
          mappingRef: "TG020 §Fitxa 11: Torre Glòries",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 11 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "biblioteca-jaume-fuster",
    identity: {
      name: "Biblioteca Jaume Fuster",
      date: { year: 2005, displayLabel: "2005" },
      architect: "Josep Llinàs",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Brutalisme contemporani", movementStatus: "verified" },
    typography: {
      primaryFamily: "Druk",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "L'edifici trenca amb l'entorn mitjançant volums angulars, façanes massisses i un llenguatge formal radical. És una arquitectura que impacta, amb una forta presència física, gairebé escultòrica.\n\n" +
        "Druk és una tipografia pesada, extrema i amb molt de caràcter visual. Representa molt bé la contundència formal de l'edifici, amb negretes molt carregades que reclamen atenció, igual que la biblioteca des del seu xamfrà.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Una biblioteca no és neutra.",
        attribution: "Síntesi, Josep Llinàs",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 12: Biblioteca Jaume Fuster",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 12 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "L'edifici trenca amb l'entorn mitjançant volums angulars, façanes massisses i un llenguatge formal radical.",
        provenance: {
          mappingRef: "TG020 §Fitxa 12: Biblioteca Jaume Fuster",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 12 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "És una arquitectura que impacta, amb una forta presència física, gairebé escultòrica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 12: Biblioteca Jaume Fuster",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 12 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText: "Druk és una tipografia pesada, extrema i amb molt de caràcter visual.",
        provenance: {
          mappingRef: "TG020 §Fitxa 12: Biblioteca Jaume Fuster",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 12 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Representa molt bé la contundència formal de l'edifici, amb negretes molt carregades que reclamen atenció, igual que la biblioteca des del seu xamfrà.",
        provenance: {
          mappingRef: "TG020 §Fitxa 12: Biblioteca Jaume Fuster",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 12 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "pavello-de-la-republica",
    identity: {
      name: "Pavelló de la República",
      date: { year: 1937, displayLabel: "1937 (reconstruït 1992)" },
      architect: "Josep Lluís Sert",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Racionalisme funcionalista", movementStatus: "verified" },
    typography: {
      primaryFamily: "Neutraface",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "Aquest pavelló va ser creat per a l'Exposició Internacional de París de 1937 i s'hi va exposar el Guernica de Picasso. El seu disseny responia a una arquitectura de missatge clar, funcional i ràpida de construir.\n\n" +
        "Neutraface, inspirada en l'arquitectura modernista californiana de Richard Neutra, és una tipografia elegant i racional, que expressa compromís, netedat i intenció. Com el pavelló, és funcional però amb dignitat.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Arquitectura al servei d'una causa.",
        attribution: "Síntesi, Josep Lluís Sert",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 13: Pavelló de la República",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 13 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "Aquest pavelló va ser creat per a l'Exposició Internacional de París de 1937 i s'hi va exposar el Guernica de Picasso.",
        provenance: {
          mappingRef: "TG020 §Fitxa 13: Pavelló de la República",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 13 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "El seu disseny responia a una arquitectura de missatge clar, funcional i ràpida de construir.",
        provenance: {
          mappingRef: "TG020 §Fitxa 13: Pavelló de la República",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 13 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Neutraface, inspirada en l'arquitectura modernista californiana de Richard Neutra, és una tipografia elegant i racional, que expressa compromís, netedat i intenció.",
        provenance: {
          mappingRef: "TG020 §Fitxa 13: Pavelló de la República",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 13 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "Com el pavelló, és funcional però amb dignitat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 13: Pavelló de la República",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 13 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "palau-de-la-musica-catalana",
    identity: {
      name: "Palau de la Música Catalana",
      date: { year: 1908, displayLabel: "1908" },
      architect: "Lluís Domènech i Montaner",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme decoratiu", movementStatus: "verified" },
    typography: {
      primaryFamily: "Mrs. Eaves",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "El Palau és una explosió ornamental de llum, color i música en forma arquitectònica. És una obra total, plena de vitralls, ceràmica, ferro forjat i escultura. Cada detall té una funció expressiva i simbòlica.\n\n" +
        "Mrs. Eaves, una tipografia amb caràcter històric, refinada i amb serif clàssic, evoca l'elegància i la sensibilitat artesanal del modernisme. Té un toc decoratiu i a la vegada literari, ideal per a aquest temple cultural.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Quan l'ornament canta.",
        attribution: "Síntesi, Lluís Domènech i Montaner",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 14: Palau de la Música Catalana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 14 > Frase destacada",
        },
      },
      buildingProse: {
        displayText: "El Palau és una explosió ornamental de llum, color i música en forma arquitectònica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 14: Palau de la Música Catalana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 14 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "És una obra total, plena de vitralls, ceràmica, ferro forjat i escultura. Cada detall té una funció expressiva i simbòlica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 14: Palau de la Música Catalana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 14 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Mrs. Eaves, una tipografia amb caràcter històric, refinada i amb serif clàssic, evoca l'elegància i la sensibilitat artesanal del modernisme.",
        provenance: {
          mappingRef: "TG020 §Fitxa 14: Palau de la Música Catalana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 14 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "Té un toc decoratiu i a la vegada literari, ideal per a aquest temple cultural.",
        provenance: {
          mappingRef: "TG020 §Fitxa 14: Palau de la Música Catalana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 14 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "fundacio-joan-miro",
    identity: {
      name: "Fundació Joan Miró",
      date: { year: 1975, displayLabel: "1975" },
      architect: "Josep Lluís Sert",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme mediterrani racional", movementStatus: "verified" },
    typography: {
      primaryFamily: "Avenir",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "La Fundació Miró és una arquitectura que respira: lluminosa, clara, modular, oberta al paisatge i al passeig artístic. Dissenyada per l'amic de Miró, Josep Lluís Sert, crea un diàleg entre estructura i llibertat creativa.\n\n" +
        "Avenir, com la seva arquitectura, és equilibrada, humana i funcional. És una sans serif racional però càlida, amb proporcions modernes i lògiques, perfecta per expressar aquest equilibri entre contenidor i art.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "L'art necessita espai per respirar.",
        attribution: "Síntesi, Josep Lluís Sert",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 15: Fundació Joan Miró",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 15 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "La Fundació Miró és una arquitectura que respira: lluminosa, clara, modular, oberta al paisatge i al passeig artístic.",
        provenance: {
          mappingRef: "TG020 §Fitxa 15: Fundació Joan Miró",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 15 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Dissenyada per l'amic de Miró, Josep Lluís Sert, crea un diàleg entre estructura i llibertat creativa.",
        provenance: {
          mappingRef: "TG020 §Fitxa 15: Fundació Joan Miró",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 15 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText: "Avenir, com la seva arquitectura, és equilibrada, humana i funcional.",
        provenance: {
          mappingRef: "TG020 §Fitxa 15: Fundació Joan Miró",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 15 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "És una sans serif racional però càlida, amb proporcions modernes i lògiques, perfecta per expressar aquest equilibri entre contenidor i art.",
        provenance: {
          mappingRef: "TG020 §Fitxa 15: Fundació Joan Miró",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 15 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "hotel-vela-w-barcelona",
    identity: {
      name: "Hotel Vela / W Barcelona",
      date: { year: 2009, displayLabel: "2009" },
      architect: "Ricardo Bofill",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Arquitectura escultural contemporània", movementStatus: "verified" },
    typography: {
      primaryFamily: "Montserrat",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "L'Hotel W, conegut popularment com “la vela”, és una silueta moderna i imponent al front marítim de Barcelona. L'edifici destaca pel seu perfil corbat, reflexiu i altament icònic, integrant-se visualment amb el mar.\n\n" +
        "La tipografia Montserrat, dissenyada a l'Argentina però inspirada en rètols de ciutat i geometries clares, comparteix l'equilibri entre contundència visual i elegància urbana. És ideal per a espais contemporanis i amb una presència marcada.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Geometria amb vistes al mar.",
        attribution: "Síntesi, Ricardo Bofill",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 16: Hotel Vela (W Barcelona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 16 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "L'Hotel W, conegut popularment com “la vela”, és una silueta moderna i imponent al front marítim de Barcelona.",
        provenance: {
          mappingRef: "TG020 §Fitxa 16: Hotel Vela (W Barcelona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 16 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "L'edifici destaca pel seu perfil corbat, reflexiu i altament icònic, integrant-se visualment amb el mar.",
        provenance: {
          mappingRef: "TG020 §Fitxa 16: Hotel Vela (W Barcelona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 16 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "La tipografia Montserrat, dissenyada a l'Argentina però inspirada en rètols de ciutat i geometries clares, comparteix l'equilibri entre contundència visual i elegància urbana.",
        provenance: {
          mappingRef: "TG020 §Fitxa 16: Hotel Vela (W Barcelona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 16 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText: "És ideal per a espais contemporanis i amb una presència marcada.",
        provenance: {
          mappingRef: "TG020 §Fitxa 16: Hotel Vela (W Barcelona)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 16 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "hospital-de-sant-pau",
    identity: {
      name: "Hospital de Sant Pau",
      date: { year: 1930, displayLabel: "1902 - 1930" },
      architect: "Lluís Domènech i Montaner",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Modernisme monumental / arquitectura humanista", movementStatus: "verified" },
    typography: {
      primaryFamily: "Perpetua",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "Aquest conjunt monumental va ser concebut com una ciutat jardí per al benestar físic i espiritual dels pacients. L'arquitectura, rica en detalls i simbologia, combina racionalitat funcional amb una forta càrrega artística i humana.\n\n" +
        "Perpetua és una tipografia amb base clàssica, sòbria però amb un toc cal·ligràfic que aporta calidesa. Representa la combinació de coneixement, bellesa i humanisme que impregna cada racó de l'Hospital de Sant Pau.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Arquitectura al servei de la cura.",
        attribution: "Síntesi, Lluís Domènech i Montaner",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 17: Hospital de Sant Pau",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 17 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "Aquest conjunt monumental va ser concebut com una ciutat jardí per al benestar físic i espiritual dels pacients.",
        provenance: {
          mappingRef: "TG020 §Fitxa 17: Hospital de Sant Pau",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 17 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "L'arquitectura, rica en detalls i simbologia, combina racionalitat funcional amb una forta càrrega artística i humana.",
        provenance: {
          mappingRef: "TG020 §Fitxa 17: Hospital de Sant Pau",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 17 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Perpetua és una tipografia amb base clàssica, sòbria però amb un toc cal·ligràfic que aporta calidesa.",
        provenance: {
          mappingRef: "TG020 §Fitxa 17: Hospital de Sant Pau",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 17 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Representa la combinació de coneixement, bellesa i humanisme que impregna cada racó de l'Hospital de Sant Pau.",
        provenance: {
          mappingRef: "TG020 §Fitxa 17: Hospital de Sant Pau",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 17 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "cementiri-de-montjuic-zona-racionalista",
    identity: {
      name: "Cementiri de Montjuïc — zona racionalista",
      date: { year: null, displayLabel: "~S. XX" },
      architect: "Leandre Albareda",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Noucentisme / racionalisme clàssic", movementStatus: "verified" },
    typography: {
      primaryFamily: "Garamond",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "A la zona racionalista del Cementiri de Montjuïc hi trobem una arquitectura serena, ordenada i austera. És una composició que expressa respecte, silenci i transcendència mitjançant proporcions clàssiques i simetria.\n\n" +
        "Garamond és una tipografia humanista, amb una herència tipogràfica del Renaixement. Té una bellesa serena i un ritme natural, que evoca pau, memòria i elegància atemporal, ideals per a aquest espai de recolliment.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "L'eternitat també té forma.",
        attribution: "Síntesi, Leandre Albareda",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 18: Cementiri de Montjuïc (zona racionalista)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 18 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "A la zona racionalista del Cementiri de Montjuïc hi trobem una arquitectura serena, ordenada i austera.",
        provenance: {
          mappingRef: "TG020 §Fitxa 18: Cementiri de Montjuïc (zona racionalista)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 18 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "És una composició que expressa respecte, silenci i transcendència mitjançant proporcions clàssiques i simetria.",
        provenance: {
          mappingRef: "TG020 §Fitxa 18: Cementiri de Montjuïc (zona racionalista)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 18 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText: "Garamond és una tipografia humanista, amb una herència tipogràfica del Renaixement.",
        provenance: {
          mappingRef: "TG020 §Fitxa 18: Cementiri de Montjuïc (zona racionalista)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 18 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Té una bellesa serena i un ritme natural, que evoca pau, memòria i elegància atemporal, ideals per a aquest espai de recolliment.",
        provenance: {
          mappingRef: "TG020 §Fitxa 18: Cementiri de Montjuïc (zona racionalista)",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 18 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "teatre-nacional-de-catalunya",
    identity: {
      name: "Teatre Nacional de Catalunya",
      date: { year: 1996, displayLabel: "1996" },
      architect: "Ricardo Bofill",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Neoclàssic contemporani", movementStatus: "verified" },
    typography: {
      primaryFamily: "Trajan",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "El TNC és una reinterpretació contemporània del temple clàssic, amb columnes monumentals, simetria i una escenografia arquitectònica pensada per al drama. És un espai solemne i simbòlic, que vol representar la cultura amb majúscules.\n\n" +
        "Trajan és una tipografia inspirada en les inscripcions romanes. Majúscules clàssiques amb una autoritat i sobrietat que encaixen perfectament amb l'estètica i funció de l'edifici.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "On la paraula es fa monument.",
        attribution: "Síntesi, Ricardo Bofill",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 19: Teatre Nacional de Catalunya",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 19 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "El TNC és una reinterpretació contemporània del temple clàssic, amb columnes monumentals, simetria i una escenografia arquitectònica pensada per al drama.",
        provenance: {
          mappingRef: "TG020 §Fitxa 19: Teatre Nacional de Catalunya",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 19 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText: "És un espai solemne i simbòlic, que vol representar la cultura amb majúscules.",
        provenance: {
          mappingRef: "TG020 §Fitxa 19: Teatre Nacional de Catalunya",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 19 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText: "Trajan és una tipografia inspirada en les inscripcions romanes.",
        provenance: {
          mappingRef: "TG020 §Fitxa 19: Teatre Nacional de Catalunya",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 19 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Majúscules clàssiques amb una autoritat i sobrietat que encaixen perfectament amb l'estètica i funció de l'edifici.",
        provenance: {
          mappingRef: "TG020 §Fitxa 19: Teatre Nacional de Catalunya",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 19 > Text explicatiu ¶2",
        },
      },
    },
  },
  {
    slug: "edifici-meridiana",
    identity: {
      name: "Edifici Meridiana",
      date: { year: null, displayLabel: "Anys 60" },
      architect: "MBM Arquitectes",
      address: null,
    },
    experienceType: "digital_only",
    architecture: { movement: "Racionalisme urbà de postguerra", movementStatus: "verified" },
    typography: {
      primaryFamily: "Akzidenz Grotesk",
      designer: null,
      secondaryStatus: "parked",
    },
    correlation: {
      sourceRationale:
        "L'edifici Meridiana forma part d'una arquitectura funcional i social dissenyada per respondre a les necessitats d'habitatge del creixement urbà dels anys 60. Sense ornaments, amb una clara jerarquia estructural i formes repetitives, és exemple d'eficiència arquitectònica.\n\n" +
        "Akzidenz Grotesk comparteix aquests valors: és una tipografia directa, sòbria i llegible, que fuig de l'expressivitat per centrar-se en la claredat. Utilitzada massivament en senyalètica i disseny institucional, reflecteix el mateix esperit pràctic i funcional de l'edifici.",
      provenance: TG020_SOURCE,
    },
    coordinates: null,
    heroMedia: null,
    editorial: false,
    infocard: {
      highlightedPhrase: {
        kind: "synthesis",
        displayText: "Arquitectura per viure.",
        attribution: "Síntesi, MBM Arquitectes",
        bibliographicContext: null,
        provenance: {
          mappingRef: "TG020 §Fitxa 2: Edifici Meridiana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 2 > Frase destacada",
        },
      },
      buildingProse: {
        displayText:
          "L'edifici Meridiana forma part d'una arquitectura funcional i social dissenyada per respondre a les necessitats d'habitatge del creixement urbà dels anys 60.",
        provenance: {
          mappingRef: "TG020 §Fitxa 2: Edifici Meridiana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 2 > Text explicatiu ¶1",
        },
      },
      architectureCopy: {
        displayText:
          "Sense ornaments, amb una clara jerarquia estructural i formes repetitives, és exemple d'eficiència arquitectònica.",
        provenance: {
          mappingRef: "TG020 §Fitxa 2: Edifici Meridiana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 2 > Text explicatiu ¶1",
        },
      },
      typographyCopy: {
        displayText:
          "Akzidenz Grotesk comparteix aquests valors: és una tipografia directa, sòbria i llegible, que fuig de l'expressivitat per centrar-se en la claredat.",
        provenance: {
          mappingRef: "TG020 §Fitxa 2: Edifici Meridiana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 2 > Text explicatiu ¶2",
        },
      },
      dialogueCopy: {
        displayText:
          "Utilitzada massivament en senyalètica i disseny institucional, reflecteix el mateix esperit pràctic i funcional de l'edifici.",
        provenance: {
          mappingRef: "TG020 §Fitxa 2: Edifici Meridiana",
          sourceLocator: "ADGARC_TG020_DIGITAL_CASES_SOURCE_v1.0.md > Fitxa 2 > Text explicatiu ¶2",
        },
      },
    },
  },
];

export function findCaseBySlug(slug: string | null): CaseRecord | undefined {
  if (!slug) return undefined;
  return cases.find((c) => c.slug === slug);
}

// TG020-R1 (operator visual review, ADGARC_TG020_VISUAL_FEEDBACK_R1_v1.0.md
// "Dataset / visibility decision"): the 31 authored CaseRecords above are
// never deleted or reordered for this — visibility is a separate,
// data/config-driven layer on top of them. Cases 01-10 (physical) and 11-20
// (the first ten digital_only records) stay public; 21-31 are held back from
// ordinary public product surfaces until a later phase, without touching
// their content. Re-enabling a hidden case is a one-line edit to this set —
// never a CaseRecord rewrite, never a Passport/architecture change.
export const HIDDEN_CASE_SLUGS: ReadonlySet<string> = new Set([
  "caixaforum-casaramona",
  "torre-glories",
  "biblioteca-jaume-fuster",
  "pavello-de-la-republica",
  "palau-de-la-musica-catalana",
  "fundacio-joan-miro",
  "hotel-vela-w-barcelona",
  "hospital-de-sant-pau",
  "cementiri-de-montjuic-zona-racionalista",
  "teatre-nacional-de-catalunya",
  "edifici-meridiana",
]);

// Canonical public/active case list and the single selector every ordinary
// product surface must derive from (Passport rail/carousel, the map-top
// navbar, and — once Phase 2 adds coordinates — map markers) rather than
// consuming `cases` directly or re-slicing it ad hoc in more than one place.
// One selector, one order, one ordinal numbering (1..activeCases.length) —
// Map, Passport, navigation and case lookup can never drift from each other.
// `findCaseBySlug` still searches the full 31-record `cases` array — a
// direct `?case=<slug>` deep link to a hidden case still opens its dossier;
// only listing/rail/ordinal surfaces are scoped to `activeCases`.
export const activeCases: CaseRecord[] = cases.filter((c) => !HIDDEN_CASE_SLUGS.has(c.slug));
