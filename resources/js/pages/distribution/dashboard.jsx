import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Globe2, MapPin } from 'lucide-react';

export default function DistributionDashboard() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Distribution', href: '/dashboard' }]}>
            <Head title="Distribution" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Distribution</h1>
                    <p className="text-muted-foreground">Water network zones and GIS infrastructure.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('zones.index')} className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Zones
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('gis.dashboard')} className="inline-flex items-center gap-2">
                            <Globe2 className="h-4 w-4" />
                            GIS
                        </Link>
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
