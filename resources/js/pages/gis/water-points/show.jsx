import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function WaterPointsShow({ waterPoint }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Water points', href: '/gis/water-points' },
        { title: waterPoint.code, href: route('gis.water-points.show', waterPoint.id) },
    ];

    const destroy = () => {
        if (!confirm(`Delete ${waterPoint.code}?`)) {
            return;
        }
        router.delete(route('gis.water-points.destroy', waterPoint.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={waterPoint.code} />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('gis.water-points.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{waterPoint.name}</h1>
                            <p className="font-mono text-sm text-muted-foreground">{waterPoint.code}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('gis.water-points.edit', waterPoint.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={destroy}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <Badge className="capitalize">{waterPoint.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span>{waterPoint.water_point_type?.name ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Zone</span>
                            <span>{waterPoint.zone?.name ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Coordinates</span>
                            <span className="font-mono text-xs">
                                {waterPoint.latitude != null && waterPoint.longitude != null ? `${waterPoint.latitude}, ${waterPoint.longitude}` : '—'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Manager</span>
                            <span>{waterPoint.manager_name ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Phone</span>
                            <span>{waterPoint.manager_phone ?? '—'}</span>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Description</p>
                            <p className="mt-1 whitespace-pre-wrap">{waterPoint.description || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
