import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function WaterPointTypesEdit({ type }) {
    const breadcrumbs = [
        { title: 'GIS', href: '/gis' },
        { title: 'Water point types', href: '/gis/water-point-types' },
        { title: type.name, href: route('gis.water-point-types.show', type.id) },
        { title: 'Edit', href: route('gis.water-point-types.edit', type.id) },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: type.name,
        description: type.description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('gis.water-point-types.update', type.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${type.name}`} />
            <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('gis.water-point-types.show', type.id)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit type</h1>
                        <p className="text-sm text-muted-foreground">Slug: {type.slug}</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError message={errors.name} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
                                <InputError message={errors.description} />
                            </div>
                            <Button type="submit" disabled={processing}>
                                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Update
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
