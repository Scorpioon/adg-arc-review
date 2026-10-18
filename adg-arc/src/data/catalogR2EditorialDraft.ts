// ADG-ARC TG046 Prompt 046-03 — Catalog R2 editorial draft intake (CAT/ES).
//
// DELIBERATELY UNIMPORTED. Nothing in this module may be imported by app
// code, referenced by `cases.ts`, used to build a route, or substituted for
// any runtime CaseRecord at this gate. It is a typed, reviewable transcript
// of the nine new R2 buildings' editorial fiche text (slots 11, 12, 14-20;
// Walden 7 at slot 13 is an existing CaseRecord, untouched, and is not
// repeated here) — an editorial *intake*, not a schema migration and not a
// change to `cases.ts`'s `activeCases`.
//
// Source document (OPERATOR-identified latest reviewed variant, read in
// full for its text sections only — the file is ~4.5 MB, almost entirely
// embedded base64 image data on lines 409+, none of which was read or
// extracted by this pass):
//   "C:\Users\TONX\Downloads\00_INBOX\_SORTED\PROJECTS\ADG-ARC\
//    proposta per totems _ Arquitectura i tipografia en diàleg__VARIANT_20261011.md"
// Four other files with the same base name (undated and "(1)"/"(2)"/"(3)")
// exist in the same folder; this pass read only the exact
// "__VARIANT_20261011" file named by the prompt, per its identity
// instruction, and did not diff it against the other four.
//
// IMPORTANT — this fiche's own scope, discovered while reading it: for all
// nine of these buildings, the source document supplies ONLY the building
// side (header facts + "FORMA" + "Descripció WEB", each in [cat] and [es]).
// Unlike the ten physical-totem cases in `cases.ts` (sourced from
// P2Totems_A&T.pdf, which pairs each building with a named typeface, a
// CARÀCTERS passage and a DIÀLEG passage), this document contains NO
// typeface name, designer, CARÀCTERS text or DIÀLEG text for any of these
// nine buildings — there is nothing to transcribe there, not an omission by
// this pass. `typography` on every record below is therefore the explicit
// `PENDING_NOT_IN_SOURCE` marker, not a null/blank/invented value.
//
// Markdown-export artifacts (e.g. a literal "\!" before an exclamation
// mark, or a leading "\*" on an otherwise ordinary word such as
// "\*Gardunya") appear in a few places in the source's own [cat]/[es] prose
// and are preserved verbatim below rather than silently cleaned — see each
// affected record's `sourceNotes`. Likewise, every header name/date/style/
// architect line is transcribed exactly as printed, including a locale
// mismatch (one header is printed in Spanish, not Catalan) and naming forms
// that differ from the handoff/prompt's own candidate display names — see
// `header.nameAsPrinted` vs `handoffDisplayName` per record.
//
// This module makes no media reference of any kind: the source document's
// own per-building image lines are explicitly captioned by the source
// itself as "(Atenció! aquesta imatge és una referència per saber quin
// edifici és, no és per utilitzar-la)" / reference-only, not for use — and
// are not transcribed, linked, or otherwise represented here regardless.

export const CATALOG_R2_EDITORIAL_DRAFT_SOURCE = {
  file:
    "C:\\Users\\TONX\\Downloads\\00_INBOX\\_SORTED\\PROJECTS\\ADG-ARC\\" +
    "proposta per totems _ Arquitectura i tipografia en diàleg__VARIANT_20261011.md",
  identityNote:
    "Exact filename named by TG046 Prompt 046-03 v0.1 §'Primary editorial " +
    "source and provenance'. Four other same-stem files exist in the same " +
    "folder (undated, and suffixed (1)/(2)/(3)); this pass did not read or " +
    "diff against them, per the prompt's instruction to target the named " +
    "file and STOP on identity ambiguity — no ambiguity was encountered " +
    "since the exact named file exists.",
  readScope:
    "Full text content, lines 1-407 (the document's actual case prose, " +
    "verified by per-line length to contain no embedded image data). Lines " +
    "409 and up (each 87,870-650,555 characters long) are base64-embedded " +
    "images referenced by the document's own [image1]..[image13] markers " +
    "and were not read or parsed by this pass.",
} as const;

/** CaseTypography/InfocardContent-equivalent fields this fiche never supplies for any of the nine R2 buildings. */
export type PendingNotInSource = {
  status: "PENDING_NOT_IN_SOURCE";
  note: string;
};

export const TYPOGRAPHY_PENDING: PendingNotInSource = {
  status: "PENDING_NOT_IN_SOURCE",
  note:
    "This fiche document supplies no typeface name, designer, CARÀCTERS " +
    "passage, or DIÀLEG (architecture<->typography pairing) passage for " +
    "any of the nine R2 buildings — confirmed by a full read of the " +
    "document's text (lines 1-407). Unlike cases.ts's ten physical cases " +
    "(P2Totems_A&T.pdf source), there is no architecture/typography " +
    "'dialogue' content to transcribe here; a future integration pass " +
    "would need a different, as-yet-unidentified source for it.",
};

export interface SourceLocator {
  /** Line range in CATALOG_R2_EDITORIAL_DRAFT_SOURCE.file at the time of this draft (2026-10-12). */
  lines: string;
  /** Which labeled block within that range this text was transcribed from. */
  block: string;
}

export interface BilingualSourceText {
  cat: string;
  es: string;
  source: SourceLocator;
}

export interface DraftHeaderFacts {
  /** The building-name header line exactly as printed above the image line — may differ in spelling/locale from `handoffDisplayName`. */
  nameAsPrinted: string;
  /** Date/date-range line exactly as printed, e.g. "1908-1911", "2008", "2017 \- 2022". Not split into a machine year here — see `uncertainties`/`conflicts` where the fiche's bare year needs reconciliation. */
  dateLabelAsPrinted: string;
  /** Style/movement line exactly as printed. */
  styleAsPrinted: string;
  /** Architect/firm line exactly as printed. */
  architectAsPrinted: string;
  source: SourceLocator;
}

/** A fact this draft adds beyond the fiche text itself (handoff table, credits file, or explicit OPERATOR instruction in Prompt 046-03) — never presented as fiche-sourced. */
export interface SupplementalFact {
  field: string;
  value: string;
  provenance: string;
}

/** A fact that conflicts, or cannot yet be reconciled, between two named sources — listed, not resolved, per the prompt's explicit instruction not to pretend verification. */
export interface UnresolvedConflict {
  field: string;
  ficheValue: string;
  otherValue: string;
  otherValueProvenance: string;
  status: "UNRESOLVED_LISTED_EXPLICITLY";
}

