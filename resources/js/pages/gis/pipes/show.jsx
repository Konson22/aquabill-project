import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';

export default function PipesShow({ pipe }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Pipes', href: '/gis/pipes' },
        { title: pipe.pipe_code, href: route('gis.pipes.show', pipe.id) },
    ];

    const destroy = () => {
        if (!confirm(`Delete pipe ${pipe.pipe_code}?`)) {
            return;
        }
        router.delete(route('gis.pipes.destroy', pipe.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={pipe.pipe_code} />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={route('gis.pipes.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="font-mono text-2xl font-bold tracking-tight">{pipe.pipe_code}</h1>
                            <p className="text-sm capitalize text-muted-foreground">{pipe.pipe_type} pipe</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('gis.pipes.edit', pipe.id)}>
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
                            <Badge className="capitalize">{pipe.status}</Badge>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Zone</span>
                            <span>{pipe.zone?.name ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Material</span>
                            <span>{pipe.material ?? '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Diameter</span>
                            <span>{pipe.diameter != null ? `${pipe.diameter} mm` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Length</span>
                            <span>{pipe.length != null ? `${pipe.length} m` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Vertices</span>
                            <span>{(pipe.coordinates ?? []).length}</span>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Description</p>
                            <p className="mt-1 whitespace-pre-wrap">{pipe.description || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
