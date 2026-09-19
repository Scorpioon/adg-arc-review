// TG006I Scope E — canonical Spanish UI-chrome catalog (ADGARC-FB-010). This
// is the only complete/active locale this milestone; its key set is the
// authoritative `TranslationKey` union every other catalog (ca/en) and every
// `t()` call site is checked against — see i18n/context.tsx.
//
// Deliberate scope boundary (ADGARC-FB-010 "UI localization is not
// editorial-content localization"): this catalog covers interface chrome
// only — navigation, Info/About/Settings copy, Developer Tools section
// titles/actions/status/debug labels, Case/Dossier interface labels, map-
// control tooltips, the coachmark, and runtime/loading UI. It intentionally
// excludes: case/source editorial content (data/cases.ts — architecture,
// typography, correlation prose, which stay data, not UI strings, and are
// out of scope for CAT/ENG translation per the handoff); and the per-role
// technical labels in config/mapPaint.ts / config/mapLod.ts (e.g. "Background
// / land", "Roads — major") — those are cartographic/config nomenclature
// tightly coupled to their role-id constants, not general UI copy, and
// routing them through this catalog as well would split one string
// authority across two files rather than avoid duplication. Recorded as an
// explicit scoping decision, not an oversight — see the paired report.
export const es = {
  "app.skipToContent": "Saltar al contenido principal",

  "entryCurtain.kicker": "ADG — Ruta tipográfica y arquitectónica",
  "entryCurtain.title": "Tipografía y arquitectura",
  "entryCurtain.body":
    "Una ruta por Barcelona a través de edificios, tipografías y las relaciones que los conectan.",
  "entryCurtain.cta": "Explorar Barcelona",

  "menu.trigger.open": "Abrir menú de la aplicación",
  "menu.trigger.close": "Cerrar menú de la aplicación",
  "menu.close": "Cerrar menú",
  // TG011 Pass A (ADGARC-FB-042): the internal destinations' back control.
  // Names its real destination — the menu root — rather than "atrás", which
  // would imply the browser history this deliberately is not.
  "menu.back": "Volver al menú principal",
  "menu.dialogLabel": "Menú de la aplicación",
  "menu.navLabel": "Destinos de la aplicación",
  "menu.introAction": "Introducción",
  // TG010 Final Experience P1 (ADGARC-DEC-010 §3-4): the menu shell's
  // canonical yellow-topbar title, transcribed verbatim from
  // ADGARC_FINAL_MOCKUP_01_main_menu.png — not translated/paraphrased.
  // TG011 Pass A (ADGARC-FB-042): still named `rootTitle`, but it is now
  // shown at every menu depth, as mockup 02 renders it — the key is kept as
  // is rather than renamed across the TranslationKey union for a label whose
  // text never changed.
  "menu.rootTitle": "Arquitectura i tipografia en diàleg",

  "nav.cases": "Casos",
  // TG010 Final Experience P1 (ADGARC-DEC-010 §3-4): these two row labels
  // are transcribed verbatim from mockup 01 rather than kept as their prior
  // Spanish translations — the canonical mockup wins per DEC-010 §2 even
  // though it mixes languages across the five rows (see the paired
  // execution report for the flagged inconsistency this inherits).
  "nav.passport": "Passaport",
  "nav.info": "Información",
  "nav.about": "Acerca de",
  "nav.settings": "Ajustes",
  "nav.devtools": "Dev Settings",

  "info.p1":
    "ADG-ARC explora relaciones entre arquitectura y tipografía en Barcelona, emparejando cada edificio con una tipografía elegida por su resonancia con él.",
  "info.p2":
    "El mapa es la forma principal de explorar la colección: desplázate, haz zoom y selecciona cualquiera de los 10 casos actuales, o explóralos desde el menú Casos.",
  "info.note":
    "Esta es una versión funcional de revisión. El diseño visual, los textos y el contenido son aún provisionales.",

  "about.project.title": "Proyecto",
  "about.project.body":
    "ADG-ARC empareja edificios de Barcelona con tipografías seleccionadas por una correlación formal o conceptual entre la arquitectura y las letras.",
  "about.methodology.title": "Metodología",
  "about.methodology.body":
    "Cada caso parte de un emparejamiento edificio/tipografía documentado en la fuente y de una argumentación escrita arquitectura-tipografía; la profundidad del tratamiento editorial varía actualmente caso por caso.",
  "about.credits.title": "Equipo / Créditos",
  "about.credits.note": "Confirmación del equipo pendiente.",
  // TG010 S4 (ADGARC-FB-025): fuller source credits live here, in
  // Acerca de. This is an *addition* to — never a replacement for — the
  // required attribution MapLibre's own AttributionControl keeps rendering
  // over the map itself (see MapView.tsx); no attribution markup is
  // reconstructed by this app.
  "about.credits.sourcesTitle": "Cartografía y datos",
  "about.credits.sources":
    "Mapa base servido por OpenFreeMap, con esquema de teselas OpenMapTiles y datos de los colaboradores de OpenStreetMap.",
  "about.credits.sourcesNote":
    "La atribución requerida sigue mostrándose de forma permanente sobre el propio mapa.",

  "settings.resetMap": "Volver a DhUB / Restablecer mapa",
  "settings.northUp": "Norte arriba",
  "settings.editorialOrientation": "Orientación editorial",
  "settings.note": "Estas son acciones puntuales del mapa, no preferencias guardadas.",
  "settings.language.label": "Idioma",

  "caseSheet.returnToMap": "Volver al mapa",
  "caseSheet.navLabel": "Navegación de casos",
  "caseSheet.previous": "Anterior",
  "caseSheet.next": "Siguiente",
  // TG012 Pass F1C: label normalization — no article on any footer/chapter
  // label except "L'edifici" (prompt 047 §C). These six section labels are
  // deliberately Catalan, matching the dossier's own Catalan title/content
  // register (`menu.rootTitle` above), not the Spanish article forms this
  // catalog otherwise uses for surrounding chrome copy.
  "caseSheet.section.building": "L'edifici",
  // TG012 Pass F1B: distinct footer-pill label for the facts page — was
  // sharing `caseSheet.section.building` with building-prose, so both pages
  // read the same word in the footer. Proven key gap (prompt 046 §5).
  "caseSheet.section.facts": "Fitxa",
  "caseSheet.section.architecture": "Arquitectura",
  "caseSheet.section.typography": "Tipografia",
  "caseSheet.section.dialogue": "Diàleg",
  "caseSheet.section.specimen": "Espécimen",
  // TG012 Pass F1: footer-pill label for the highlighted-phrase sub-page —
  // no prior key existed for this visual category.
  "caseSheet.section.quote": "Cita",
  // TG012 Pass F1: single-stop finish-screen heading — distinct from
  // `passport.completed` below, which names the all-stops-visited state.
  "caseSheet.finishHeading": "Visita registrada",
  "caseSheet.fact.year": "Año",
  "caseSheet.fact.architect": "Arquitecto/a",
  "caseSheet.fact.address": "Dirección",
  "caseSheet.movementPrefix": "Movimiento:",
  "caseSheet.movementTbdInline": "Pendiente — no consta en el material fuente",
  "caseSheet.specimenEmpty": "Todavía no hay espécimen para este caso.",
  // TG018 Pass C (correction matrix §G): accessible name for one page-number
  // pip in the dossier's internal numeric nav — replaces the retired
  // per-chapter aria-label now that the nav indexes real pages, not a fixed
  // five-chapter set.
  "caseSheet.pageOrdinal": "Página %{index} de %{total}",

  // TG010 S4 (ADGARC-FB-024): Casos carousel.
  "cases.carouselLabel": "Casos de la colección",
  "cases.mediaPending": "Imagen pendiente de verificación",

  // TG018 Pass B (correction matrix §B): `passport.progress` ("1 de 10
  // paradas") is removed — its sole consumer, the rail's own count line,
  // was deleted by this same pass (PassportPane.tsx). Confirmed zero
  // remaining call sites before removal.
  "passport.stampObtained": "Sello conseguido",
  "passport.stampPending": "Por visitar",
  "passport.completed": "Ruta completada",
  "passport.reset": "Reiniciar progreso",
  "passport.resetConfirm": "¿Reiniciar el progreso del pasaporte? Esta acción no se puede deshacer.",
  "passport.resetConfirmYes": "Sí, reiniciar",
  "passport.resetConfirmCancel": "Cancelar",
  "passport.stampFeedback": "Sello conseguido · %{count}/%{total}",
  // TG010 S4 (ADGARC-FB-023 / DEC-007 §13-14): horizontal progress rail.
  // `railOrdinalNote` is the product's own statement that the cell numbers
  // are display identifiers, not a route order — TG010 stays an unordered
  // physical journey.
  "passport.railLabel": "Pasaporte",
  // TG012 Pass F1: instruction copy for the Infocard dossier's passport-stamp
  // step — also doubles as the stamp target's accessible label.
  "passport.stampInstruction": "Toca el sello para registrar tu visita.",
  // TG014 (QR Contract v1): shown instead of stampInstruction, and applied
  // to the stamp target's disabled state, when a physical case has no
  // locally-proven visit yet.
  "passport.stampBlockedPhysical":
    "Escanea el código QR de la placa física para poder registrar tu visita.",
  // TG014: restrained status shown when a scanned `visit` token failed
  // validation — reading/navigating the case is never blocked by this.
  "passport.proofInvalid": "El código QR escaneado no es válido para este caso.",
  "passport.railOrdinalNote":
    "Los números identifican cada parada; no indican un orden de recorrido.",
  // TG011 Pass C (ADGARC-FB-043 / DEC-010 §11.3): the Pasaporte pane's 1-20
  // circle rail. `stopStatus` is the accessible name of an active circle —
  // colour is never the only carrier of visit state, so the ordinal and the
  // status are always available in words. `stopReserved` names a digital-only
  // position whose source identity does not exist yet (DEC-010 §D4): it
  // states the position is reserved and pending source, and deliberately
  // invents no name, no content and no case identity for it.
  "passport.railGroupLabel": "Índice de paradas, 1 a 20",
  "passport.stopStatus": "Parada %{ordinal}, %{name}: %{status}",
  "passport.stopReserved": "Parada %{ordinal}: reservada, pendiente de fuente",
  // TG010 S5B (ADGARC-FB-030 / DEC-008 §4): the Pasaporte destination's own
  // horizontal 9:16 stop-card carousel, replacing the former plain row list.
  "passport.carouselLabel": "Paradas del pasaporte",
  // TG016 (ADGARC-FB-046 / DEC-010 §11.2, §11.6): the map-top windowed
  // circle-navigation control replacing the dropped S5B PassportMapOverlay.
  // Reuses `passport.railGroupLabel` / `stopStatus` / `stopReserved` above
  // for the shared circle vocabulary; these three are the control's own
  // landmark and pagination-arrow names.
  "passport.mapNavLabel": "Navegación del pasaporte en el mapa",
  "passport.mapNavPrevious": "Ver paradas anteriores",
  "passport.mapNavNext": "Ver paradas siguientes",
  // TG018 Pass B (correction matrix §B): short visible label for an 11-20
  // placeholder card — distinct from `passport.stopReserved` (a full
  // accessible sentence used as that same card's aria-label) and from
  // `cases.mediaPending` (a missing-image state a *real* case can have).
  "passport.cardReserved": "Posición reservada",

  "mapControls.groupLabel": "Navegación del mapa",
  "mapControls.panUp": "Desplazar arriba",
  "mapControls.panUpTooltip": "Desplazar arriba (↑, con el mapa enfocado)",
  "mapControls.panDown": "Desplazar abajo",
  "mapControls.panDownTooltip": "Desplazar abajo (↓, con el mapa enfocado)",
  "mapControls.panLeft": "Desplazar a la izquierda",
  "mapControls.panLeftTooltip": "Desplazar a la izquierda (←, con el mapa enfocado)",
  "mapControls.panRight": "Desplazar a la derecha",
  "mapControls.panRightTooltip": "Desplazar a la derecha (→, con el mapa enfocado)",
  "mapControls.reset": "Restablecer la vista del mapa a la vista general de Barcelona/DhUB",
  "mapControls.resetTooltip": "Restablecer vista (0, con el mapa enfocado)",
  "mapControls.zoomIn": "Acercar",
  "mapControls.zoomInTooltip": "Acercar (+, con el mapa enfocado)",
  "mapControls.zoomOut": "Alejar",
  "mapControls.zoomOutTooltip": "Alejar (−, con el mapa enfocado)",
  "mapControls.rotateCcw": "Rotar el mapa en sentido antihorario",
  "mapControls.rotateCcwTooltip": "Rotar a la izquierda (Mayús + ←, con el mapa enfocado)",
  "mapControls.rotateCw": "Rotar el mapa en sentido horario",
  "mapControls.rotateCwTooltip": "Rotar a la derecha (Mayús + →, con el mapa enfocado)",

  "coachmark.text": "Arrastra para explorar · Pellizca para acercar",
  "coachmark.dismiss": "Entendido",

  "mapView.errorTimeout": "El mapa no terminó de cargar a tiempo. Recarga la página.",
  "mapView.errorLoad": "No se pudo cargar el mapa. Recarga la página.",

  // TG011 Pass B (ADGARC-FB-045 / DEC-010 §11.5): the whole visible copy of
  // the safe unavailable state shown at row 05 when the DEVTOOLS_ENABLED
  // build-time gate is false. Deliberately one neutral sentence and nothing
  // more — the destination header already states "Dev Settings", and §11.5
  // permits only the unavailability fact itself: no product version, no
  // build/environment detail, no gated Developer Tools content.
  "devtools.unavailable": "Los ajustes de desarrollo no están disponibles en esta versión.",

  "devtools.mapPalette.title": "Paleta del mapa",
  "devtools.mapPalette.note": "Estilo del suelo, el agua, los edificios y las vías.",
  "devtools.mapOverlays.title": "Superposiciones del mapa / marcadores",
  "devtools.mapOverlays.note": "Estados del marcador de caso renderizados en el mapa.",
  "devtools.derivedPrefix":
    "Derivado (no editable de forma independiente — refleja el rol entre paréntesis):",
  "devtools.zoomLod.title": "Zoom / nivel de detalle",
  "devtools.zoomLod.note":
    "Densidad semántica por banda de zoom (FB031) — CIUDAD / DISTRITO / EDIFICIO. Controla el tratamiento ADG-ARC aplicado sobre el mapa base; los roles dejados en «heredado» no modifican el comportamiento de zoom propio de la capa base.",
  "devtools.debug.currentZoom": "Zoom actual",
  "devtools.debug.currentBand": "Banda actual",
  "devtools.lod.districtLabel": "DISTRITO empieza en el zoom",
  "devtools.lod.buildingLabel": "EDIFICIO empieza en el zoom",
  "devtools.lod.thresholdError":
    "Los umbrales deben estar ordenados (0 ≤ DISTRITO < EDIFICIO ≤ 24) — rechazado, se mantiene el valor anterior.",
  "devtools.lod.placesNote":
    "Las etiquetas de lugares/POI no están modeladas — el clasificador del atlas ya las descarta por completo. La etiqueta opcional al pasar el cursor sobre un caso es una superposición DOM, no una capa de MapLibre, así que tampoco tiene rol de nivel de detalle.",
  "devtools.lod.reset": "Restablecer nivel de detalle",
  "devtools.lod.copy": "Copiar configuración de LOD",
  "devtools.lod.export": "Exportar JSON de LOD",
  "devtools.lod.visible": "Visible",
  "devtools.lod.minZoom": "Zoom mínimo",
  "devtools.lod.minZoomPlaceholder": "heredado",
  "devtools.lod.opacityByBand": "Opacidad por banda",
  "devtools.lod.scaleByBand": "Escala por banda",

  "devtools.error.invalidHex": "Hexadecimal no válido",
  "devtools.error.invalidAlpha": "Alfa no válida",
  "devtools.error.invalidHexAndAlpha": "Hexadecimal y alfa no válidos",

  "devtools.runtime.title": "Estado en vivo / mapa",
  "devtools.runtime.note": "Valores de solo lectura capturados en vivo para revisión.",
  "devtools.runtime.zoom": "Zoom",
  "devtools.runtime.bearing": "Orientación",
  "devtools.runtime.pitch": "Inclinación",
  "devtools.runtime.selectedCase": "Caso seleccionado",
  "devtools.runtime.selectedCaseNone": "Ninguno",
  "devtools.runtime.readiness": "Estado de carga",
  "devtools.runtime.readinessReady": "Listo",
  "devtools.runtime.readinessStatus": "Estado de disponibilidad",
  "devtools.runtime.productVersion": "Versión del producto",
  "devtools.runtime.fatal": "Error fatal: %{message} (último hito completado: %{milestone})",
  "devtools.runtime.timingsLabel": "Tiempos del ciclo de vida (ms desde el arranque):",
  "devtools.runtime.warningsLabel": "Avisos recientes no fatales del mapa (más reciente primero):",

  "devtools.persistence.title": "Persistencia / acciones de configuración",
  "devtools.persistence.note": "Guarda, restablece o exporta la paleta de trabajo.",
  "devtools.persistence.resetDefaults": "Restablecer valores predeterminados",
  "devtools.persistence.copyConfig": "Copiar configuración",
  "devtools.persistence.exportJson": "Exportar JSON",
  "devtools.copiedGeneric": "Copiado al portapapeles.",
  "devtools.copyFailed": "No se pudo copiar — portapapeles no disponible.",

  "devtools.physicalEntry.title": "Entrada física / objetivos QR",
  "devtools.physicalEntry.note":
    "Puntos de entrada canónicos tótem físico → QR → caso digital, derivados de la clasificación física/digital del conjunto de casos. Aquí no se genera ningún gráfico QR.",
  "devtools.physicalEntry.origin": "Origen",
  "devtools.physicalEntry.baseUrl": "BASE_URL",
  "devtools.physicalEntry.hostingMode": "Modo de alojamiento",
  "devtools.physicalEntry.caseCount": "Casos físico+digital",
  "devtools.physicalEntry.selectedUrlLabel": "URL del caso seleccionado:",
  "devtools.physicalEntry.copyUrl": "Copiar URL",
  "devtools.physicalEntry.copied": "Copiado",
  "devtools.physicalEntry.copyManifest": "Copiar manifiesto",
  "devtools.physicalEntry.exportManifest": "Exportar JSON del manifiesto",
  "devtools.physicalEntry.manifestCopied": "Manifiesto copiado al portapapeles.",

  "devtools.milestone.boot": "Arranque",
  "devtools.milestone.reactMounted": "React montado",
  "devtools.milestone.mapCreated": "Mapa creado",
  "devtools.milestone.styleLoaded": "Estilo cargado",
  "devtools.milestone.layersReady": "Capas listas",
  "devtools.milestone.ready": "Listo / inactivo",
} as const;

export type TranslationKey = keyof typeof es;
