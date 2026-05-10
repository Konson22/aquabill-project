import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Head, router } from '@inertiajs/react';
import { BarChart3, Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function toStringId(value) {
    return value ? String(value) : 'all';
}

export default function FinanceReportsIndex({
    summary,
    monthlyCollectionSummary = [],
    zoneRevenueComparison = [],
    payments = [],
    filters,
    filterOptions,
}) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');
    const [zoneId, setZoneId] = useState(toStringId(filters?.zone_id));
    const [tariffId, setTariffId] = useState(toStringId(filters?.tariff_id));
    const [customerId, setCustomerId] = useState(toStringId(filters?.customer_id));
    const [cashierId, setCashierId] = useState(toStringId(filters?.cashier_id));

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('finance.reports.index'),
                {
                    from: from || undefined,
                    to: to || undefined,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    tariff_id: tariffId === 'all' ? undefined : tariffId,
                    customer_id: customerId === 'all' ? undefined : customerId,
                    cashier_id: cashierId === 'all' ? undefined : cashierId,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [from, to, zoneId, tariffId, customerId, cashierId]);

    const exportParams = useMemo(
        () =>
            new URLSearchParams({
                ...(from ? { from } : {}),
                ...(to ? { to } : {}),
                ...(zoneId !== 'all' ? { zone_id: zoneId } : {}),
                ...(tariffId !== 'all' ? { tariff_id: tariffId } : {}),
                ...(customerId !== 'all' ? { customer_id: customerId } : {}),
                ...(cashierId !== 'all' ? { cashier_id: cashierId } : {}),
            }).toString(),
        [from, to, zoneId, tariffId, customerId, cashierId],
    );

    const exportHref = `${route('finance.reports.export')}${exportParams ? `?${exportParams}` : ''}`;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Finance', href: route('finance') },
                { title: 'Reports', href: route('finance.reports.index') },
            ]}
        >
            <Head title="Finance Reports" />

            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                        <BarChart3 className="h-7 w-7 text-primary" />
                        Finance reports
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Revenue reports using existing payment data from bills and service charges.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Total revenue collected</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-emerald-700">
                            {formatCurrency(summary?.total_revenue_collected ?? 0)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Outstanding bills</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold text-rose-700">
                            {formatCurrency(summary?.outstanding_bills ?? 0)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Overdue bills</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">{(summary?.overdue_bills ?? 0).toLocaleString()}</CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-muted-foreground">Payments in view</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-bold">{(summary?.payments_count ?? 0).toLocaleString()}</CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileSpreadsheet className="h-4 w-4" />
                            Report filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
                        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />

                        <Select value={zoneId} onValueChange={setZoneId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Zone" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All zones</SelectItem>
                                {filterOptions?.zones?.map((zone) => (
                                    <SelectItem key={zone.id} value={String(zone.id)}>
                                        {zone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={tariffId} onValueChange={setTariffId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tariff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All tariffs</SelectItem>
                                {filterOptions?.tariffs?.map((tariff) => (
                                    <SelectItem key={tariff.id} value={String(tariff.id)}>
                                        {tariff.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={customerId} onValueChange={setCustomerId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Customer" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All customers</SelectItem>
                                {filterOptions?.customers?.map((customer) => (
                                    <SelectItem key={customer.id} value={String(customer.id)}>
                                        {customer.name} ({customer.account_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={cashierId} onValueChange={setCashierId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Cashier" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All cashiers</SelectItem>
                                {filterOptions?.cashiers?.map((cashier) => (
                                    <SelectItem key={cashier.id} value={String(cashier.id)}>
                                        {cashier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" asChild>
                        <a href={exportHref}>
                            <Download className="mr-2 h-4 w-4" />
                            Export to Excel (CSV)
                        </a>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.print();
                        }}
                    >
                        <Printer className="mr-2 h-4 w-4" />
                        Export to PDF (Print)
                    </Button>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Monthly collection summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 text-left">Month</th>
                                    <th className="py-2 text-right">Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyCollectionSummary.map((row) => (
                                    <tr key={row.month} className="border-b last:border-0">
                                        <td className="py-2">{row.month}</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(row.collected)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Zone revenue comparison</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 text-left">Zone</th>
                                    <th className="py-2 text-right">Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zoneRevenueComparison.map((row) => (
                                    <tr key={row.zone} className="border-b last:border-0">
                                        <td className="py-2">{row.zone}</td>
                                        <td className="py-2 text-right font-medium">{formatCurrency(row.collected)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-lg border bg-card p-4">
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Payment records (existing data)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="py-2 text-left">Date</th>
                                    <th className="py-2 text-left">Type</th>
                                    <th className="py-2 text-left">Reference</th>
                                    <th className="py-2 text-left">Customer</th>
                                    <th className="py-2 text-left">Zone</th>
                                    <th className="py-2 text-left">Tariff</th>
                                    <th className="py-2 text-left">Cashier</th>
                                    <th className="py-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <tr key={`${payment.type}-${payment.reference}`} className="border-b last:border-0">
                                            <td className="py-2">{payment.date ?? '-'}</td>
                                            <td className="py-2 capitalize">{payment.type.replace('_', ' ')}</td>
                                            <td className="py-2 font-mono text-xs">{payment.reference}</td>
                                            <td className="py-2">
                                                {payment.customer_name} ({payment.account_number})
                                            </td>
                                            <td className="py-2">{payment.zone_name ?? '-'}</td>
                                            <td className="py-2">{payment.tariff_name ?? '-'}</td>
                                            <td className="py-2">{payment.cashier_name ?? 'N/A'}</td>
                                            <td className="py-2 text-right font-medium">{formatCurrency(payment.amount)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="py-6 text-center text-muted-foreground" colSpan={8}>
                                            No payment data matches the selected filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
