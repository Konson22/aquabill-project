import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const breadcrumbs = [
    { title: 'GIS', href: '/gis' },
    { title: 'Valves', href: '/gis/valves' },
    { title: 'Create', href: '/gis/valves/create' },
];

export default function ValvesCreate({ zones, pipes }) {
    const [Picker, setPicker] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        valve_code: '',
        zone_id: '',
        pipe_id: '',
        valve_type: 'main',
        latitude: 4.85941,
        longitude: 31.57125,
        status: 'open',
        installation_date: '',
        description: '',
    });

    useEffect(() => {
        import('@/components/gis/PointPickerMap').then((m) => setPicker(() => m.default));
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('gis.valves.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create valve" />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('gis.valves.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New valve</h1>
                        <p className="text-sm text-muted-foreground">Click the map to place the valve.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Picker ? (
                            <Picker
                                latitude={Number(data.latitude)}
                                longitude={Number(data.longitude)}
                                onPick={(lat, lng) => {
                                    setData('latitude', lat);
                                    setData('longitude', lng);
                                }}
                            />
                        ) : (
                            <div className="flex h-72 items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">Loading map…</div>
                        )}
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>Latitude</Label>
                                <Input readOnly value={data.latitude} className="mt-1 font-mono text-sm" />
                                <InputError message={errors.latitude} />
                            </div>
                            <div>
                                <Label>Longitude</Label>
                                <Input readOnly value={data.longitude} className="mt-1 font-mono text-sm" />
                                <InputError message={errors.longitude} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="valve_code">Valve code</Label>
                                <Input id="valve_code" value={data.valve_code} onChange={(e) => setData('valve_code', e.target.value)} required />
                                <InputError message={errors.valve_code} />
                            </div>
                            <div className="space-y-2">
                                <Label>Valve type</Label>
                                <Select value={data.valve_type} onValueChange={(v) => setData('valve_type', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="main">Main</SelectItem>
                                        <SelectItem value="control">Control</SelectItem>
                                        <SelectItem value="isolation">Isolation</SelectItem>
                                        <SelectItem value="washout">Washout</SelectItem>
                                        <SelectItem value="air_release">Air release</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.valve_type} />
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
                                <Label>Linked pipe</Label>
                                <Select value={data.pipe_id === '' ? 'none' : String(data.pipe_id)} onValueChange={(v) => setData('pipe_id', v === 'none' ? '' : v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Optional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {pipes.map((p) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.pipe_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.pipe_id} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
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
                                    Save
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
