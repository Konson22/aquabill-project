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

export default function WaterPointsEdit({ waterPoint, zones, waterPointTypes }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Water points', href: '/gis/water-points' },
        { title: waterPoint.code, href: route('gis.water-points.show', waterPoint.id) },
        { title: 'Edit', href: route('gis.water-points.edit', waterPoint.id) },
    ];

    const [Picker, setPicker] = useState(null);
    const { data, setData, put, processing, errors } = useForm({
        code: waterPoint.code,
        name: waterPoint.name,
        water_point_type_id: String(waterPoint.water_point_type_id),
        zone_id: waterPoint.zone_id != null ? String(waterPoint.zone_id) : '',
        latitude: waterPoint.latitude ?? '',
        longitude: waterPoint.longitude ?? '',
        manager_name: waterPoint.manager_name ?? '',
        manager_phone: waterPoint.manager_phone ?? '',
        status: waterPoint.status,
        description: waterPoint.description ?? '',
    });

    useEffect(() => {
        import('@/components/gis/PointPickerMap').then((m) => setPicker(() => m.default));
    }, []);

    const submit = (e) => {
        e.preventDefault();
        put(route('gis.water-points.update', waterPoint.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${waterPoint.code}`} />
            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('gis.water-points.show', waterPoint.id)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Edit water point</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Picker ? (
                            <Picker
                                latitude={data.latitude === '' ? null : Number(data.latitude)}
                                longitude={data.longitude === '' ? null : Number(data.longitude)}
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
                                <Label htmlFor="code">Code</Label>
                                <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} required />
                                <InputError message={errors.code} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select value={String(data.water_point_type_id)} onValueChange={(v) => setData('water_point_type_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {waterPointTypes.map((t) => (
                                            <SelectItem key={t.id} value={String(t.id)}>
                                                {t.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.water_point_type_id} />
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
                                <Label htmlFor="manager_name">Manager name</Label>
                                <Input id="manager_name" value={data.manager_name} onChange={(e) => setData('manager_name', e.target.value)} />
                                <InputError message={errors.manager_name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="manager_phone">Manager phone</Label>
                                <Input id="manager_phone" value={data.manager_phone} onChange={(e) => setData('manager_phone', e.target.value)} />
                                <InputError message={errors.manager_phone} />
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
                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                        <SelectItem value="damaged">Damaged</SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
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
