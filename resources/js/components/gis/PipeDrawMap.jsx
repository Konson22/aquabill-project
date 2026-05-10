import { useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { CircleMarker, MapContainer, Polyline, TileLayer, useMapEvents } from 'react-leaflet';
import { GIS_ESRI_NATIVE_MAX_ZOOM, GIS_MAP_MAX_ZOOM } from '@/components/gis/gis-map-zoom';

const JUBA_CENTER = [4.85941, 31.57125];

function DrawHandler({ onAddPoint }) {
    useMapEvents({
        click(e) {
            onAddPoint(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function PipeDrawMap({ coordinates, onChange }) {
    const positions = useMemo(() => (coordinates ?? []).map(([lat, lng]) => [lat, lng]), [coordinates]);

    const center = useMemo(() => {
        if (positions.length > 0) {
            return positions[positions.length - 1];
        }
        return JUBA_CENTER;
    }, [positions]);

    const handleAdd = (lat, lng) => {
        const next = [...(coordinates ?? []), [lat, lng]];
        onChange(next);
    };

    return (
        <div className="space-y-2">
            <MapContainer center={center} zoom={positions.length ? 15 : 13} maxZoom={GIS_MAP_MAX_ZOOM} className="h-96 w-full rounded-lg border z-0" scrollWheelZoom>
                <TileLayer
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={GIS_MAP_MAX_ZOOM}
                    maxNativeZoom={GIS_ESRI_NATIVE_MAX_ZOOM}
                />
                <DrawHandler onAddPoint={handleAdd} />
                {positions.length >= 2 && <Polyline pathOptions={{ color: '#15803d', weight: 4 }} positions={positions} />}
                {positions.map(([lat, lng], i) => (
                    <CircleMarker key={`${lat}-${lng}-${i}`} center={[lat, lng]} radius={5} pathOptions={{ color: '#1e293b', fillColor: '#f59e0b', fillOpacity: 0.9 }} />
                ))}
            </MapContainer>
            <p className="text-xs text-muted-foreground">Click the map to add vertices. Need at least two points for a valid pipe path.</p>
        </div>
    );
}
