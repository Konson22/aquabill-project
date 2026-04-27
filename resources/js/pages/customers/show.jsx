import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BadgeCheck,
    Calendar,
    Droplet,
    MapPin,
    Phone,
    Receipt,
    User,
    Wrench,
} from 'lucide-react';

export default function Show({ customer }) {
    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        { title: customer?.account_number ?? 'Customer', href: customer ? `/customers/${customer.id}` : '/customers' },
    ];

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return String(value);
        }
    };

    const statusVariant = customer?.status === 'active' ? 'success' : 'secondary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `${customer.name} • ${customer.account_number}` : 'Customer'} />

            <div className="mx-auto w-full max-w-6xl p-6 space-y-6 animate-in fade-in duration-500">
                {/* Top actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Link
                        href="/customers"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Customers
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled>
                            <Wrench className="mr-2 h-4 w-4" />
                            Edit Customer
                        </Button>
                        <Button size="sm" disabled className="bg-blue-600 hover:bg-blue-700">
                            <Droplet className="mr-2 h-4 w-4" />
                            Record Reading
                        </Button>
                    </div>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            {customer?.name ?? 'Customer'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono font-bold text-primary">
                                {customer?.account_number ?? '—'}
                            </span>
                            <span className="text-muted-foreground/60">•</span>
                            <span className="capitalize">{customer?.customer_type ?? '—'}</span>
                            <span className="text-muted-foreground/60">•</span>
                            <Badge variant={statusVariant} className="capitalize text-[10px]">
                                <BadgeCheck className="mr-1.5 h-3 w-3" />
                                {customer?.status ?? 'unknown'}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Zone: {customer?.zone?.name ?? '—'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Tariff: {customer?.tariff?.name ?? '—'}
                        </Badge>
                    </div>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                Contact
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium">{customer?.phone ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">{customer?.email ?? 'No email'}</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium leading-relaxed">{customer?.address ?? '—'}</p>
                            <p className="text-xs text-muted-foreground">
                                National ID: {customer?.national_id ?? '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Connection
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-medium">{formatDate(customer?.connection_date)}</p>
                            <p className="text-xs text-muted-foreground">
                                Created: {formatDate(customer?.created_at)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Meters + Bills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                Meters
                            </h2>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                {(customer?.meters?.length ?? 0).toString().padStart(2, '0')}
                            </Badge>
                        </div>
                        <div className="p-5">
                            {customer?.meters?.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-sm">
                                        <thead>
                                            <tr className="border-b bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <th className="px-3 py-3">Meter #</th>
                                                <th className="px-3 py-3">Type</th>
                                                <th className="px-3 py-3 text-right">Last Reading</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {customer.meters.map((meter) => (
                                                <tr key={meter.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-3 py-3 font-mono font-bold text-primary">
                                                        {meter.meter_number ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 capitalize text-muted-foreground">
                                                        {meter.meter_type ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3 text-right font-mono font-bold">
                                                        {meter.last_reading?.current_reading ?? meter.lastReading?.current_reading ?? '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    No meters found for this customer.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                Recent Bills
                            </h2>
                            <Badge variant="outline" className="text-[10px] font-mono">
                                {(customer?.bills?.length ?? 0).toString().padStart(2, '0')}
                            </Badge>
                        </div>
                        <div className="p-5">
                            {customer?.bills?.length ? (
                                <div className="space-y-3">
                                    {customer.bills.slice(0, 5).map((bill) => (
                                        <div key={bill.id} className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/20 transition-colors">
                                            <div className="min-w-0">
                                                <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                                    Invoice #{String(bill.id).padStart(6, '0')}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Issued {formatDate(bill.created_at)} • Due {formatDate(bill.due_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="capitalize text-[10px]">
                                                    {bill.status ?? '—'}
                                                </Badge>
                                                <span className="font-mono font-black text-sm">
                                                    {bill.total_amount ?? bill.total ?? '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                                    No bills found for this customer.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
