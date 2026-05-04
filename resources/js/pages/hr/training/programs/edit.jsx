import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrainingProgramEdit({ program }) {
    const { data, setData, put, processing, errors } = useForm({
        title: program.title ?? '',
        description: program.description ?? '',
        provider: program.provider ?? '',
        location: program.location ?? '',
        start_date: program.start_date?.slice?.(0, 10) ?? '',
        end_date: program.end_date?.slice?.(0, 10) ?? '',
        cost: program.cost != null ? String(program.cost) : '',
        status: program.status ?? 'planned',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('hr.training.programs.update', program.id));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'HR', href: route('hr') },
                { title: 'Training', href: route('hr.training.programs.index') },
                { title: program.title, href: route('hr.training.programs.show', program.id) },
                { title: 'Edit', href: route('hr.training.programs.edit', program.id) },
            ]}
        >
            <Head title={`Edit — ${program.title}`} />

            <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight">Edit program</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Program details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                                <InputError message={errors.title} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                />
                                <InputError message={errors.description} />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="provider">Provider</Label>
                                    <Input
                                        id="provider"
                                        value={data.provider}
                                        onChange={(e) => setData('provider', e.target.value)}
                                    />
                                    <InputError message={errors.provider} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        value={data.location}
                                        onChange={(e) => setData('location', e.target.value)}
                                    />
                                    <InputError message={errors.location} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start date</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                    <InputError message={errors.start_date} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="end_date">End date</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                    <InputError message={errors.end_date} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="cost">Cost</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.cost}
                                        onChange={(e) => setData('cost', e.target.value)}
                                    />
                                    <InputError message={errors.cost} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Status</Label>
                                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="planned">Planned</SelectItem>
                                            <SelectItem value="ongoing">Ongoing</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="cancelled">Cancelled</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.status} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="outline" asChild>
                                    <Link href={route('hr.training.programs.show', program.id)}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving…
                                        </>
                                    ) : (
                                        'Save changes'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
