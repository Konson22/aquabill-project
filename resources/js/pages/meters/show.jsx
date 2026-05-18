import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Droplet,
    Gauge,
    MapPin,
    User,
} from 'lucide-react';

const formatDate = (value) => {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
};

const statusVariant = (status) => {
    switch (status) {
        case 'active':
            return 'success';
        case 'maintenance':
            return 'secondary';
        case 'damage':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export default function MeterShow({ meter, readings }) {
    const breadcrumbs = [
        { title: 'Meters', href: route('meters.index') },
        {
            title: meter.meter_number,
            href: route('meters.show', meter.id),
        },
    ];

    const customer = meter.customer;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Meter ${meter.meter_number}`} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                        <Link href={route('meters.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to meters
                        </Link>
                    </Button>
                    {customer && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('customers.show', customer.id)}>
                                <User className="mr-2 h-4 w-4" />
                                View customer
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-mono text-2xl font-bold tracking-tight">{meter.meter_number}</h1>
                            <p className="text-sm text-muted-foreground">Water meter details and reading history</p>
                        </div>
                        <Badge variant={statusVariant(meter.status)} className="ml-auto rounded-md font-mono text-[10px]">
                            {meter.status.toUpperCase()}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider">Last reading</CardDescription>
                            <CardTitle className="font-mono text-2xl">
                                {meter.last_reading ?? 0}
                                <span className="ml-1 text-sm font-normal text-muted-foreground">m³</span>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-1 text-xs uppercase tracking-wider">
                                <Gauge className="h-3 w-3" />
                                Total readings
                            </CardDescription>
                            <CardTitle className="text-2xl">{readings.total}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs uppercase tracking-wider">Registered</CardDescription>
                            <CardTitle className="text-lg">{formatDate(meter.created_at)}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Meter information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <dt className="text-muted-foreground">Meter number</dt>
                                <dd className="mt-1 font-mono font-bold">{meter.meter_number}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="mt-1 capitalize">{meter.status}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Last updated</dt>
                                <dd className="mt-1">{formatDate(meter.updated_at)}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Customer</dt>
                                <dd className="mt-1 font-medium">
                                    {customer ? (
                                        <Link
                                            href={route('customers.show', customer.id)}
                                            className="text-foreground underline-offset-4 hover:underline"
                                        >
                                            {customer.name}
                                        </Link>
                                    ) : (
                                        <span className="text-muted-foreground">Unassigned</span>
                                    )}
                                </dd>
                            </div>
                            {customer?.account_number && (
                                <div>
                                    <dt className="text-muted-foreground">Account</dt>
                                    <dd className="mt-1 font-mono font-medium">{customer.account_number}</dd>
                                </div>
                            )}
                            {customer?.zone?.name && (
                                <div>
                                    <dt className="text-muted-foreground">Zone</dt>
                                    <dd className="mt-1 flex items-center gap-1 font-medium">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        {customer.zone.name}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden shadow-sm">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <Droplet className="h-5 w-5 text-blue-500" />
                            <div>
                                <CardTitle className="text-base">Reading history</CardTitle>
                                <CardDescription>
                                    {readings.total} recorded reading{readings.total === 1 ? '' : 's'} for this meter
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {readings.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 p-12 text-center text-sm text-muted-foreground">
                                <Droplet className="h-10 w-10 text-muted-foreground/40" />
                                <p>No readings recorded for this meter yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3 text-right">Previous (m³)</th>
                                            <th className="px-6 py-3 text-right">Current (m³)</th>
                                            <th className="px-6 py-3 text-right">Consumption (m³)</th>
                                            <th className="px-6 py-3">Recorded by</th>
                                            <th className="px-6 py-3 text-right">Bill</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {readings.data.map((reading) => (
                                            <tr key={reading.id} className="transition-colors hover:bg-muted/20">
                                                <td className="px-6 py-3 font-medium">
                                                    <Link
                                                        href={route('readings.show', reading.id)}
                                                        className="flex items-center gap-2 hover:text-primary"
                                                    >
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        {formatDate(reading.reading_date)}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-muted-foreground">
                                                    {reading.previous_reading ?? '—'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono font-bold">
                                                    {reading.current_reading ?? '—'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono font-bold text-primary">
                                                    {reading.consumption ?? '—'}
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground">
                                                    {reading.recorder?.name ?? '—'}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    {reading.bill ? (
                                                        <Link
                                                            href={route('bills.show', reading.bill.id)}
                                                            className="text-xs font-medium text-primary hover:underline"
                                                        >
                                                            {reading.bill.bill_no ?? `#${reading.bill.id}`}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {readings.links?.length > 3 && (
                            <div className="flex items-center justify-between border-t px-6 py-4">
                                <span className="text-xs text-muted-foreground">
                                    Page {readings.current_page} of {readings.last_page}
                                </span>
                                <div className="flex items-center gap-1">
                                    {readings.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'ghost'}
                                            size="sm"
                                            disabled={!link.url}
                                            className="h-8 w-8 p-0"
                                            asChild={!!link.url}
                                        >
                                            {link.url ? (
                                                <Link href={link.url} preserveScroll>
                                                    {link.label === '&laquo; Previous' ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : link.label === 'Next &raquo;' ? (
                                                        <ChevronRight className="h-4 w-4" />
                                                    ) : (
                                                        link.label
                                                    )}
                                                </Link>
                                            ) : (
                                                <span>
                                                    {link.label === '&laquo; Previous' ? (
                                                        <ChevronLeft className="h-4 w-4" />
                                                    ) : link.label === 'Next &raquo;' ? (
                                                        <ChevronRight className="h-4 w-4" />
                                                    ) : (
                                                        link.label
                                                    )}
                                                </span>
                                            )}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
