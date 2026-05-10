import { useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import { GIS_ESRI_NATIVE_MAX_ZOOM, GIS_MAP_MAX_ZOOM } from '@/components/gis/gis-map-zoom';

const JUBA_CENTER = [4.85941, 31.57125];

function ClickHandler({ onPick }) {
    useMapEvents({
        click(e) {
            onPick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function PointPickerMap({ latitude, longitude, onPick }) {
    const position = useMemo(() => {
        if (latitude != null && longitude != null) {
            return [latitude, longitude];
        }
        return JUBA_CENTER;
    }, [latitude, longitude]);

    const icon = useMemo(
        () =>
            L.divIcon({
                className: 'gis-picker-marker',
                html: '<div style="width:16px;height:16px;border-radius:9999px;background:#7c3aed;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8],
            }),
        [],
    );

    return (
        <MapContainer
            center={position}
            zoom={latitude != null && longitude != null ? 16 : 13}
            maxZoom={GIS_MAP_MAX_ZOOM}
            className="h-72 w-full rounded-lg border z-0"
            scrollWheelZoom
        >
            <TileLayer
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={GIS_MAP_MAX_ZOOM}
                maxNativeZoom={GIS_ESRI_NATIVE_MAX_ZOOM}
            />
            <ClickHandler onPick={onPick} />
            {latitude != null && longitude != null && <Marker position={[latitude, longitude]} icon={icon} />}
        </MapContainer>
    );
}
