import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LayerGroup, LayersControl, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import { GIS_ESRI_NATIVE_MAX_ZOOM, GIS_MAP_MAX_ZOOM, GIS_OSM_NATIVE_MAX_ZOOM } from '@/components/gis/gis-map-zoom';

const JUBA_CENTER = [4.85941, 31.57125];

/**
 * Leaflet measures the map canvas before flex/layout finishes; without this, tiles can mis-scale
 * (looks “tiny” / wrong zoom) until the window is resized.
 */
function MapResizeRefresh() {
    const map = useMap();

    useEffect(() => {
        const refresh = () => {
            map.invalidateSize({ animate: false });
        };

        refresh();
        const rafId = requestAnimationFrame(refresh);
        const t1 = setTimeout(refresh, 50);
        const t2 = setTimeout(refresh, 350);
        window.addEventListener('resize', refresh);

        return () => {
            cancelAnimationFrame(rafId);
            clearTimeout(t1);
            clearTimeout(t2);
            window.removeEventListener('resize', refresh);
        };
    }, [map]);

    return null;
}

function pipeStyle(pipeType) {
    switch (pipeType) {
        case 'main':
            return { color: '#1d4ed8', weight: 6, opacity: 0.9 };
        case 'distribution':
            return { color: '#15803d', weight: 4, opacity: 0.85 };
        default:
            return { color: '#ea580c', weight: 2, opacity: 0.9 };
    }
}

function waterPointIcon() {
    return L.divIcon({
        className: 'gis-marker-water',
        html: '<div style="width:14px;height:14px;border-radius:9999px;background:#2563eb;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function valveIcon() {
    return L.divIcon({
        className: 'gis-marker-valve',
        html: '<div style="width:14px;height:14px;border-radius:9999px;background:#dc2626;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function customerIcon() {
    return L.divIcon({
        className: 'gis-marker-customer',
        html: '<div style="width:14px;height:14px;border-radius:9999px;background:#9333ea;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

export default function GisMapClient({ mapData }) {
    const waterIcon = useMemo(() => waterPointIcon(), []);
    const vIcon = useMemo(() => valveIcon(), []);
    const cIcon = useMemo(() => customerIcon(), []);

    const waterPoints = mapData?.water_points ?? [];
    const pipes = mapData?.pipes ?? [];
    const valves = mapData?.valves ?? [];
    const customers = mapData?.customers ?? [];

    return (
        <MapContainer
            center={JUBA_CENTER}
            zoom={13}
            maxZoom={GIS_MAP_MAX_ZOOM}
            className="h-[min(70vh,560px)] min-h-[min(70vh,560px)] w-full rounded-lg border z-0"
            scrollWheelZoom
        >
            <MapResizeRefresh />
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Satellite">
                    <TileLayer
                        attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        maxZoom={GIS_MAP_MAX_ZOOM}
                        maxNativeZoom={GIS_ESRI_NATIVE_MAX_ZOOM}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="OpenStreetMap">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        detectRetina
                        maxZoom={GIS_MAP_MAX_ZOOM}
                        maxNativeZoom={GIS_OSM_NATIVE_MAX_ZOOM}
                    />
                </LayersControl.BaseLayer>
                <LayersControl.Overlay checked name="Water points">
                    <LayerGroup>
                        {waterPoints.map((wp) => (
                            <Marker key={wp.id} position={[wp.latitude, wp.longitude]} icon={waterIcon}>
                                <Popup>
                                    <div className="min-w-[200px] space-y-1 text-sm">
                                        <p className="font-semibold">{wp.code}</p>
                                        <p>{wp.name}</p>
                                        <p className="text-muted-foreground">Type: {wp.water_point_type?.name ?? '—'}</p>
                                        <p className="text-muted-foreground">Zone: {wp.zone?.name ?? '—'}</p>
                                        <p className="text-muted-foreground">Phone: {wp.manager_phone ?? '—'}</p>
                                        <p className="text-muted-foreground capitalize">Status: {wp.status}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Customers">
                    <LayerGroup>
                        {customers.map((c) => (
                            <Marker key={c.id} position={[Number(c.latitude), Number(c.longitude)]} icon={cIcon}>
                                <Popup>
                                    <div className="min-w-[200px] space-y-1 text-sm">
                                        <p className="font-semibold">{c.name}</p>
                                        <p className="text-muted-foreground">Account: {c.account_number}</p>
                                        <p className="text-muted-foreground">Phone: {c.phone}</p>
                                        <p className="text-muted-foreground capitalize">Type: {c.customer_type}</p>
                                        <p className="text-muted-foreground">Tariff: {c.tariff?.name ?? '—'}</p>
                                        <p className="text-muted-foreground">Zone: {c.zone?.name ?? '—'}</p>
                                        <p className="text-muted-foreground capitalize">Status: {c.status}</p>
                                        <p className="pt-1">
                                            <a href={route('customers.show', c.id)} className="text-primary font-medium underline-offset-4 hover:underline">
                                                Open customer
                                            </a>
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Pipes">
                    <LayerGroup>
                        {pipes.map((pipe) => {
                            const coords = pipe.coordinates ?? [];
                            if (coords.length < 2) {
                                return null;
                            }
                            const positions = coords.map(([lat, lng]) => [lat, lng]);
                            return (
                                <Polyline key={pipe.id} pathOptions={pipeStyle(pipe.pipe_type)} positions={positions}>
                                    <Popup>
                                        <div className="min-w-[200px] space-y-1 text-sm">
                                            <p className="font-semibold">{pipe.pipe_code}</p>
                                            <p className="capitalize text-muted-foreground">Type: {pipe.pipe_type}</p>
                                            <p className="text-muted-foreground">Material: {pipe.material ?? '—'}</p>
                                            <p className="text-muted-foreground">Diameter: {pipe.diameter != null ? `${pipe.diameter} mm` : '—'}</p>
                                            <p className="text-muted-foreground">Length: {pipe.length != null ? `${pipe.length} m` : '—'}</p>
                                            <p className="text-muted-foreground">Zone: {pipe.zone?.name ?? '—'}</p>
                                            <p className="text-muted-foreground capitalize">Status: {pipe.status}</p>
                                        </div>
                                    </Popup>
                                </Polyline>
                            );
                        })}
                    </LayerGroup>
                </LayersControl.Overlay>
                <LayersControl.Overlay checked name="Valves">
                    <LayerGroup>
                        {valves.map((v) => (
                            <Marker key={v.id} position={[v.latitude, v.longitude]} icon={vIcon}>
                                <Popup>
                                    <div className="min-w-[200px] space-y-1 text-sm">
                                        <p className="font-semibold">{v.valve_code}</p>
                                        <p className="capitalize text-muted-foreground">Type: {v.valve_type}</p>
                                        <p className="text-muted-foreground">Pipe: {v.pipe?.pipe_code ?? '—'}</p>
                                        <p className="text-muted-foreground">Zone: {v.zone?.name ?? '—'}</p>
                                        <p className="text-muted-foreground capitalize">Status: {v.status}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </LayerGroup>
                </LayersControl.Overlay>
            </LayersControl>
        </MapContainer>
    );
}
