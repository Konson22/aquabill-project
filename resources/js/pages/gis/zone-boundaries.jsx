import ZoneBoundaryDrawMap from '@/components/zones/zone-boundary-draw-map';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Loader2, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GisZoneBoundaries({ zones = [] }) {
    const breadcrumbs = [
        { title: 'GIS', href: route('gis.dashboard') },
        { title: 'Zone boundaries', href: route('gis.zone-boundaries') },
    ];

    const [zoneId, setZoneId] = useState(zones[0]?.id ?? null);

    const { data, setData, patch, processing, errors, reset } = useForm({
        boundary_geojson: null,
    });

    useEffect(() => {
        const z = zones.find((x) => x.id === zoneId);
        if (z) {
            reset({ boundary_geojson: z.boundary_geojson ?? null });
        }
    }, [zoneId, zones, reset]);

    const submit = (e) => {
        e.preventDefault();
        if (!zoneId) {
            return;
        }
        patch(route('zones.boundary.update', zoneId), { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIS zone boundaries" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <MapPin className="h-7 w-7 text-sky-600" />
                        Zone boundaries
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Draw a closed polygon on the map for the selected billing zone. Coordinates are WGS84 GeoJSON (exterior ring{' '}
                        <code className="rounded bg-muted px-1 py-0.5 text-xs">[longitude, latitude]</code>). Create zones under{' '}
                        <Link href={route('zones.index')} className="font-medium text-primary underline-offset-4 hover:underline">
                            Zones
                        </Link>{' '}
                        first, then assign their outline here.
                    </p>
                </div>

                {zones.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No zones yet.{' '}
                        <Link href={route('zones.index')} className="font-medium text-primary underline-offset-4 hover:underline">
                            Add a zone
                        </Link>{' '}
                        to enable boundary drawing.
                    </p>
                ) : (
                    <form onSubmit={submit} className="max-w-4xl space-y-4">
                        <div className="grid gap-2">
                            <Label>Zone</Label>
                            <Select
                                value={zoneId != null ? String(zoneId) : ''}
                                onValueChange={(v) => setZoneId(Number(v))}
                            >
                                <SelectTrigger className="max-w-md rounded-xl">
                                    <SelectValue placeholder="Select zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={String(z.id)}>
                                            {z.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {zoneId != null && (
                            <div className="grid gap-2">
                                <Label>Boundary on map</Label>
                                <ZoneBoundaryDrawMap
                                    key={zoneId}
                                    value={data.boundary_geojson}
                                    onChange={(geo) => setData('boundary_geojson', geo)}
                                />
                                <InputError message={errors.boundary_geojson} />
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            <Button type="submit" disabled={processing || zoneId == null} className="font-semibold">
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save boundary
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href={route('gis.map')}>Open infrastructure map</Link>
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </AppLayout>
    );
}
