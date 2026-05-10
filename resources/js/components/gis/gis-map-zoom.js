/**
 * Max zoom for the map control (Leaflet upscales imagery above Esri native limit).
 */
export const GIS_MAP_MAX_ZOOM = 22;

/**
 * Esri World Imagery: request tiles only up to this zoom from the server. Many regions (incl. parts of
 * Africa) lack imagery at z18–19 — loading those returns placeholder tiles (“Map data not available”).
 * Keeping this conservative lets Leaflet upscale z17 imagery when zooming closer instead.
 */
export const GIS_ESRI_NATIVE_MAX_ZOOM = 17;

/** OSM typically has full raster coverage through ~19. */
export const GIS_OSM_NATIVE_MAX_ZOOM = 19;
