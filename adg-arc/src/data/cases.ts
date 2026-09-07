// Canonical case dataset for the ADG-ARC "current 10" physical+digital
// collection. Source-authoritative facts are transcribed from the recovered
// definitive physical+digital typography/architecture spreadsheet
// ("TIPOGRAFÍA Y ARQUITECTURA VERSIÓN DEFINITIVA — FISICOS + DIGITAL").
// Anything that source leaves blank stays explicitly null/'tbd' here rather
// than being invented — see TG005 handoff §3.5.

export type SourceId =
  | "source:csv-tipografia-arquitectura"
  | "product:tg004-prototype-coordinate";

const CSV_SOURCE: SourceId = "source:csv-tipografia-arquitectura";
const PROTOTYPE_COORDINATE: SourceId = "product:tg004-prototype-coordinate";

export interface CaseIdentity {
  name: string;
  sourceName?: string;
  year: number;
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
  designer: string;
  sourceUrl?: string | null;
  // Secondary typefaces are PARKED for every case per TG005 handoff §3.3 —
  // never active product content, never surfaced in the interface.
  secondaryStatus: "parked";
  // Internal-only record that the source row also carried a secondary
  // typeface. Never rendered — see handoff §3.3.
  secondarySourceNoted?: boolean;
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

export type SpecimenMode = "dhub" | null;

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
  // architecture `traits` and case-specific `specimenMode` stay scoped to
  // this flag by product decision (ADGARC-DEC-001 parks case-specific
  // specimen expansion) — it no longer gates `correlation.rationale`,
  // which TG007 populates for all 10 cases. See TG007 handoff.
  editorial: boolean;
  specimenMode: SpecimenMode;
}

