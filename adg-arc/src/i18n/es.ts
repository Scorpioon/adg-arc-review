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

  "menu.trigger.open": "Abrir menú de la aplicación",
  "menu.trigger.close": "Cerrar menú de la aplicación",
  "menu.close": "Cerrar menú",
  "menu.dialogLabel": "Menú de la aplicación",
  "menu.navLabel": "Destinos de la aplicación",

  "nav.cases": "Casos",
  "nav.info": "Información",
  "nav.about": "Acerca de",
  "nav.settings": "Ajustes",
  "nav.devtools": "Herramientas de desarrollo",

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

  "settings.resetMap": "Volver a DhUB / Restablecer mapa",
  "settings.northUp": "Norte arriba",
  "settings.editorialOrientation": "Orientación editorial",
  "settings.note": "Estas son acciones puntuales del mapa, no preferencias guardadas.",
  "settings.language.label": "Idioma",

  "caseSheet.returnToMap": "Volver al mapa",
  "caseSheet.navLabel": "Navegación de casos",
  "caseSheet.previous": "Anterior",
  "caseSheet.next": "Siguiente",
  "caseSheet.heroLabel": "Imagen del caso",
  "caseSheet.heroEmpty": "Imagen pendiente de verificación.",
  "caseSheet.section.building": "El edificio",
  "caseSheet.section.architecture": "Arquitectura",
  "caseSheet.section.typography": "La tipografía",
  "caseSheet.section.dialogue": "El diálogo",
  "caseSheet.section.specimen": "Espécimen",
  "caseSheet.fact.year": "Año",
  "caseSheet.fact.architect": "Arquitecto/a",
  "caseSheet.fact.address": "Dirección",
  "caseSheet.fact.primaryTypeface": "Tipografía principal",
  "caseSheet.fact.designer": "Diseñador/a",
  "caseSheet.typefaceSourceLink": "Fuente de la tipografía",
  "caseSheet.movementPrefix": "Movimiento:",
  "caseSheet.movementTbdInline": "Pendiente — no consta en el material fuente",
  "caseSheet.movementTbdBlock": "Pendiente — no especificado en el material fuente.",
  "caseSheet.correlationEmpty": "La correlación editorial de este caso aún no se ha desarrollado.",
  "caseSheet.specimenEmpty": "Todavía no hay espécimen para este caso.",

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
