import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function GisMap({ mapData }) {
    const breadcrumbs = [
        { title: 'GIS', href: route('gis.dashboard') },
        { title: 'Infrastructure map', href: route('gis.map') },
    ];

    const [MapComponent, setMapComponent] = useState(null);

    useEffect(() => {
        import('@/components/gis/GisMapClient').then((m) => setMapComponent(() => m.default));
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="GIS infrastructure map" />

            <div className="flex h-full flex-col gap-6 ">
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        Water points on map: <span className="font-semibold text-foreground">{mapData?.water_points?.length ?? 0}</span>
                    </div>
                    <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        Customers on map: <span className="font-semibold text-foreground">{mapData?.customers?.length ?? 0}</span>
                    </div>
                    <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        Pipes on map: <span className="font-semibold text-foreground">{mapData?.pipes?.length ?? 0}</span>
                    </div>
                    <div className="rounded-lg border bg-muted/20 px-3 py-2">
                        Valves on map: <span className="font-semibold text-foreground">{mapData?.valves?.length ?? 0}</span>
                    </div>
                </div>
                <div className="flex min-h-[min(70vh,560px)] flex-1 flex-col rounded-xl border bg-card p-2 shadow-sm">
                    {MapComponent ? (
                        <MapComponent mapData={mapData} />
                    ) : (
                        <div className="flex min-h-[min(70vh,560px)] flex-1 items-center justify-center rounded-lg bg-muted/40 text-sm text-muted-foreground">
                            Loading map…
                        </div>
                    )}
                </div>

              
            </div>
        </AppLayout>
    );
}