export const cases: CaseRecord[] = [
  {
    slug: "casa-caracoles",
    identity: {
      name: "Casa de los Caracoles",
      year: 1895,
      architect: "Carles Bosch i Negre",
      address: "Entença, 2",
    },
    experienceType: "physical_digital",
    architecture: { movement: "Modernismo", movementStatus: "verified" },
    typography: {
      primaryFamily: "Glucosa",
      designer: "Jordi Embodas",
      sourceUrl: "https://tipografies.com/fonts/glucosa",
      secondaryStatus: "parked",
      secondarySourceNoted: true,
    },
    correlation: {
      rationale:
        "Glucosa es una tipografía sans serif de construcción moderna, pero con remates suaves, orgánicos y redondeados que evocan formas manuscritas o caligráficas. El edificio funciona casi como una letra decorada: su marcada estructura vertical —columnas, pilastras y divisiones entre balcones— recuerda los trazos principales que sostienen una letra, mientras que los balcones laterales y los volúmenes curvos evocan los remates o terminales de algunas letras, aportando personalidad y movimiento. Las decoraciones vegetales blancas sobre el fondo rojizo remiten a los contrastes internos de una letra —llenos y vacíos, positivo y negativo—, del mismo modo que las ventanas, los balcones y los huecos generan ese ritmo visual entre masa construida y espacio vacío. El carácter ornamental de la fachada, casi como una tipografía de display, comunica una identidad marcada incluso antes de poder leerse.",
      sourceRationale:
        "Glucosa es una font de construcció (anatomia) moderna, ja que es una font sans serif (de pal sec), però amb uns acabats suaus, orgànics i arrodonits, imitant les formes manuscrites o cal·ligràfiques.\n\n" +
        "Relació edifici-tipografia\n" +
        "L'edifici funciona gairebé com una lletra decorada: té una estructura vertical molt marcada, igual que les astes d'una tipografia. Les columnes, pilastres i divisions entre balcons recorden els traços principals que sostenen una lletra.\n" +
        "Els balcons laterals i els volums corbats es podrien relacionar amb els terminals o remats d'algunes lletres: no són només funcionals, sinó que afegeixen personalitat i moviment. Igual que en una tipografia amb corbes o acabaments expressius, aquests elements suavitzen la rigidesa de la façana.\n" +
        "Les decoracions vegetals blanques sobre el fons vermellós recorden els contrastos interns d'una lletra: zones de ple i buit, positiu i negatiu. En tipografia, les contraformes són els espais interiors o al voltant de les lletres; aquí, les finestres, els balcons i els buits generen aquest mateix ritme visual entre massa arquitectònica i espai buit.\n" +
        "La façana té un caràcter molt ornamental, gairebé com una tipografia display: no busca només ser funcional, sinó també ser reconeixible, expressiva i memorable. Igual que una lletra decorativa comunica un to abans fins i tot de ser llegida, aquest edifici comunica una identitat molt marcada abans fins i tot d'analitzar-ne la funció.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "casa-rodriguez-arias",
    identity: {
      name: "Casa Rodriguez Arias",
      year: 1931,
      architect: "Germà Rodríguez i Arias",
      address: "Vía Augusta 61",
    },
    experienceType: "physical_digital",
    architecture: { movement: "Racionalismo", movementStatus: "verified" },
    typography: {
      primaryFamily: "Arboria",
      designer: "Josema Urós",
      sourceUrl: "https://type-o-tones.com/fonts/arboria",
      secondaryStatus: "parked",
      secondarySourceNoted: true,
    },
    correlation: {
      rationale:
        "Arboria parte del concepto de un «sans» arquitectónico arquetípico, introduciendo rasgos de estilo grotesco en formas geométricas para atemperar las letras; su generosa altura de x aporta modernidad sin renunciar a un aire art déco. La tipografía muestra un predominio de formas limpias y sans serif, con trazos rectos y una construcción muy racional, lo que conecta directamente con la fachada del edificio, organizada a partir de una retícula regular de ventanas, balcones y aberturas repetidas: igual que en las letras, la arquitectura se basa en el orden, la repetición y el equilibrio. Las líneas verticales y horizontales de la tipografía se relacionan con los ejes estructurales de la fachada, y las aberturas rectangulares, los balcones y la cubierta superior refuerzan esa sensación de composición construida con una lógica clara, casi tipográfica. Tanto la tipografía como el edificio comparten una estética funcional, contenida y moderna, que no busca la ornamentación excesiva sino una belleza basada en la proporción, el ritmo y la claridad formal.",
      sourceRationale:
        "Arboria parteix del concepte d'un “sans” arquitectònic arquetípic. Introdueix elements d'estil “grotesc (sans serif classic)” a les formes geomètriques per a templar més les lletres. Amb la seva generosa altura de x, els caràcters d'Arboria llueixen modernitat sense renunciar a un aire art déco i aportar una variant alternativa personal i extrovertida als dissenys més reservats del gènere.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia mostra un predomini de formes netes i sans serif, amb traços rectes, gruixos bastant uniformes i una construcció molt racional. Això connecta directament amb la façana de l'edifici, que s'organitza a partir d'una retícula regular de finestres, balcons i obertures repetides. Igual que les lletres, l'arquitectura es basa en l'ordre, la repetició i l'equilibri.\n" +
        "També es pot relacionar la presència de línies verticals i horitzontals de les lletres amb els eixos estructurals de la façana. Les obertures rectangulars, els balcons i la coberta superior reforcen aquesta sensació de composició construïda amb una lògica clara, gairebé tipogràfica.\n" +
        "Tant la tipografia com l'edifici comparteixen una estètica funcional, continguda i moderna. No busquen l'ornamentació excessiva, sinó una bellesa basada en la proporció, el ritme i la claredat formal.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "casa-de-la-marina",
    identity: {
      name: "Casa de la Marina",
      sourceName: "Casa de la Marina en la Barceloneta",
      year: 1955,
      architect: "José Antonio Coderch",
      address: "Paseo Juan de Borbón 43",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Racionalismo Catalán de Posguerra",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "AT Aero",
      designer: "Pedro Arilla",
      sourceUrl: "https://arillatype.studio/font/at-aero",
      secondaryStatus: "parked",
      secondarySourceNoted: true,
    },
    correlation: {
      rationale:
        "AT Aero es un dispositivo elegante de inspiración aerodinámica, donde formas curvas y líneas nítidas conviven en una tipografía sans serif de gran personalidad, abierta y potente. Sus formas limpias y estilizadas, con trazos rectos y una apariencia ligera pero precisa, conectan directamente con la fachada del edificio, organizada mediante franjas verticales muy marcadas y una repetición regular de lamas o paneles: en ambos casos la estructura visual se basa en el orden y la repetición. El contraste entre los distintos pesos de la familia tipográfica —de Thin a Black— dialoga con el juego del edificio entre partes más ligeras, como las celosías blancas, y partes más pesadas o macizas, como los volúmenes laterales de color terroso, generando ritmo y jerarquía visual. Las versiones itálicas aportan cierta sensación de dinamismo, mientras que el edificio, pese a su marcada ortogonalidad, gana tensión visual gracias a la perspectiva de la esquina y a la repetición vertical de los cerramientos. Tipografía y arquitectura comparten así una estética contemporánea y racional, en la que la forma es clara y funcional, sostenida por la proporción, el ritmo y la estructura antes que por el ornamento.",
      sourceRationale:
        "At Aero és un elegant dispositiu de futurisme inspirat en el disseny aerodinàmic. Formes corbes i línies nítides coexisteixen en una esfera tipogràfica pura concebuda per a veus úniques. At Aero és una bella peça de maquinària i una tipografia carismàtica: una esfera sans-serif sensible amb una gran personalitat. Oberta, forta i omnipotent; és una font per a exploradors.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia presenta formes sans serif, netes i molt estilitzades, amb traços rectes i una aparença lleugera però precisa. Això connecta directament amb la façana de l'edifici, que està organitzada mitjançant franges verticals molt marcades i una repetició regular de lames o panells. Igual que en la lletra, l'estructura visual es basa en l'ordre i la repetició.\n" +
        "També és interessant el contrast entre pesos de la família tipogràfica —des de Thin fins a Black—, perquè a l'edifici també hi ha aquest joc entre parts més lleugeres, com les gelosies blanques, i parts més pesades o massisses, com els volums laterals de color terrós. Aquesta alternança genera ritme i jerarquia visual.\n" +
        "Les versions itàliques de la tipografia aporten una certa sensació de dinamisme i inclinació, mentre que l'edifici, tot i ser molt ortogonal, guanya tensió visual gràcies a la perspectiva de la cantonada i a la repetició vertical dels tancaments. En tots dos casos hi ha una combinació d'elegància, funcionalitat i modernitat.\n" +
        "Finalment, tant la tipografia com l'arquitectura comparteixen una estètica contemporània i racional, on la forma és clara, funcional i visualment coherent. No depenen de l'ornament, sinó de la proporció, el ritme i l'estructura per construir la seva identitat.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "cocheras-de-sarria",
    identity: {
      name: "Cocheras de Sarrià",
      sourceName: "Viviendas Cocheras de Sarriá",
      year: 1970,
      architect: "José Antonio Coderch",
      address: "Passeig Manuel Girona",
    },
    experienceType: "physical_digital",
    // Architectural categorization is explicitly TBD for TG005 — not
    // blocked, not inferred. See handoff §3.4.
    architecture: { movement: null, movementStatus: "tbd" },
    typography: {
      primaryFamily: "Aribau Grotesk",
      designer: "Eduardo Manso",
      sourceUrl: "https://emtype.net/fonts/aribau-grotesk",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Aribau Grotesk nace de la intersección entre tipografías geométricas y grotescas, combinando un bajo contraste y proporciones generosas con rasgos propios del gótico americano de principios del siglo XX, como aberturas amplias en los ojales y una «g» de doble piso, lo que le da un aspecto afable y contemporáneo. La familia combina pesos muy contrastados, desde trazos finos y ligeros hasta formas muy negras y contundentes, lo que se relaciona con el edificio: los volúmenes de ladrillo tienen una presencia fuerte y compacta, mientras que los huecos, las aberturas y los retranqueos aportan ligereza y respiración. Las astas verticales y los trazos rectos recuerdan la estructura repetitiva de la fachada —balcones, pilares y ejes de aberturas—, y las contraformas de las letras pueden compararse con los espacios interiores que generan los balcones encastados y los retranqueos del volumen. También hay una relación clara en el ritmo modular: la tipografía alterna cuerpos grandes y pequeños, pesos fuertes y líneas más finas, igual que el edificio repite módulos de balcón y alterna volúmenes salientes y entrantes, creando una fachada muy rítmica. Tipografía y edificio comparten así un carácter moderno, estructurado y expresivo, cuya identidad nace del juego entre solidez y ligereza, entre estructura y ritmo.",
      sourceRationale:
        "Nascuda de la intersecció de les tipografies geomètriques i grotesques, Aribau Grotesk combina un baix contrast i unes proporcions d'amplada generoses amb trets típics del gòtic americà de principis del segle XX, com l'obertura dels comptadors i una \"g\" de doble pis. Impulsada pel procés, van sorgir alguns detalls que provenen de l'estil geomètric, com les figures de formes netes i els punts circulars que transmeten un aspecte més afable i contemporani.\n\n" +
        "Relació edifici-tipografia\n" +
        "La familia tipogràfica combina pesos molt contrastats, des de traços fins i lleugers fins a formes molt negres i contundents. Això es pot relacionar amb l'edifici, on els volums de maó tenen una presència forta i compacta, mentre que els buits, les obertures i els retranquejos aporten respiració i lleugeresa. Igual que en tipografia, la composició es construeix a partir de l'equilibri entre massa i buit.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals i els traços rectes recorden l'estructura repetitiva de la façana, especialment en la successió de balcons, pilars i eixos d'obertures. Les contraformes de lletres es poden comparar amb els espais interiors que generen els balcons encastats i els recessos del volum arquitectònic: no només defineix la forma el que és construït, sinó també el que queda buit.\n" +
        "També hi ha una relació clara en el ritme modular. La tipografia alterna cossos grans i petits, pesos forts i línies més fines; l'edifici fa una cosa semblant amb la repetició dels mòduls de balcó i amb els volums que sobresurten i es reculen, creant una façana molt rítmica. Aquesta repetició dona identitat tant a la composició gràfica com a l'arquitectònica.\n" +
        "Finalment, tant la tipografia com l'edifici comparteixen un caràcter modern, estructurat i expressiu. No es basen tant en l'ornament superficial com en la força de la proporció, el contrast i la construcció formal. En tots dos casos, la identitat visual neix del joc entre solidesa i lleugeresa, entre estructura i ritme.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "hotel-arts",
    identity: {
      name: "Hotel Arts",
      sourceName: "Hotel Arts Villa Olímpica",
      year: 1992,
      architect: "Bruce Graham",
      address: "Villa Olímpica",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Arquitectura High-Tech",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Mecano",
      designer: "Andreu Balius",
      sourceUrl: "https://typerepublic.com/fonts/mecano/",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Mecano se inspira en formas geométricas: sus líneas limpias y amplias capturan la esencia de la tecnología mecánica, evocando la ciencia ficción y una visión lúdica pero imaginativa del futuro. Su carácter mecánico y futurista, con formas sans serif, trazos rectos, proporciones condensadas y acabados muy limpios, conecta directamente con la arquitectura high-tech del edificio, donde la estructura metálica exterior es visible y se convierte en parte esencial de su identidad visual. Las astas verticales de las letras recuerdan la altura y esbeltez de la torre, y sus trazos gruesos se relacionan con los grandes elementos estructurales del edificio, mientras que las versiones más finas evocan las líneas más ligeras de la retícula metálica. Las diagonales tienen un papel importante: en la fachada, las cruces metálicas forman una red de ejes inclinados que recuerda los trazos diagonales de letras como la K, la V, la W o la X, aportando tensión, dinamismo y una sensación de ingeniería propia de una tipografía de carácter técnico. Las contraformas de las letras —sus espacios interiores— pueden compararse con los huecos entre la estructura metálica y los vidrios de la fachada. Tipografía y edificio comparten así un lenguaje racional, modular y tecnológico que comunica modernidad, potencia y una cierta idea de futuro.",
      sourceRationale:
        "Mecano és una tipografia inspirada en formes geomètriques. Les seves formes netes i àmplies capturen l'essència de la tecnologia mecànica, evocant connexions amb pel·lícules de ciència-ficció, futurs imprevisibles, cinema de sèrie B, l'univers Trekkie i diverses visions de la cultura pop futurista contemporània. Mecano ofereix una visió juganera però imaginativa del futur.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia té un caràcter molt mecànic i futurista, amb formes sans serif, traços rectes, proporcions condensades i acabaments molt nets. Això connecta directament amb l'edifici, que mostra una arquitectura d'aspecte high-tech, on l'estructura metàl·lica exterior és visible i es converteix en part essencial de la seva identitat visual.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals de les lletres recorden l'alçada i l'esveltesa de la torre. Els traços gruixuts de paraules es poden relacionar amb els grans elements estructurals de l'edifici, mentre que les versions més fines evoquen les línies més lleugeres de la retícula metàl·lica.\n" +
        "També és molt important la presència de les diagonals. A la façana, les creus metàl·liques formen una xarxa d'eixos inclinats que recorda els traços diagonals de lletres com la K, V, W o X. Aquestes diagonals aporten tensió, dinamisme i una sensació d'enginyeria, igual que passa en una tipografia de caràcter tècnic.\n" +
        "Les contraformes de les lletres —els espais interiors o buits— es poden comparar amb els espais que queden entre l'estructura metàl·lica i els vidres de la façana. En tots dos casos, el buit és tan important com el ple, perquè ajuda a construir el ritme visual i la llegibilitat del conjunt.\n" +
        "Finalment, tant la tipografia com l'edifici comparteixen un llenguatge racional, modular i tecnològic. No busquen una ornamentació clàssica, sinó una expressivitat basada en l'estructura, la repetició i la precisió formal. La forma comunica modernitat, potència i una certa idea de futur.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "illa-diagonal",
    identity: {
      name: "Illa Diagonal",
      year: 1993,
      architect: "Rafael Moneo i Manuel S. Morales",
      address: "Avenida Diagonal 577",
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Arquitectura Racionalismo posmoderno",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Shentox",
      designer: "Eduardo Manso",
      sourceUrl: "https://emtype.net/fonts/shentox",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Shentox nació de la fascinación de su diseñador por la tipografía cuadrada de las matrículas británicas, evolucionando hasta convertirse en una familia contemporánea y muy legible, con una gama completa de pesos. Sus formas sans serif, de trazos limpios y geométricos y estética muy técnica, tienen un peso visual contundente que se relaciona con la presencia masiva del edificio: una arquitectura sólida, horizontal y estructurada. Las astas verticales y los trazos rectos recuerdan la repetición regular de las ventanas de la fachada, que funcionan casi como una retícula tipográfica, ordenada y sistemática, donde cada ventana actúa como un módulo dentro de la composición. Existe además un paralelismo en el contraste entre peso y ligereza: la tipografía combina formas muy gruesas con otras más finas y condensadas, igual que el edificio combina volúmenes más compactos de piedra u hormigón con los huecos regulares de las ventanas, generando ritmo y evitando la monotonía. Tipografía y edificio comparten así un lenguaje racional, industrial y contemporáneo que comunica eficiencia, estabilidad y una cierta idea de ingeniería.",
      sourceRationale:
        "Durant una visita a Londres l'any 2008 em va enamorar de la font cuadrada utilitzada a les matrícules dels cotxes britànics. Immediatament m'inspiré per començar a treballar en aquest tipus de lletra i des d'aleshores que vaig desenvolupar la forma intermitent. Varis viatges més a Londres i el projecte ha estat evolucionant fins que finalment es va despegar i es va convertir en Shentox.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia presenta formes sans serif, amb traços nets, geomètrics i una estètica molt tècnica. La tipografia te un pes visual contundent, que es pot relacionar amb la presència massissa de l'edifici: una arquitectura sòlida, horitzontal i estructurada.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals i els traços rectes recorden la repetició regular de les finestres de la façana. Aquestes obertures funcionen gairebé com una retícula tipogràfica, ordenada i sistemàtica, on cada finestra seria com un mòdul dins d'una composició.\n" +
        "També hi ha un paral·lelisme en el contrast entre pes i lleugeresa. La tipografia combina formes molt gruixudes amb altres de més fines i condensades; l'edifici fa una cosa semblant amb els volums més compactes de pedra o formigó i els buits regulars de les finestres. Aquesta alternança crea ritme i evita que el conjunt sigui monòton.\n" +
        "Finalment, tant la tipografia com l'edifici comparteixen un llenguatge racional, industrial i contemporani. No busquen una ornamentació decorativa, sinó una identitat basada en la funció, l'ordre i la precisió. La forma comunica eficiència, estabilitat i una certa idea d'enginyeria.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "dhub",
    identity: {
      name: "DhUB",
      sourceName: "DHub",
      year: 2014,
      architect: "MBM",
      address: "Plaça de les Glòries Catalanes, 38, 08018 Barcelona",
    },
    experienceType: "physical_digital",
    // The spreadsheet leaves `Corrent arquitectònic` empty for DhUB and the
    // methodology's period grouping is chronologically inconsistent with
    // 2014, so no movement is presented as settled source truth — see
    // handoff §12. Traits are the formal observations the source pairing
    // rationale itself makes, not an invented history.
    architecture: {
      movement: null,
      movementStatus: "tbd",
      traits: [
        "geometric volumes",
        "sharp, pronounced angles",
        "inclined planes",
        "cantilevers and overhangs",
        "structural contrast between volumes",
      ],
    },
    typography: {
      primaryFamily: "Horizontype Monospaced",
      designer: "Jordi Embodas",
      sourceUrl: "https://tipografies.com/fonts/horizontype",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Horizontype's monospaced, evenly weighted letterforms and sharp internal contrast echo DhUB's geometric volumes: the type's stable vertical stems parallel the building's structural solidity, while its diagonals and inner-form contrast recall the inclined planes and cantilevered overhangs that break the façade's symmetry. The typeface's heavier weights read like the building's darker, solid volumes; its lighter weights recall its glazed, more transparent surfaces.",
      sourceRationale:
        "Horizontype és una tipografia honesta: el disseny no té sobrepassos. Cap corba baixa per sota de la línia base ni s'estén per sobre de l'alçada de la x o l'alçada del tap. Els seus caràcters s'asseuen amb confiança entre les línies horitzontals que defineixen la seva mida, donant al disseny la seva personalitat distintiva. El que fa que Horizontype sigui únic, però, és que les seves formes internes no segueixen aquesta lògica.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia presenta una construcció sans serif, amb traços nets, angles marcats i un fort contrast entre pesos. Aquestes característiques recorden l'arquitectura de l'edifici, formada per volums geomètrics, plans inclinats i grans voladissos que trenquen la simetria tradicional.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals aporten estabilitat, mentre que les diagonals d'algunes lletres evoquen les escales exteriors i les línies inclinades de la façana. Igualment, les contraformes de les lletres es poden relacionar amb els grans buits, les obertures irregulars i els espais entre volums, que tenen un paper tan important com la massa construïda.\n" +
        "També hi ha una correspondència en el contrast de pes. Les paraules més gruixudes transmeten solidesa i presència, com els grans volums foscos de l'edifici, mentre que els pesos més lleugers recorden les superfícies de vidre i les línies més fines que aporten transparència i lleugeresa.\n" +
        "En conjunt, tant la tipografia com l'arquitectura comparteixen un llenguatge innovador, tecnològic i dinàmic, on la identitat visual sorgeix de la combinació entre estructura, geometria i contrast, més que no pas de l'ornamentació.",
      provenance: CSV_SOURCE,
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
    specimenMode: "dhub",
  },
  {
    slug: "la-borda",
    identity: {
      name: "La Borda",
      sourceName: "Cooperativa de Vivienda La Borda",
      year: 2018,
      architect: "La Col",
      address: null,
    },
    experienceType: "physical_digital",
    architecture: {
      movement: "Arquitectura industrializada y sostenible",
      movementStatus: "verified",
    },
    typography: {
      primaryFamily: "Geogrotesque Stencil",
      designer: "Eduardo Manso",
      sourceUrl: "https://emtype.net/fonts/geogrotesque-stencil",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Geogrotesque Stencil, perteneciente a la popular familia Geogrotesque, se concibió como tipografía de visualización que va un paso más allá al resolver los problemas típicos de las fuentes stencil, con tres anchuras de trazo que permiten adaptarse a distintos tamaños y materiales de impresión. Sus formas sans serif, muy geométricas y robustas, aparecen interrumpidas por pequeñas aberturas propias del estilo stencil, que recuerdan las celosías y persianas correderas de la fachada, capaces de fragmentar la superficie sin perder la continuidad del conjunto. Las astas rectas y gruesas se relacionan con la estructura metálica del edificio, mientras que las contraformas de las letras evocan los espacios abiertos entre balcones, pasarelas y cerramientos, donde el vacío tiene tanta importancia como el lleno. Existe también una clara correspondencia en la retícula modular: las letras se construyen a partir de formas repetitivas y proporcionadas, igual que la fachada se organiza en una sucesión regular de módulos, montantes y franjas horizontales, generando orden, ritmo y coherencia visual. Tipografía y edificio comparten así una estética industrial, funcional y contemporánea, cuya identidad nace de la sinceridad constructiva, la geometría y la repetición de los elementos estructurales.",
      sourceRationale:
        "La Geogrotesque Stencil és un membre de la popular família Geogrotesque, i tot i estar pensada com una tipografia de visualització, va un pas més enllà i intenta resoldre alguns dels problemes típics de les fonts stencil. La plantilla Geogrotesque ve amb 3 amplades de tall (A, B i C). Aquests talls no només permeten un millor rendiment en imprimir a diferents mides, sinó que també podeu canviar de versió segons la rigidesa del material utilitzat.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia Geogrotesque Stencil es caracteritza per formes sans serif, molt geomètriques i robustes, però interrompudes per petites obertures pròpies de l'estil stencil. Aquestes interrupcions recorden les gelosies i les persianes corredisses de la façana, que fragmenten la superfície sense perdre la continuïtat del conjunt.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes rectes i gruixudes es poden relacionar amb l'estructura metàl·lica de l'edifici, mentre que les contraformes de les lletres evoquen els espais oberts entre balcons, passeres i tancaments. En tots dos casos, el buit té tanta importància com el ple per definir la forma.\n" +
        "També hi ha una clara correspondència en la retícula modular. Les lletres es construeixen a partir de formes repetitives i proporcionades, igual que la façana, organitzada en una successió regular de mòduls, muntants i franges horitzontals. Aquesta repetició genera ordre, ritme i coherència visual.\n" +
        "Finalment, tant la tipografia com l'edifici comparteixen una estètica industrial, funcional i contemporània. La seva identitat no prové de l'ornamentació, sinó de la sinceritat constructiva, la geometria i la repetició dels elements estructurals, que transmeten una imatge sòbria però amb molta personalitat.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "biblioteca-ggm",
    identity: {
      name: "Biblioteca Gabriel García Márquez",
      sourceName: "Biblioteca Grabiel Garcia Marquez",
      year: 2023,
      architect: "Elena Orte, Guillermo Sevillano",
      address: "C/ del Treball, 219",
    },
    experienceType: "physical_digital",
    architecture: { movement: null, movementStatus: "tbd" },
    typography: {
      primaryFamily: "Sisters",
      designer: "Laura Meseguer",
      sourceUrl: "https://type-o-tones.com/fonts/sisters",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "La familia Sisters reúne cuatro tipografías que comparten principios fundamentales de construcción pero se diferencian entre sí, como hermanas, mediante variaciones de contraste, peso y rasgos de diseño; concebida originalmente como un proyecto de letras a medida para la identidad de una exposición de arte. Sus formas sans serif muy estilizadas, con trazos rectos e interrupciones propias del estilo stencil, recuerdan las lamas verticales de la fachada, que fragmentan la superficie sin perder una composición uniforme y ordenada. Las astas verticales de las letras se relacionan con el ritmo constante de los paneles de la fachada, mientras que las contraformas evocan los grandes ventanales de vidrio, donde el vacío y la transparencia tienen tanto protagonismo como los elementos construidos. Existe también una correspondencia en la repetición modular: las letras mantienen una estructura geométrica y repetitiva, igual que el edificio, que combina franjas horizontales, lamas verticales y voladizos en una composición equilibrada. Tipografía y edificio comparten así una estética minimalista y contemporánea, basada en la simplicidad formal, la precisión geométrica y el juego entre luz, sombra y estructura.",
      sourceRationale:
        "La família Sisters presenta quatre fonts noves que comparteixen principis fonamentals de construcció, però que es complementen entre si, com fan les germanes, celebrant les seves diferències. Les variacions en contrast, pes i característiques de disseny donen lloc a quatre estils diferents anomenats de l'U al Quatre. Aquest quartet modern no conté minúscules, afirmant el lloc que li correspon a la família en l'espai de la tipografia de títols. Sisters es va concebre com un projecte de lletres personalitzades; en aquest cas, el disseny es va elaborar per a la identitat d'una exposició d'art.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia presenta formes sans serif molt estilitzades, amb traços rectes i interrupcions pròpies de l'estil stencil. Aquestes obertures recorden les lames verticals de la façana, que fragmenten la superfície però mantenen una composició uniforme i ordenada.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals de les lletres es relacionen amb el ritme constant dels panells de la façana, mentre que les contraformes evoquen els grans finestrals de vidre, on el buit i la transparència tenen tant protagonisme com els elements construïts. Tant en la tipografia com en l'edifici, la forma es defineix tant pels plens com pels espais oberts.\n" +
        "També hi ha una correspondència en la repetició modular. Les lletres mantenen una estructura geomètrica i repetitiva, igual que l'edifici, que combina franges horitzontals, lames verticals i voladissos en una composició molt equilibrada. Aquesta regularitat transmet ordre i coherència visual.\n" +
        "Finalment, tant la tipografia com l'arquitectura comparteixen una estètica minimalista i contemporània, basada en la simplicitat formal, la precisió geomètrica i el joc entre llum, ombra i estructura, més que no pas en l'ornamentació.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
  {
    slug: "green-use-22",
    identity: {
      name: "Green@Use / 22@",
      sourceName: "Grenh@Use 140 22@",
      year: 2025,
      architect: "Marta Peris, Jose Toral, Jaime Pastor",
      address: "carrer Veneçuela 100,106 c/de l'Agricultura 92",
    },
    experienceType: "physical_digital",
    architecture: { movement: null, movementStatus: "tbd" },
    typography: {
      primaryFamily: "Quadrata",
      designer: "Gerard Sierra",
      sourceUrl: "https://gs-type.com/typefaces-quadrata/",
      secondaryStatus: "parked",
    },
    correlation: {
      rationale:
        "Quadrata es una tipografía experimental pensada para encajar cada glifo en un cuadrado, con un enfoque brutalista en los remates pero un filete orgánico, lo que le da un aspecto de letras de estilo Far West con un toque contemporáneo. Sus formas geométricas y modulares, de trazos gruesos interrumpidos por pequeñas separaciones que recuerdan una construcción a base de piezas, se relacionan con la fachada del edificio, formada por una retícula regular de pilares y lamas verticales donde cada módulo se repite de manera ordenada. Las astas verticales evocan los esbeltos pilares de la fachada, mientras que los trazos horizontales recuerdan las líneas continuas de los forjados y los balcones; las interrupciones propias de las letras generan contraformas que pueden asociarse a los espacios abiertos entre los elementos estructurales, dando al vacío el mismo protagonismo que a la materia. Las formas redondeadas de algunas letras contrastan con la rigidez de la retícula y aportan dinamismo, igual que los espacios abiertos y los retranqueos del edificio rompen la monotonía de la composición. Tipografía y edificio comparten así una estética contemporánea, precisa y racional, basada en la repetición de módulos, la claridad estructural y el equilibrio entre solidez y ligereza.",
      sourceRationale:
        "Quadrata és una tipografia experimental pensada per encaixar cada glif en un quadrat. Amb un enfocament brutalista als serifs però un filetejat orgànic, aquesta tipografia molt contrastada ens recorda les lletres lloses d'estil Far West però amb un toc contemporani.\n\n" +
        "Relació edifici-tipografia\n" +
        "La tipografia presenta formes geomètriques i modulars, amb traços gruixuts interromputs per petites separacions que recorden una construcció a base de peces. Aquesta característica es relaciona amb la façana de l'edifici, formada per una retícula regular de pilars i lames verticals, on cada mòdul es repeteix de manera ordenada.\n" +
        "Des del punt de vista de l'anatomia tipogràfica, les astes verticals evoquen els pilars esvelts de la façana, mentre que els traços horitzontals recorden les línies contínues dels forjats i els balcons. Les interrupcions pròpies de les lletres creen contraformes que es poden associar als espais oberts entre els elements estructurals, fent que el buit tingui el mateix protagonisme que la matèria.\n" +
        "També hi ha una relació en les formes arrodonides d'algunes lletres, que contrasten amb la rigidesa de la retícula i aporten dinamisme, igual que els espais oberts i els retranquejos de l'edifici trenquen la monotonia de la composició.\n" +
        "Finalment, tant la tipografia com l'arquitectura comparteixen una estètica contemporània, precisa i racional, basada en la repetició de mòduls, la claredat estructural i l'equilibri entre solidesa i lleugeresa. La identitat visual neix de la geometria i de l'ordre, més que no pas de l'ornamentació.",
      provenance: CSV_SOURCE,
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
    specimenMode: null,
  },
];

export function findCaseBySlug(slug: string | null): CaseRecord | undefined {
  if (!slug) return undefined;
  return cases.find((c) => c.slug === slug);
}