export interface CatalogR2EditorialDraftRecord {
  /** Proposed display slot, matching catalogR2Intake.ts's CATALOG_R2_INTAKE and the TG046 handoff §2 table. */
  slot: number;
  slug: string;
  /** Exact candidate display name from the TG046 handoff §2 table / Prompt 046-03's nine-case list — kept distinct from the fiche's own `header.nameAsPrinted`. */
  handoffDisplayName: string;
  header: DraftHeaderFacts;
  forma: BilingualSourceText;
  descripcioWeb: BilingualSourceText;
  typography: PendingNotInSource;
  supplementalFacts: SupplementalFact[];
  conflicts: UnresolvedConflict[];
  /** Open items for the next integration pass to review — distinct from `conflicts`, which are specifically two-sourced disagreements. */
  uncertainties: string[];
  /** Verbatim source-transcription artifacts worth flagging (e.g. markdown escape characters, a locale-mismatched header). */
  sourceNotes: string[];
}

export const CATALOG_R2_EDITORIAL_DRAFT: readonly CatalogR2EditorialDraftRecord[] = [
  {
    slot: 11,
    slug: "casa-fuster",
    handoffDisplayName: "Casa Fuster",
    header: {
      nameAsPrinted: "Casa Fuster",
      dateLabelAsPrinted: "1908-1911",
      styleAsPrinted: "Modernisme",
      architectAsPrinted: "Lluís Domènech i Montaner",
      source: { lines: "1-4", block: "header" },
    },
    forma: {
      cat:
        "La Casa Fuster destaca per la seva façana de marbre blanc i pedra de Montjuïc. Les columnes, capitells amb motius florals, arcs i finestres trilobulades combinen referències gòtiques i formes ornamentals. La galeria porticada del primer pis i el cos cilíndric de la cantonada, a mode de torre, completen el caràcter monumental de l'edifici.",
      es:
        "La Casa Fuster destaca por su fachada de mármol blanco y piedra de Montjuïc. Las columnas, capiteles con motivos florales, arcos y ventanas trilobuladas combinan referencias góticas y formas ornamentales. La galería porticada del primer piso y el cuerpo cilíndrico de la esquina, a modo de torre, completan el carácter monumental del edificio.",
      source: { lines: "11-12 (cat), 31-32 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Considerat un dels edificis més emblemàtics del modernisme català, el projecte va ser encarregat a l'arquitecte per la família Fuster el 1908 per a la seva pròpia residència.\n\n" +
        "Situat en un solar amb façana a tres carrers, té un gran impacte visual, com a final del passeig de Gràcia en el seu punt de transició cap al carrer Gran de Gràcia.\n\n" +
        "L'arquitectura de l'edifici combina la tecnologia constructiva moderna emprada a finals del segle XIX i principis del XX amb l'estètica modernista. És un clar exemple de com el modernisme va transformar la ciutat de Barcelona.\n\n" +
        "L'articulació entre les dues façanes es resol mitjançant un cos cilíndric a manera de torre circular, que arrenca en voladís des de la primera planta.\n\n" +
        "La façana està recoberta de marbre blanc i pedra de Montjuïc, amb columnes robustes, capitells esculpits amb motius florals abstractes i característics arcs i finestres trilobulades, de marcada influència gòtica. A la primera planta destaca, per la seva bellesa i complexitat, la galeria porticada amb columnes i capitells esculpits.\n\n" +
        "A la planta baixa destaquen les columnes de marbre vermell i els capitells florals que sostenen arcs imponents, les voltes dels quals estan realitzades amb maó pla. Aquest espai, conegut històricament com el Cafè Vienès, era un lloc de reunió de la societat barcelonina dels anys quaranta.\n\n" +
        "L'edifici culmina amb una mansarda d'estil francès coberta de pissarra.",
      es:
        "Considerado uno de los edificios más emblemáticos del modernismo catalán, cuyo proyecto fue encargado al arquitecto por la familia Fuster en 1908 para su propia residencia.\n\n" +
        "Situado en un solar con fachada a tres calles tiene un gran impacto visual, como final del Paseo de Gracia en su punto de transición hacia la calle Gran de Gràcia.\n\n" +
        "La arquitectura del edificio combina la tecnología de construcción moderna empleada a finales del XIX y principios del XX con la estética modernista. Es un claro ejemplo de cómo el modernismo transformó la ciudad de Barcelona.\n\n" +
        "La articulación entre las dos fachadas se resuelve con un cuerpo cilíndrico a modo de torre circular, que arranca en voladizo desde la primera planta.\n\n" +
        "La fachada está recubierta de mármol blanco y piedra de Montjuic, con columnas robustas, capiteles esculpidos con motivos florales abstractos y característicos arcos y ventanas trilobuladas, de marcada influencia gótica. En el primer piso destaca, por su belleza y complejidad, la galería porticada con columnas y capiteles esculpidos.\n\n" +
        "En la planta baja, destacan las columnas de mármol rojo y capiteles florales que sostienen arcos imponentes, cuyas bóvedas están realizadas con ladrillo plano. Este espacio conocido históricamente como el Café Vienés, era un lugar de reunión de la sociedad barcelonesa de los años 40.\n\n" +
        "El edificio culmina con una buhardilla de estilo francés cubierta de pizarra.",
      source: { lines: "14-27 (cat), 34-47 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [],
    conflicts: [],
    uncertainties: [],
    sourceNotes: [
      "descripcioWeb.es (source lines 34-47, specifically line 45): the source document prints a markdown-escaped period, '...de los años 40\\.', while this draft stores the lossless rendering '...de los años 40.' (escape character removed; no word, fact, or number changed). OPERATOR approved retaining this rendering on 2026-10-13, per the TG046 046-06A audit evidence (row 4) and Prompt 046-06B.",
    ],
  },
  {
    slot: 12,
    slug: "casa-lopez-sert",
    handoffDisplayName:
      "Casa López / Cases Josefa López (Josep Lluís Sert, Muntaner 342-348; NOT Casa Antoni López)",
    header: {
      nameAsPrinted: "Casa López",
      dateLabelAsPrinted: "1931",
      styleAsPrinted: "Racionalisme",
      architectAsPrinted: "Josep Lluís Sert",
      source: { lines: "49-52", block: "header" },
    },
    forma: {
      cat:
        "La Casa López destaca per la claredat geomètrica del seu volum en cantonada, acabat amb estuc verd suau. L'alternança de finestres allargades, balcons i terrasses enfonsades genera un ritme regular que expressa la distribució interior dels habitatges en duplex. Els elements metàl·lics i els panells de vidre reforcen el seu caràcter funcional i depurat.",
      es:
        "La Casa López destaca por la claridad geométrica de su volumen en esquina, acabado con estuco verde suave. La alternancia de ventanas alargadas, balcones y terrazas hundidas genera un ritmo regular que expresa la distribución interior de las viviendas en duplex. Los elementos metálicos y los paneles de vidrio refuerzan su carácter funcional y depurado.",
      source: { lines: "59-60 (cat), 73-74 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Edifici racionalista en què l'arquitecte Josep Lluís Sert incorpora el llenguatge arquitectònic més purista d'aquest moviment arquitectònic; es pot considerar un dels projectes més significatius d'aquesta època.\n\n" +
        "A la façana que dona al carrer Muntaner, la composició de finestres, terrasses i balcons expressa la distribució interior dels habitatges dúplex. Una solució tipològica innovadora que s'introdueix en aquesta època com una forma de reduir les zones de passadís i accés als habitatges; aspecte que també es reflecteix en l'alternança de balcons i terrasses amb finestres allargades, cada dues plantes.\n\n" +
        "La façana llisa, acabada amb estuc pintat de color verd suau (Bauhaus), emfatitza el volum i la geometria regular de l'edifici, d'acord amb l'estètica arquitectònica del racionalisme.\n\n" +
        "Les finestres són metàl·liques de color gris fosc, les baranes de tub d'acer pintat de blanc i la part baixa de l'edifici, en contacte amb el carrer, està revestida amb panells de vidre, pintats per la seva cara interior.",
      es:
        "Edificio racionalista en el que el arquitecto José Luis Sert incorpora el lenguaje arquitectónico más purista de este movimiento arquitectónico, se puede considerar uno de los proyectos más significativos de esta época.\n\n" +
        "En la fachada que da a la calle Muntaner, la composición de ventanas, terrazas y balcones expresa, expresa la distribución interior de las viviendas en dúplex. Una solución tipológica novedosa que se introduce en esta época, como una forma de reducir las zonas de pasillo y acceso a las viviendas; aspecto que también se refleja en la alternancia de balcones y terrazas con ventanas alargadas, cada dos plantas.\n\n" +
        "La fachada lisa, acabada con estuco pintado de color verde suave (Bauhaus), enfatiza la el volumen y la geometría regular del edificio, de acuerdo con la estética arquitectónica del racionalismo.\n\n" +
        "Las ventanas son metálicas de color gris oscuro, las barandillas de tubo de acero pintado de blanco y la parte baja del edificio, en contacto con la calle, está revestida con paneles de vidrio, pintados por su cara interior.",
      source: { lines: "62-69 (cat), 76-83 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [
      {
        field: "identity.disambiguation",
        value:
          "This is the Sert-designed 'Cases Josefa López' at Muntaner (also referred to as 'Casa López'), explicitly NOT the similarly-named 'Casa Antoni López' — the TG046 R2 media credits file (work_materials/images 11-20 r2/11-20 credits r2.txt, read by Prompt 046-01's review pass, not re-read by this pass) marks a Casa Antoni López photo 'NOT USE THIS ONE WRONG BUILDING'.",
        provenance:
          "TG046 handoff §2 table + §3; prior TG046 report §2.2 (Prompt 046-01/046-02 review pass).",
      },
      {
        field: "identity.address",
        value: "Muntaner 342-348 / Rector Ubach 21",
        provenance:
          "TG046 handoff §2 table and Prompt 046-03's own nine-case list. This exact street-number range is NOT present anywhere in this fiche's own text, which names only 'carrer Muntaner' with no number — see `uncertainties`.",
      },
    ],
    conflicts: [],
    uncertainties: [
      "The fiche's own FORMA/Descripció WEB text never states a street number for 'carrer Muntaner' — the 'Muntaner 342-348'/'Rector Ubach 21' address in `supplementalFacts` comes entirely from the handoff/prompt table, not from this source document. A future integration pass should locate an independent address citation (e.g. the credits file, a municipal/heritage register) before treating the address as fiche-verified.",
    ],
    sourceNotes: [],
  },
  {
    slot: 14,
    slug: "edifici-mediapro",
    handoffDisplayName: "Edifici Mediapro",
    header: {
      nameAsPrinted: "Edifici Mediapro",
      dateLabelAsPrinted: "2000-2009",
      styleAsPrinted: "Arquitectura contemporània d'avantguarda",
      architectAsPrinted: "Carlos Ferrater, Patrick Genard i Xavier Martí",
      source: { lines: "131-134", block: "header" },
    },
    forma: {
      cat:
        "L'edifici Mediapro adapta el seu volum a les alineacions i perspectives de la Diagonal, creant una composició escultòrica que integra torre, cos horitzontal i plaça triangular. L'estructura perimetral defineix la imatge exterior i allibera l'interior de pilars, oferint gran flexibilitat d'ús. L'acabat bronzejat i les finestres repetitives reforcen el seu caràcter de gratacel contemporani.",
      es:
        "El edificio Mediapro adapta su volumen a las alineaciones y perspectivas de la Diagonal, creando una composición escultórica que integra torre, cuerpo horizontal y plaza triangular. La estructura perimetral define la imagen exterior y libera el interior de pilares, ofreciendo gran flexibilidad de uso. El acabado bronceado y las ventanas repetitivas refuerzan su carácter de rascacielos contemporáneo.",
      source: { lines: "141-142 (cat), 159-160 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "L'edifici d'oficines, situat al front de la Diagonal, al districte 22@, és un clar exemple de com l'arquitectura pot respondre de manera especial a les característiques de l'entorn urbà i, en aquest cas concret, de com el seu volum s'ha modelat segons les alineacions dels carrers i les directrius visuals.\n\n" +
        "El pla de façana de la torre que dona a la Diagonal, la perforació de les quatre primeres plantes per permetre la sortida al carrer de Bolívia i el cos horitzontal, de façana transparent, que delimita la plaça triangular, atorguen a l'edifici una imatge escultòrica, resultat de l'atenció a les demandes urbanes.\n\n" +
        "L'esquelet estructural es converteix en la forma final de l'edifici, en situar l'estructura portant al perímetre exterior de l'edifici.\n\n" +
        "Aquesta característica i el seu disseny diàfan ofereixen una gran flexibilitat d'ús, gràcies a l'absència de pilars o estructures intermèdies.\n\n" +
        "La versatilitat de la distribució interior es basa també en l'ús d'un model únic i repetit de finestra, desenvolupat de manera contínua a totes les façanes, que ofereix una bona il·luminació i vistes de la ciutat des de qualsevol punt de la torre.\n\n" +
        "L'estructura, pintada d'un color bronze acerós, igual que els fins marcs metàl·lics de les finestres que tanquen els buits de l'estructura, atorga a l'edifici una imatge clàssica i potent, característica dels grans gratacels.",
      es:
        "El edificio de oficinas, situado en el frente de la Diagonal, en el distrito 22@, es un claro ejemplo de cómo la arquitectura puede atender de manera especial a las características del entorno urbano, y, en este caso en concreto, como su volumen se ha modelado según alineaciones de las calles y directrices visuales.\n\n" +
        "El plano de fachada de la Torre que da a la Diagonal, la perforación de las cuatro primeras plantas para ofrecer la salida a la calle Bolivia y el cuerpo horizontal, de fachada transparente que delimita la plaza triangular, otorgan al edificio una imagen escultórica resultado de la atención a las solicitaciones urbanas.\n\n" +
        "El esqueleto estructural se convierte en la forma final del edificio al conseguir que la estructura sustentante esté situada en el perímetro exterior del edificio.\n\n" +
        "Esta característica y su diseño diáfano ofrece una gran flexibilidad de uso, gracias a la inexistencia de pilares o estructuras intermedias.\n\n" +
        "La versatilidad de la distribución interior se apoya asimismo en el empleo de un modelo único y repetido de ventana, desarrollada en continuidad en todas las fachadas, que ofrece una buena iluminación y vistas de la ciudad desde cualquier punto de la torre.\n\n" +
        "La estructura pintada en un color bronce acerado al igual que los finos cercos metálicos de las ventanas, que cierran los huecos de la estructura, otorgan al edificio una imagen clásica y potente característica de los grandes rascacielos.",
      source: { lines: "144-155 (cat), 162-170 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [],
    conflicts: [],
    uncertainties: [],
    sourceNotes: [],
  },
  {
    slot: 15,
    slug: "habitatges-industrialitzats-marroc",
    handoffDisplayName: "Edifici d'habitatges industrialitzats Marroc 180",
    header: {
      nameAsPrinted: "Edifici d'habitatges industrialitzats",
      dateLabelAsPrinted: "2024",
      styleAsPrinted: "Arquitectura industrialitzada",
      architectAsPrinted: "Vivas Arquitectos i EXE Arquitectura",
      source: { lines: "172-175", block: "header" },
    },
    forma: {
      cat:
        "L'edifici d'habitatges industrialitzats combina construcció modular i sostenibilitat mitjançant 104 mòduls prefabricats acoblats en només quinze dies. La repetició dels mòduls genera una façana horitzontal de caràcter industrial, mentre les passarel·les exteriors creen espais de transició entre el públic i el privat. Les zones comunitàries reforcen la vida veïnal del conjunt.",
      es:
        "El edificio de viviendas industrializadas combina construcción modular y sostenibilidad mediante 104 módulos prefabricados ensamblados en solo quince días. La repetición de los módulos genera una fachada horizontal de carácter industrial, mientras las pasarelas exteriores crean espacios de transición entre lo público y lo privado. Las zonas comunitarias refuerzan la vida vecinal del conjunto.",
      source: { lines: "182-183 (cat), 198-199 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Edifici de 45 habitatges de protecció oficial, situat en l'entorn industrial del barri del Poblenou, ha estat projectat seguint principis de sostenibilitat que aposten per l'optimització dels temps d'execució i dels costos.\n\n" +
        "Per aconseguir-ho, el projecte combina una fonamentació tradicional, realitzada in situ, amb un sistema de mòduls prefabricats transportats i assemblats a l'obra en tan sols quinze dies. Aquesta estructura modular, pel seu disseny, permet una distribució flexible dels habitatges de dues habitacions i facilita l'adaptació a futurs canvis.\n\n" +
        "L'edifici utilitza un llenguatge arquitectònic de caràcter industrial, d'acord amb l'entorn de la zona. La composició horitzontal de la façana principal és el resultat de la repetició sistemàtica dels mòduls industrialitzats al llarg de cada planta. El correcte assemblatge dels mòduls configura un sistema de franges horitzontals que alterna els paraments opacs, que fan de sòcol, amb el finestral superior de cada mòdul.\n\n" +
        "L'edifici incorpora passarel·les exteriors, a la façana posterior, que donen accés als habitatges, generen una transició gradual entre l'espai públic i el privat i fomenten la interacció entre els veïns mitjançant l'apropiació d'aquests espais intermedis. A més, el projecte contempla espais comunitaris addicionals a la planta baixa i a la coberta, com ara àrees polivalents i una àmplia terrassa amb zones enjardinades.\n\n" +
        "El projecte es va completar en un temps rècord de tretze mesos, amb els 104 mòduls prefabricats transportats i assemblats a l'obra en tan sols quinze dies.",
      es:
        "Edificio de 45 viviendas de protección oficial, situado en el entorno industrial del barrio del Poble Nou, ha sido proyectado siguiendo los principios de sostenibilidad que apuestan por la optimización de los tiempos de ejecución y los costes.\n\n" +
        "Para ello el proyecto combina la cimentación tradicional (realizada in situ) con un sistema de módulos prefabricados transportados y ensamblados en obra en tan solo quince días. Esta estructura modular, por su diseño, admite una distribución flexible de las viviendas de dos habitaciones y facilidad de adaptación adaptaciones a futuros cambios.\n\n" +
        "El edificio emplea un lenguaje arquitectónico de carácter industrial, acorde con la zona. La composición horizontal de la fachada principal, es el resultado de la repetición sistemática de los módulos industrializados a lo largo de cada planta. El correcto ensamblaje de los módulos compone un sistema de franjas horizontales que alterna los paramentos opacos que hacen de zócalo con el ventanal superior de cada módulo.\n\n" +
        "El edificio incorpora pasarelas exteriores, en la fachada posterior, que dan acceso a las viviendas, generan una transición gradual entre el espacio público y privado, y fomentan la interacción entre los vecinos a través de la apropiación de estos espacios intermedios. Además, el proyecto contempla espacios comunitarios adicionales en la planta baja y la cubierta, como áreas polivalentes y una amplia terraza con zonas ajardinadas.\n\n" +
        "El proyecto se completó en un tiempo récord de trece meses, con los 104 módulos prefabricados transportados y ensamblados en obra en tan solo quince días.",
      source: { lines: "185-194 (cat), 201-210 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [
      {
        field: "unitCount",
        value: "45 habitatges",
        provenance:
          "OPERATOR-approved correction stated in Prompt 046-03 ('Marroc 180 45 dwellings (not 46)') — independently corroborated here: this fiche's own Descripció WEB text (both [cat] and [es]) states '45 habitatges'/'45 viviendas' directly (lines 186, 202). No conflict between the OPERATOR correction and this source.",
      },
    ],
    conflicts: [],
    uncertainties: [
      "The address 'Marroc 180' (used in the handoff/candidate slug) does not appear anywhere in this fiche's text — the Descripció WEB names only the Poblenou industrial surroundings generally, no street/number. The address comes from the handoff table / slug naming, not from this source document; needs an independent citation before being treated as fiche-verified.",
    ],
    sourceNotes: [],
  },
  {
    slot: 16,
    slug: "habitatges-socials-824",
    handoffDisplayName: "Habitatges Socials 824, Sant Andreu de la Barca",
    header: {
      nameAsPrinted: "Habitatges Socials 824",
      dateLabelAsPrinted: "2008",
      styleAsPrinted: "Arquitectura sostenible",
      architectAsPrinted: "H Arquitectes",
      source: { lines: "211-214", block: "header" },
    },
    forma: {
      cat:
        "Habitatges Socials 824 s'organitza en dos volums units per un sòcol, reduint l'impacte visual del conjunt. Els murs de formigó vist i la repetició ordenada de finestres defineixen una imatge austera i geomètrica. A l'interior, una retícula d'espais equivalents permet diferents formes d'ús i aporta flexibilitat als habitatges.",
      es:
        "Habitatges Socials 824 se organiza en dos volúmenes unidos por un zócalo, reduciendo el impacto visual del conjunto. Los muros de hormigón visto y la repetición ordenada de ventanas definen una imagen austera y geométrica. En el interior, una retícula de espacios equivalentes permite distintas formas de uso y aporta flexibilidad a las viviendas.",
      source: { lines: "221-222 (cat), 235-236 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "L'edifici, alineat amb el carrer de Josep Pla, s'articula en dos volums de sis plantes units per un sòcol.\n\n" +
        "Aquesta solució redueix l'impacte visual d'una edificació contínua i afavoreix la relació amb la construcció residencial existent a l'interior de l'illa.\n\n" +
        "El projecte mostra, mitjançant l'absència de revestiments exteriors, la tècnica constructiva basada en murs de formigó armat vist, que alliberen d'estructura els espais interiors i en faciliten la distribució i la flexibilitat. Aquests murs cecs de formigó ofereixen una imatge plana i austera que es complementa amb una retícula ordenada de finestres de la mateixa mida i forma. Als extrems de l'edifici, emmarcada pels murs de formigó, es configura una galeria amb un gran finestral de lamel·les practicables que actua com a espai de control climàtic.\n\n" +
        "La modulació geomètrica s'estén a tots els nivells de l'edifici. La seva organització interior es basa en una retícula d'estances quadrades de dimensions equivalents (10 m²), definida per la modulació del forjat nervat de formigó vist, compost per nou cassetons a cada espai. Aquesta disposició, sense jerarquies funcionals rígides, afavoreix diferents formes d'ús i elimina els espais residuals.",
      es:
        "El edificio, alineado con la calle Josep Pla, se articula en dos volúmenes de 6 plantas unidos por un zócalo.\n\n" +
        "Esta solución reduce el impacto visual de una edificación continua y favorece la relación con la construcción residencial existente en el interior de la manzana.\n\n" +
        "El proyecto muestra, por la ausencia de revestimientos exteriores, la técnica de construcción a base de muros de hormigón armado vistos, que liberan de estructura los espacios interiores y facilitan su distribución y flexibilidad. Estos muros ciegos de hormigón ofrecen una imagen plana y austera que se complementa con una retícula ordenada de ventanas del mismo tamaño y forma. En los extremos del edificio, enmarcada por los muros de hormigón, se configura una galería con un ventanal de lamas practicables de gran dimensión, que actúa como espacios de control climático.\n\n" +
        "La modulación geométrica se lleva a todos los niveles de edificio. Su organización interior se basa en una retícula de estancias cuadradas de dimensiones equivalentes (10 m²), definida por la modulación del forjado nervado de hormigón visto, compuesto por nueve casetones en cada espacio. Esta disposición, sin jerarquías funcionales rígidas, favorece distintas formas de uso y elimina espacios residuales.",
      source: { lines: "224-231 (cat), 238-245 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [
      {
        field: "constructionYears",
        value: "2023-2025 (preferred display completion year: 2025)",
        provenance:
          "OPERATOR-approved correction stated in Prompt 046-03 ('824 construction 2023-2025, preferred display completion 2025').",
      },
      {
        field: "municipality",
        value: "Sant Andreu de la Barca (not Barcelona's Sant Andreu)",
        provenance: "TG046 handoff §2 table; Prompt 046-03's own nine-case list.",
      },
    ],
    conflicts: [
      {
        field: "date",
        ficheValue: "2008 (bare year, no competition/built label — the prior TG046 report §2.4 flagged this same ambiguity)",
        otherValue: "construction 2023-2025, preferred display completion 2025",
        otherValueProvenance: "OPERATOR-approved correction, Prompt 046-03",
        status: "UNRESOLVED_LISTED_EXPLICITLY",
      },
    ],
    uncertainties: [
      "Whether the fiche's '2008' represents a competition/design year that the 2023-2025 construction then followed, or an unrelated/superseded value, is not stated by either source; listed as a conflict above rather than assumed.",
      "The municipality 'Sant Andreu de la Barca' is not named anywhere in this fiche's text, which names only 'carrer de Josep Pla'. The street name is fiche-confirmed; the municipality is handoff-only.",
    ],
    sourceNotes: [],
  },
  {
    slot: 17,
    slug: "escola-massana",
    handoffDisplayName: "Escola Massana",
    header: {
      nameAsPrinted: "Escuela Massana",
      dateLabelAsPrinted: "2017",
      styleAsPrinted: "Arquitectura contemporània",
      architectAsPrinted: "Carme Pinos",
      source: { lines: "247-250", block: "header" },
    },
    forma: {
      cat:
        "L'edifici forma part d'un profund projecte de renovació urbana de l'entorn del mercat de la boquería. La seva façana principal s'articula mitjançant volums amb diferent orientació. Està recoberta per un material ceràmic de gran format que li atorga unitat i un caràcter emblemàtic. A l'interior, un gran atri connecta les diferents plantes i agrupa les circulacions i els espais de relació de l'alumnat.",
      es:
        "El edificio forma parte de un profundo proyecto de renovación urbana del entorno del mercado de la Boquería. Su fachada principal se articula mediante volúmenes con diferente orientación. Está recubierta por un material cerámico de gran formato que le otorga unidad y un carácter emblemático. En el interior, un gran atrio conecta las diferentes plantas y agrupa las circulaciones y los espacios de relación del alumnado.",
      source: { lines: "256-257 (cat), 273-274 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Equipament públic que forma part d'un important projecte de renovació urbana de la plaça de la \\*Gardunya, situada en la part posterior de l'antic mercat de la \\*Boquería, en les Rambles de Barcelona.\n\n" +
        "L'edifici d'art i disseny s'expressa cap a la plaça amb singularitat i moviment, mitjançant la fragmentació i diferent orientació dels volums arquitectònics.\n\n" +
        "La façana principal està recoberta per un material ceràmic de grans dimensions fabricat especialment per a aquest projecte, que li proporciona \\*unitariedad i una imatge emblemàtica. Uns grans finestrals de proporció quadrada generen profunditat i transparència cap a l'interior de l'edifici.\n\n" +
        "L'espai interior de l'escola és obert i unitari. Està format per un gran vestíbul interconnectat visualment entre totes les plantes de l'edifici que permet l'entrada de llum i reuneix les circulacions interiors. Una terrassa al final de cada espai de circulació obre l'edifici cap a la plaça, responent així a la voluntat de disposar d'espais oberts que afavoreixin la relació entre els alumnes.\n\n" +
        "El programa de l'edifici es desenvolupa principalment en planta baixa i en cinc plantes superiors, més una planta soterrani. Els espais s'organitzen segons els diferents usos, ja siguin tallers o aules. Les aules, orientades cap al sud, i els tallers, cap al nord, estan separats per un gran atri central, que actua com un passatge urbà en potència.\n\n" +
        "L'accés principal es localitza al carrer Florista de la Rambla, buscant un vincle amb el futur passatge i els jardins de Rubió i Lluch. A més d'aquest accés principal, l'edifici compta amb uns altres de caràcter secundari, que es plantegen en funció de les necessitats programàtiques de l'escola: un d'ells està situat en la Plaça de la Gardunya, vinculat a la sala d'exposicions, i un altre al costat del Mercat de la Boquería, vinculat a la sala d'actes. Aquest últim pot funcionar de manera independent, permetent el desenvolupament d'activitats culturals anés dels horaris de l'escola.",
      es:
        "Equipamiento público que forma parte de un importante proyecto de renovación urbana de la plaza de la Gardunya, situada en la parte posterior del antiguo mercado de la Boquería, en las Ramblas de Barcelona.\n\n" +
        "El edificio de arte y diseño se expresa hacia la plaza con singularidad y movimiento, mediante la fragmentación y diferente orientación de los volúmenes arquitectónicos.\n\n" +
        "La fachada principal está recubierta por un material cerámico de grandes dimensiones fabricado especialmente para este proyecto, que le proporciona unitariedad y una imagen emblemática. Unos grandes ventanales de proporción cuadrada generan profundidad y transparencia hacia el interior del edificio.\n\n" +
        "El espacio interior de la escuela es abierto y unitario. Está formado por un gran vestíbulo interconectado visualmente entre todas las plantas del edificio que permite la entrada de luz y reúne las circulaciones interiores. Una terraza al final de cada espacio de circulación abre el edificio hacia la plaza, respondiendo así a la voluntad de disponer de espacios abiertos que favorezcan la relación entre los alumnos.\n\n" +
        "El programa del edificio se desarrolla principalmente en planta baja y en cinco plantas superiores, más una planta sótano. Los espacios se organizan según los diferentes usos, ya sean talleres o aulas. Las aulas, orientadas hacia el sur, y los talleres, hacia el norte, están separados por un gran atrio central, que actúa como un pasaje urbano en potencia.\n\n" +
        "El acceso principal se localiza en la calle Florista de la Rambla, buscando un vínculo con el futuro pasaje y los jardines de Rubió i Lluch. Además de este acceso principal, el edificio cuenta con otros de carácter secundario, que se plantean en función de las necesidades programáticas de la escuela: uno de ellos está situado en la Plaza de la Gardunya, vinculado a la sala de exposiciones, y otro junto al Mercado de la Boquería, vinculado al salón de actos. Este último puede funcionar de manera independiente, permitiendo el desarrollo de actividades culturales fuera de los horarios de la escuela.",
      source: { lines: "259-269 (cat), 276-286 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [],
    conflicts: [],
    uncertainties: [],
    sourceNotes: [
      "The fiche's own header line (line 247) prints the building name in Spanish, 'Escuela Massana', not the Catalan 'Escola Massana' used by the handoff/candidate slug — transcribed verbatim in `header.nameAsPrinted` rather than silently normalized to Catalan.",
      "The Catalan Descripció WEB block (lines 259-269) contains three markdown-escaped asterisk markers in the source export — '\\*Gardunya', '\\*Boquería', '\\*unitariedad' — preserved verbatim above rather than cleaned (their intent, e.g. an unresolved spellcheck flag from the source document, is not established by this pass). The parallel Spanish block carries the same three words with no such marker.",
    ],
  },
  {
    slot: 18,
    slug: "la-escocesa-nau-foseco",
    handoffDisplayName: "La Escocesa, specifically Nau Foseco",
    header: {
      nameAsPrinted: "La Escocesa",
      dateLabelAsPrinted: "2024",
      styleAsPrinted: "Rehabilitació Arquitectura industrial",
      architectAsPrinted: "Nug",
      source: { lines: "290-293", block: "header" },
    },
    forma: {
      cat:
        "La intervenció arquitectònica transforma una part de l'antiga fàbrica L'Escocesa en un espai per a producció artística i participació ciutadana. El projecte estableix una connexió urbana mitjançant un tall que relaciona l'avinguda Bolívar amb el carrer Pere IV. La nau principal conserva un gran espai obert, la configuració interior del qual es pot modificar mitjançant sistemes mòbils.",
      es:
        "La intervención arquitectónica transforma una parte de la antigua fábrica La Escocesa en un espacio para producción artística y participación ciudadana. El proyecto establece una conexión urbana mediante un corte que relaciona la avenida Bolívar con la calle Pere IV. La nave principal conserva un gran espacio abierto cuya configuración interior se puede modificar mediante sistemas móviles.",
      source: { lines: "300-301 (cat), 312-313 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Situada en el districte industrial del Poble Nou, la intervenció arquitectònica transforma una part de l'antiga Fàbrica l'Escocesa en un espai per a producció artística i participació ciutadana.\n\n" +
        "La filosofia del projecte no consisteix a restaurar L'Escocesa per a convertir-la en un museu de si mateixa, sinó utilitzar la seva estructura industrial com a suport per a una activitat contemporània.\n\n" +
        "La intervenció parteix de la idea que l'edifici existent sigui una espècie d'envolupant industrial capaç d'admetre usos canviants, aprofitar el seu caràcter industrial i transformar-ho en una infraestructura flexible per a artistes.\n\n" +
        "L'actuació introdueix una nova relació espacial entre l'espai públic i l'equipament mitjançant una connexió urbana mitjançant un tall que relaciona l'avinguda Bolívia amb el carrer Pere IV. Aquest pas no sols facilita la circulació per als vianants, sinó també la integració de l'Escocesa com a part dels recorreguts per als vianants d'aquesta part de la ciutat.\n\n" +
        "El nucli de la intervenció el constitueix un ampli passadís interior: un espai compartit i sense climatització artificial que alberga instal·lacions i equipaments com a lavabos, lavabos, bancs i vegetació. Un sostre reflector i amb aïllament tèrmic reforça l'estratègia de climatització passiva en actuar com a zona d'amortiment tèrmic. Aquesta resposta climàtica es complementa amb un mur de formigó dissenyat per a retenir la inèrcia tèrmica i irradiar calor.",
      es:
        "Situada en el distrito industrial del Poble Nou, la intervención arquitectónica transforma una parte de la antigua Fábrica la Escocesa en un espacio para producción artística y participación ciudadana.\n\n" +
        "La filosofía del proyecto no consiste en restaurar La Escocesa para convertirla en un museo de sí misma, sino utilizar su estructura industrial como soporte para una actividad contemporánea.\n\n" +
        "La intervención parte de la idea de que el edificio existente sea una especie de envolvente industrial capaz de admitir usos cambiantes, aprovechar su carácter industrial y transformarlo en una infraestructura flexible para artistas.\n\n" +
        "La actuación introduce una nueva relación espacial entre el espacio público y el equipamiento mediante una conexión urbana mediante un corte que relaciona la avenida Bolivia con la calle Pere IV. Este paso no solo facilita la circulación peatonal, sino también la integración de la Escocesa como parte de los recorridos peatonales de esta parte de la ciudad.\n\n" +
        "El núcleo de la intervención lo constituye un amplio pasillo interior: un espacio compartido y sin climatización artificial que alberga instalaciones y equipamientos como lavabos, aseos, bancos y vegetación. Un techo reflectante y con aislamiento térmico refuerza la estrategia de climatización pasiva al actuar como zona de amortiguación térmica. Esta respuesta climática se complementa con un muro de hormigón diseñado para retener la inercia térmica e irradiar calor.\n\n" +
        "El proyecto culmina con una perforación sencilla pero intencionada que establece una conexión directa entre la nueva plaza pública y la sala de exposiciones.\n\n" +
        "En cuanto a la organización del programa funcional, en lugar de diseñar habitaciones perfectamente determinadas para cada función, se conserva un gran espacio industrial y se introducen sistemas que permiten modificar su configuración. Es lo que los arquitectos denominan \u201corganización sin distribución\u201d: la arquitectura proporciona las condiciones, pero no determina completamente qué tiene que suceder en cada lugar.",
      source: { lines: "303-308 (cat), 315-328 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [
      {
        field: "rehabilitationYear",
        value: "2024",
        provenance:
          "OPERATOR-approved correction stated in Prompt 046-03 ('La Escocesa Nau Foseco ... rehabilitation 2024') — corroborated directly by this fiche's own header date line (line 291: '2024').",
      },
    ],
    conflicts: [],
    uncertainties: [
      "The specific sub-building name 'Nau Foseco' (used in the handoff table and Prompt 046-03's candidate slug/name) does NOT appear anywhere in this fiche's text — confirmed by a full read of the document and by grep (no match for 'Foseco' in the source file at all). The fiche describes the architectural intervention at 'L'Escocesa'/'La Escocesa' generally, never naming a specific nau (shed/bay) within the former factory complex. This matches the prior TG046 report's own open finding (§2.5: photo evidence does not itself confirm 'Nau Foseco' as distinct from the whole former factory) — carried forward here as unresolved, not newly discovered or newly resolved by this pass. An OPERATOR documentary/visual source distinct from this fiche is needed before 'Nau Foseco' specificity can be treated as editorially verified.",
    ],
    sourceNotes: [],
  },
  {
    slot: 19,
    slug: "vpo-torre-baro",
    handoffDisplayName: "VPO Torre Baró",
    header: {
      nameAsPrinted: "Vivienda VPO en Torre Baró",
      dateLabelAsPrinted: "2017 - 2022",
      styleAsPrinted: "Arquitectura sostenible",
      architectAsPrinted: "arquitectura dataAE, NARCH i Maira Arquitectes",
      source: { lines: "330-333", block: "header" },
    },
    forma: {
      cat:
        "L'edifici està organitzat al voltant d'un espai central que optimitza l'eficiència energètica del conjunt i ofereix espais de trobada entre els veïns. El pati és un gestor tèrmic amb una coberta bioclimática. La configuració interior disposa de mòduls versàtils de 10 metres x 10 metres, tots iguals, per a afavorir la multifuncionalitat.",
      es:
        "El edificio está organizado alrededor de un espacio central que optimiza la eficiencia energética del conjunto y ofrece espacios de encuentro entre los vecinos. El patio es un gestor térmico con una cubierta bioclimática. La configuración interior dispone de módulos versátiles de 10 metros x 10 metros, todos iguales, para favorecer la multifuncionalidad.",
      source: { lines: "340-341 (cat), 356-357 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "Aquest edifici d'habitatges socials està organitzat al voltant d'un espai central en forma d'atri que optimitza l'eficiència energètica del conjunt i conté amplis replans en l'escala que ofereixen espais de trobada entre els veïns.\n\n" +
        "Aquest pati central està projectat com un gestor tèrmic de l'edifici, amb una coberta bioclimàtica que es pot obrir, tancar i protegir del sol.\n\n" +
        "El projecte presenta una única tipologia de pisos-pati passants en altura, on totes les peces se situen en la façana, amb il·luminació natural i vistes a l'entorn.\n\n" +
        "Els habitatges incorporen un espai intermedi tipus terrassa-galeria, que permet aprofitar la ventilació creuada i, quan es tanca, aportar guanys tèrmics per l'efecte d'hivernacle, evitant la necessitat de calefacció.\n\n" +
        "La posició de la galeria s'alterna: en uns pisos és l'accés i, en uns altres, la galeria se situa en l'extrem de l'habitatge.\n\n" +
        "La configuració interior disposa d'habitacions versàtils de 10 metres, totes iguals, per a afavorir la multifuncionalitat.",
      es:
        "Este edificio de viviendas sociales está organizado alrededor de un espacio central en forma de atrio que optimiza la eficiencia energética del conjunto y contiene amplios rellanos en la escalera que ofrecen espacios de encuentro entre los vecinos.\n\n" +
        "Este patio central está proyectado como un gestor térmico del edificio, con una cubierta bioclimática que se puede abrir, cerrar y proteger del sol.\n\n" +
        "El proyecto presenta una única tipología de pisos-patio pasantes en altura, donde todas las piezas se ubican en la fachada, con iluminación natural y vistas al entorno.\n\n" +
        "Las viviendas incorporan un espacio intermedio tipo terraza-galería, que permite aprovechar la ventilación cruzada y, cuando se cierra, aportar ganancias térmicas por el efecto invernadero, evitando la necesidad de calefacción.\n\n" +
        "La posición de la galería se alterna: en unos pisos es el acceso y, en otros, la galería se sitúa en el extremo de la vivienda.\n\n" +
        "La configuración interior dispone de habitaciones versátiles de 10 metros, todas iguales, para favorecer la multifuncionalidad.",
      source: { lines: "343-352 (cat), 359-368 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [],
    conflicts: [],
    uncertainties: [
      "Three firms are credited in this fiche's header ('arquitectura dataAE, NARCH i Maira Arquitectes'); the handoff/prompt table names only 'DATAAE'/'dataAE'. Not treated as a conflict (the fiche's fuller list is not contradicted by the shorter handoff reference, just more complete) but noted for a future integration pass to decide which form to display.",
    ],
    sourceNotes: [
      "forma.es (source lines 356-357): the source document prints 'bioclimática.La configuración' with no space between the two sentences; this draft stores 'bioclimática. La configuración' (missing-space correction; no word, fact, or number changed). OPERATOR approved preserving this editorial spacing fix on 2026-10-13, per the TG046 046-06A audit evidence (row 30) and Prompt 046-06B.",
      "header.dateLabelAsPrinted (source line 331): the source document prints a markdown-escaped hyphen, '2017 \\- 2022', while this draft stores the lossless rendering '2017 - 2022' (escape character removed; no date fact changed). OPERATOR approved retaining this rendering on 2026-10-13, per the TG046 046-06A audit evidence (§3 header finding) and Prompt 046-06B.",
    ],
  },
  {
    slot: 20,
    slug: "illa-glories-bloc-a",
    handoffDisplayName: "Illa Glòries Bloc A, 51 habitatges",
    header: {
      nameAsPrinted: "51 Habitatges socials. Bloc A de l'Illa Glòries",
      dateLabelAsPrinted: "2025",
      styleAsPrinted: "Arquitectura flexible i sostenible",
      architectAsPrinted: "Cierto Estudio",
      source: { lines: "371-374", block: "header" },
    },
    forma: {
      cat:
        "L'edifici forma part de la gran illa residencial de Glòries. Exemplifica una arquitectura centrada en la flexibilitat i la inclusió. La planta dels habitatges gira entorn d'un nucli central girat 45 graus, la qual cosa permet una disposició fluida i versàtil dels espais, permetent diferents configuracions en funció de les estructures familiars.",
      es:
        "El edificio forma parte de la gran manzana residencial de Glòries. Ejemplifica una arquitectura centrada en la flexibilidad y la inclusión. La planta de las viviendas gira en torno a un núcleo central rotado 45 grados, lo que permite una disposición fluida y versátil de los espacios, permitiendo diferentes configuraciones en función de las estructuras familiares.",
      source: { lines: "381-382 (cat), 395-396 (es)", block: "FORMA" },
    },
    descripcioWeb: {
      cat:
        "El bloc A de 51 habitatges forma part de la poma Glòries destinada a VPO, que s'organitza en una illa compacta travessada per un passatge per als vianants. Cada parell de blocs s'articula entorn de patis veïnals, promovent la convivència i la vida comunitària.\n\n" +
        "Aquest edifici exemplifica una arquitectura centrada en la flexibilitat i la inclusió. La seva planta gira entorn d'un nucli central girat 45 graus, la qual cosa permet una disposició fluida i versàtil dels espais, permetent diferents configuracions en funció de les estructures familiars.\n\n" +
        "Aquest disseny, que elimina passadissos innecessaris, genera visuals que amplien la percepció de l'espai, mentre que les terrasses corregudes d'accés —a mode de corrales modernes— esborren els límits entre el públic i el privat.\n\n" +
        "Aquestes passarel·les exteriors, orientades al sud i eixamplades en les entrades, creen espais intermedis per a activitats col·lectives i protegeixen la privacitat gràcies a les reculades de la façana interior.\n\n" +
        "En l'aspecte constructiu, l'edifici combina una base de formigó amb una estructura superior de fusta contralaminada (CLT), oculta després dels revestiments. Aquesta elecció redueix la petjada ecològica de l'edifici en minimitzar el pes estructural, l'ús de materials no renovables i el consum d'aigua en obra. A més, compleix amb els estàndards NZEB (edificis de consum energètic gairebé nul), integrant estratègies com la ventilació creuada, la protecció solar passiva i cobertes verdes.",
      es:
        "El bloque A de 51 viviendas forma parte de la manzana Glories destinada a VPO, que se organiza en una manzana compacta atravesada por un pasaje peatonal. Cada par de bloques se articula en torno a patios vecinales, promoviendo la convivencia y la vida comunitaria.\n\n" +
        "Este edificio ejemplifica una arquitectura centrada en la flexibilidad y la inclusión. Su planta gira en torno a un núcleo central rotado 45 grados, lo que permite una disposición fluida y versátil de los espacios, permitiendo diferentes configuraciones en función de las estructuras familiares.\n\n" +
        "Este diseño, que elimina pasillos innecesarios, genera visuales que amplían la percepción del espacio, mientras que las terrazas corridas de acceso —a modo de corralas modernas— borran los límites entre lo público y lo privado.\n\n" +
        "Estas pasarelas exteriores, orientadas al sur y ensanchadas en las entradas, crean espacios intermedios para actividades colectivas y protegen la privacidad gracias a los retranqueos de la fachada interior.\n\n" +
        "En el aspecto constructivo, el edificio combina una base de hormigón con una estructura superior de madera contralaminada (CLT), oculta tras los revestimientos. Esta elección reduce la huella ecológica del edificio al minimizar el peso estructural, el uso de materiales no renovables y el consumo de agua en obra. Además, cumple con los estándares NZEB (edificios de consumo energético casi nulo), integrando estrategias como la ventilación cruzada, la protección solar pasiva y cubiertas verdes.",
      source: { lines: "384-391 (cat), 398-405 (es)", block: "Descripció WEB" },
    },
    typography: TYPOGRAPHY_PENDING,
    supplementalFacts: [
      {
        field: "unitCount",
        value: "51 habitatges, Bloc A",
        provenance:
          "Directly confirmed by this fiche's own header ('51 Habitatges socials. Bloc A de l'Illa Glòries') and Descripció WEB text ('El bloc A de 51 habitatges...') — no conflict, no supplementation needed beyond the source itself.",
      },
      {
        field: "architecturalTimelineStart",
        value: "2017",
        provenance:
          "OPERATOR-approved correction stated in Prompt 046-03 ('Illa Glòries specifically Bloc A, 51 dwellings and architectural timeline 2017-2025'). This fiche's own header date line (line 372) states only '2025' — a single year, not a range — so the '2017' start year is NOT independently corroborated by this source document; listed as a supplemental (not fiche-sourced) fact rather than merged into `header.dateLabelAsPrinted`.",
      },
    ],
    conflicts: [],
    uncertainties: [
      "The fiche's single-year header ('2025') versus the OPERATOR's '2017-2025' range is not a contradiction (2025 could be the completion year within that range) but is also not reconciled by this source alone — a future integration pass should decide the displayed `CaseDate` shape (e.g. design-start 2017 / completion 2025) against an independent citation for 2017, which this pass did not locate.",
    ],
    sourceNotes: [],
  },
] as const;
