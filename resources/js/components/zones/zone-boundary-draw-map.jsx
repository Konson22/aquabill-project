import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { GIS_ESRI_NATIVE_MAX_ZOOM, GIS_MAP_MAX_ZOOM } from '@/components/gis/gis-map-zoom';

const JUBA_CENTER = [4.85941, 31.57125];

function nearlyEqual(a, b, eps = 1e-6) {
    return Math.abs(a - b) < eps;
}

/** @param {Array<[number, number]>} ringLatLng [lat, lng][] */
function ringToGeoJsonPolygon(ringLatLng) {
    if (!ringLatLng || ringLatLng.length < 3) {
        return null;
    }
    const closed = [...ringLatLng];
    const [fLat, fLng] = closed[0];
    const [lLat, lLng] = closed[closed.length - 1];
    if (!nearlyEqual(fLat, lLat) || !nearlyEqual(fLng, lLng)) {
        closed.push([fLat, fLng]);
    }
    const coords = closed.map(([lat, lng]) => [lng, lat]);
    return { type: 'Polygon', coordinates: [coords] };
}

function ClickHandler({ onAddPoint, disabled }) {
    useMapEvents({
        click(e) {
            if (!disabled) {
                onAddPoint(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

/**
 * Click the map to add vertices, then "Close boundary" to produce a GeoJSON Polygon (WGS84, [lng,lat] ring).
 */
export default function ZoneBoundaryDrawMap({ value, onChange }) {
    const [vertices, setVertices] = useState([]);
    const [boundaryLocked, setBoundaryLocked] = useState(false);

    useEffect(() => {
        if (value?.type === 'Polygon' && Array.isArray(value.coordinates?.[0])) {
            setVertices(value.coordinates[0].map(([lng, lat]) => [lat, lng]));
            setBoundaryLocked(true);
        } else {
            setVertices([]);
            setBoundaryLocked(false);
        }
    }, [value]);

    const center = useMemo(() => {
        if (vertices.length > 0) {
            return vertices[vertices.length - 1];
        }
        return JUBA_CENTER;
    }, [vertices]);

    const closedPreview = useMemo(() => {
        if (vertices.length < 3) {
            return null;
        }
        const closed = [...vertices];
        const [fLat, fLng] = closed[0];
        const [lLat, lLng] = closed[closed.length - 1];
        if (!nearlyEqual(fLat, lLat) || !nearlyEqual(fLng, lLng)) {
            closed.push([fLat, fLng]);
        }
        return closed;
    }, [vertices]);

    const handleAdd = (lat, lng) => {
        if (boundaryLocked) {
            return;
        }
        setVertices((prev) => [...prev, [lat, lng]]);
    };

    const closeBoundary = () => {
        const geo = ringToGeoJsonPolygon(vertices);
        if (geo) {
            onChange(geo);
            setBoundaryLocked(true);
        }
    };

    const undo = () => {
        if (boundaryLocked) {
            return;
        }
        setVertices((prev) => prev.slice(0, -1));
    };

    const clearAll = () => {
        setVertices([]);
        setBoundaryLocked(false);
        onChange(null);
    };

    const redraw = () => {
        setVertices([]);
        setBoundaryLocked(false);
        onChange(null);
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={undo} disabled={vertices.length === 0 || boundaryLocked}>
                    Undo last point
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearAll} disabled={vertices.length === 0 && !boundaryLocked}>
                    Clear
                </Button>
                <Button type="button" size="sm" onClick={closeBoundary} disabled={vertices.length < 3 || boundaryLocked}>
                    Close boundary
                </Button>
                {boundaryLocked && (
                    <Button type="button" variant="secondary" size="sm" onClick={redraw}>
                        Redraw boundary
                    </Button>
                )}
            </div>
            <MapContainer
                center={center}
                zoom={vertices.length ? 15 : 13}
                maxZoom={GIS_MAP_MAX_ZOOM}
                className="z-0 h-80 w-full max-w-full rounded-lg border"
                scrollWheelZoom
            >
                <TileLayer
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={GIS_MAP_MAX_ZOOM}
                    maxNativeZoom={GIS_ESRI_NATIVE_MAX_ZOOM}
                />
                <ClickHandler onAddPoint={handleAdd} disabled={boundaryLocked} />
                {vertices.length === 2 && (
                    <Polyline pathOptions={{ color: '#b91c1c', weight: 3, dashArray: '6 6' }} positions={vertices} />
                )}
                {closedPreview && (
                    <Polygon pathOptions={{ color: '#b91c1c', weight: 2, fillColor: '#ef4444', fillOpacity: 0.18 }} positions={closedPreview} />
                )}
                {vertices.map(([lat, lng], i) => (
                    <CircleMarker
                        key={`${lat}-${lng}-${i}`}
                        center={[lat, lng]}
                        radius={5}
                        pathOptions={{ color: '#1e293b', fillColor: '#f97316', fillOpacity: 0.95 }}
                    />
                ))}
            </MapContainer>
            <p className="text-xs text-muted-foreground">
                Click the map to add corners around the billing zone. Use <strong>Close boundary</strong> when the outline is complete (at
                least three corners). Boundary is optional.
            </p>
        </div>
    );
}
