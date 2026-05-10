import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, ArrowLeft } from 'lucide-react';

export default function WaterPointTypesShow({ type }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Water point types', href: '/gis/water-point-types' },
        { title: type.name, href: route('gis.water-point-types.show', type.id) },
    ];

    const destroy = () => {
        if (!confirm(`Delete "${type.name}"?`)) {
            return;
        }
        router.delete(route('gis.water-point-types.destroy', type.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={type.name} />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('gis.water-point-types.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{type.name}</h1>
                            <p className="text-sm text-muted-foreground">{type.slug}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('gis.water-point-types.edit', type.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={destroy} disabled={type.water_points_count > 0}>
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
                            <span className="text-muted-foreground">Water points</span>
                            <Badge variant="secondary">{type.water_points_count}</Badge>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Description</p>
                            <p className="mt-1 whitespace-pre-wrap">{type.description || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
