import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Save, Undo2, Trash } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function PipesEdit({ pipe, zones }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Pipes', href: '/gis/pipes' },
        { title: pipe.pipe_code, href: route('gis.pipes.show', pipe.id) },
        { title: 'Edit', href: route('gis.pipes.edit', pipe.id) },
    ];

    const [DrawMap, setDrawMap] = useState(null);
    const { data, setData, put, processing, errors } = useForm({
        pipe_code: pipe.pipe_code,
        zone_id: pipe.zone_id != null ? String(pipe.zone_id) : '',
        pipe_type: pipe.pipe_type,
        material: pipe.material ?? '',
        diameter: pipe.diameter ?? '',
        length: pipe.length ?? '',
        coordinates: pipe.coordinates ?? [],
        status: pipe.status,
        installation_date: pipe.installation_date ? String(pipe.installation_date).slice(0, 10) : '',
        description: pipe.description ?? '',
    });

    useEffect(() => {
        import('@/components/gis/PipeDrawMap').then((m) => setDrawMap(() => m.default));
    }, []);

    const submit = (e) => {
        e.preventDefault();
        put(route('gis.pipes.update', pipe.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${pipe.pipe_code}`} />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('gis.pipes.show', pipe.id)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Edit pipe</h1>
                </div>

                <Card>
                    <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
                        <CardTitle>Path</CardTitle>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setData('coordinates', (data.coordinates ?? []).slice(0, -1))}>
                                <Undo2 className="mr-1 h-4 w-4" />
                                Undo last
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={() => setData('coordinates', [])}>
                                <Trash className="mr-1 h-4 w-4" />
                                Clear
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {DrawMap ? <DrawMap coordinates={data.coordinates} onChange={(c) => setData('coordinates', c)} /> : <div className="flex h-96 items-center justify-center border text-sm text-muted-foreground">Loading map…</div>}
                        <InputError message={errors.coordinates} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="pipe_code">Pipe code</Label>
                                <Input id="pipe_code" value={data.pipe_code} onChange={(e) => setData('pipe_code', e.target.value)} required />
                                <InputError message={errors.pipe_code} />
                            </div>
                            <div className="space-y-2">
                                <Label>Zone</Label>
                                <Select value={data.zone_id === '' ? 'none' : String(data.zone_id)} onValueChange={(v) => setData('zone_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {zones.map((z) => (
                                            <SelectItem key={z.id} value={String(z.id)}>
                                                {z.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.zone_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Pipe type</Label>
                                <Select value={data.pipe_type} onValueChange={(v) => setData('pipe_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="distribution">Distribution</SelectItem>
                                        <SelectItem value="service">Service</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.pipe_type} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="material">Material</Label>
                                <Input id="material" value={data.material} onChange={(e) => setData('material', e.target.value)} />
                                <InputError message={errors.material} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diameter">Diameter (mm)</Label>
                                <Input id="diameter" type="number" step="0.01" value={data.diameter} onChange={(e) => setData('diameter', e.target.value)} />
                                <InputError message={errors.diameter} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="length">Length (m)</Label>
                                <Input id="length" type="number" step="0.01" value={data.length} onChange={(e) => setData('length', e.target.value)} />
                                <InputError message={errors.length} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="installation_date">Installation date</Label>
                                <Input id="installation_date" type="date" value={data.installation_date} onChange={(e) => setData('installation_date', e.target.value)} />
                                <InputError message={errors.installation_date} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                                <InputError message={errors.description} />
                            </div>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Update
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
