import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Gauge, Loader2 } from 'lucide-react';

function dateInputValue(value) {
    if (!value) {
        return '';
    }
    if (typeof value === 'string') {
        return value.slice(0, 10);
    }
    try {
        return new Date(value).toISOString().slice(0, 10);
    } catch {
        return '';
    }
}

export default function EditReading({ reading }) {
    const breadcrumbs = [
        { title: 'Meter Readings', href: '/readings' },
        { title: `Reading #${reading.id}`, href: `/readings/${reading.id}` },
        { title: 'Edit', href: `/readings/${reading.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        previous_reading: String(reading.previous_reading ?? ''),
        current_reading: String(reading.current_reading ?? ''),
        reading_date: dateInputValue(reading.reading_date),
        notes: reading.notes ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('readings.update', reading.id));
    };

    const hasBill = Boolean(reading.bill);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit reading #${reading.id}`} />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                            <Gauge className="h-6 w-6 text-primary" />
                            Edit meter reading
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {reading.meter?.customer?.name}
                            {reading.meter?.meter_number ? (
                                <span className="font-mono text-muted-foreground"> · {reading.meter.meter_number}</span>
                            ) : null}
                        </p>
                        {hasBill && (
                            <p className="mt-2 text-sm text-amber-700 dark:text-amber-500">
                                This reading has a linked invoice; consumption and charges will be recalculated from the
                                updated values.
                            </p>
                        )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <Link href={route('readings.show', reading.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to reading
                        </Link>
                    </Button>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card className="rounded-xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>Readings</CardTitle>
                            <CardDescription>Consumption is derived as current minus previous.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="previous_reading">Previous reading</Label>
                                <Input
                                    id="previous_reading"
                                    inputMode="decimal"
                                    value={data.previous_reading}
                                    onChange={(e) => setData('previous_reading', e.target.value)}
                                />
                                <InputError message={errors.previous_reading} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="current_reading">Current reading</Label>
                                <Input
                                    id="current_reading"
                                    inputMode="decimal"
                                    value={data.current_reading}
                                    onChange={(e) => setData('current_reading', e.target.value)}
                                />
                                <InputError message={errors.current_reading} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="reading_date">Reading date</Label>
                                <Input
                                    id="reading_date"
                                    type="date"
                                    value={data.reading_date}
                                    onChange={(e) => setData('reading_date', e.target.value)}
                                />
                                <InputError message={errors.reading_date} />
                            </div>
                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional notes"
                                />
                                <InputError message={errors.notes} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('readings.show', reading.id)}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save changes
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
