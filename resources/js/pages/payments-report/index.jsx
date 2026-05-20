import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const reportHref = () => route('payments-report.index');

const breadcrumbs = [
    {
        title: 'Payments report',
        href: reportHref(),
    },
];

const ALL_MONTHS_VALUE = 'all';

function currentMonthValue() {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * @param {{ month?: string }} [f]
 */
function initialMonth(f) {
    const month = f?.month?.trim() ?? '';
    if (month === ALL_MONTHS_VALUE || /^\d{4}-\d{2}$/.test(month)) {
        return month;
    }

    return currentMonthValue();
}

/**
 * @param {string} month YYYY-MM or "all"
 */
function formatMonthLabel(month) {
    if (month === ALL_MONTHS_VALUE) {
        return `All months (${new Date().getFullYear()})`;
    }

    const [year, monthIndex] = month.split('-').map(Number);
    if (!year || !monthIndex) {
        return month;
    }

    return new Date(year, monthIndex - 1, 1).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
    });
}

/**
 * @returns {Array<{ value: string, label: string }>}
 */
function buildMonthSelectOptions() {
    const options = [{ value: ALL_MONTHS_VALUE, label: `All months (${new Date().getFullYear()})` }];
    const now = new Date();

    for (let offset = 0; offset < 24; offset += 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        options.push({
            value,
            label: formatMonthLabel(value),
        });
    }

    return options;
}

function toStringId(value) {
    return value != null && value !== '' ? String(value) : 'all';
}

function formatMethod(method) {
    if (!method) {
        return 'â€”';
    }

    return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * @param {{ payments: object, emptyMessage: string }} props
 */
function PaymentLogTable({ payments, emptyMessage }) {
    const safePayments = payments ?? { data: [], links: [], from: 0, to: 0, total: 0 };
    const rows = safePayments.data ?? [];

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Tariff</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Recorded by</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    ) : (
                        rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell className="py-2">
                                    {row.payment_date ?? 'â€”'}
                                </TableCell>
                                <TableCell className="py-2">{row.reference}</TableCell>
                                <TableCell>{row.customer_name ?? 'â€”'}</TableCell>
                                <TableCell>{row.tariff_name ?? 'â€”'}</TableCell>
                                <TableCell>{row.station_name ?? 'â€”'}</TableCell>
                                <TableCell>{row.recorder_name ?? 'â€”'}</TableCell>
                                <TableCell className="text-right ">
                                    {formatCurrency(row.amount)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {safePayments.links?.length > 3 && (
                <div className="flex items-center justify-between border-t bg-muted/10 px-6 py-4">
                    <span className="text-xs font-medium text-muted-foreground">
                        Showing <span className="font-bold text-foreground">{safePayments.from}</span> to{' '}
                        <span className="font-bold text-foreground">{safePayments.to}</span> of{' '}
                        <span className="font-bold text-foreground">{safePayments.total}</span> payments
                    </span>
                    <div className="flex items-center gap-1">
                        {safePayments.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                className="h-8 min-w-8 rounded-lg px-2 shadow-sm"
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
        </>
    );
}

export default function PaymentsReport({
    payments,
    summary,
    filters,
    filterOptions,
}) {
    const safePayments = payments ?? { data: [], links: [], from: 0, to: 0, total: 0 };
    const safeSummary = summary ?? { payments_count: 0, total_amount: 0, collection_rate_percent: 0 };
    const safeFilters = filters ?? {};
    const zones = filterOptions?.zones ?? [];
    const tariffs = filterOptions?.tariffs ?? [];
    const users = filterOptions?.users ?? [];
    const monthSelectOptions = useMemo(() => buildMonthSelectOptions(), []);

    const [month, setMonth] = useState(() => initialMonth(safeFilters));
    const [zoneId, setZoneId] = useState(toStringId(safeFilters.zone_id));
    const [tariffId, setTariffId] = useState(toStringId(safeFilters.tariff_id));
    const [recordedBy, setRecordedBy] = useState(toStringId(safeFilters.recorded_by));
    const [paymentType, setPaymentType] = useState(() =>
        safeFilters.payment_type === 'service_charge' ? 'service_charge' : 'bill',
    );

    const periodLabel = formatMonthLabel(safeFilters.month ?? month);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                reportHref(),
                {
                    month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
                    payment_type: paymentType,
                    zone_id: zoneId === 'all' ? undefined : zoneId,
                    tariff_id: tariffId === 'all' ? undefined : tariffId,
                    recorded_by: recordedBy === 'all' ? undefined : recordedBy,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['payments', 'summary', 'filters', 'filterOptions'],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [month, paymentType, zoneId, tariffId, recordedBy]);

    const exportParams = useMemo(
        () =>
            new URLSearchParams({
                month: month === ALL_MONTHS_VALUE ? ALL_MONTHS_VALUE : month,
                payment_type: paymentType,
                ...(zoneId !== 'all' ? { zone_id: zoneId } : {}),
                ...(tariffId !== 'all' ? { tariff_id: tariffId } : {}),
                ...(recordedBy !== 'all' ? { recorded_by: recordedBy } : {}),
            }).toString(),
        [month, paymentType, zoneId, tariffId, recordedBy],
    );

    const exportHref = `${route('payments-report.export')}${exportParams ? `?${exportParams}` : ''}`;

    const emptyMessage =
        paymentType === 'service_charge'
            ? 'No service charge payments match the current filters.'
            : 'No bill payments match the current filters.';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Payments report" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
              

                <Card className="px-4 py-3 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-2xl font-bold tracking-tight">Payments report</h1>
                    </div>
                  
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <div className="space-y-2">
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="h-9 w-full bg-background">
                                    <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {monthSelectOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select value={zoneId} onValueChange={setZoneId}>
                                <SelectTrigger className="h-9 w-full bg-background">
                                    <SelectValue placeholder="All zones" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All zones</SelectItem>
                                    {zones.map((z) => (
                                        <SelectItem key={z.id} value={String(z.id)}>
                                            {z.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select value={tariffId} onValueChange={setTariffId}>
                                <SelectTrigger className="h-9 w-full bg-background">
                                    <SelectValue placeholder="All tariffs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All tariffs</SelectItem>
                                    {tariffs.map((t) => (
                                        <SelectItem key={t.id} value={String(t.id)}>
                                            {t.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Select value={recordedBy} onValueChange={setRecordedBy}>
                                <SelectTrigger className="h-9 w-full bg-background">
                                    <SelectValue placeholder="All users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All users</SelectItem>
                                    {users.map((u) => (
                                        <SelectItem key={u.id} value={String(u.id)}>
                                            {u.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col justify-end space-y-2">
                            <Button variant="outline" size="sm" className="h-9 w-full gap-2" asChild>
                                <a href={exportHref}>
                                    <FileSpreadsheet className="h-4 w-4" aria-hidden />
                                    Export Excel
                                </a>
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <RevenueStatCard title="Payments in range" valueClassName="text-primary">
                        {safeSummary.payments_count.toLocaleString()}
                    </RevenueStatCard>
                    <RevenueStatCard title="Total collected" valueClassName="text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(safeSummary.total_amount)}
                    </RevenueStatCard>
                    <RevenueStatCard title="Collection rate" valueClassName="text-amber-600 dark:text-amber-400">
                        {Number(safeSummary.collection_rate_percent ?? 0).toLocaleString(undefined, {
                            maximumFractionDigits: 1,
                        })}
                        %
                    </RevenueStatCard>
                </div>

               

                <Card className="overflow-hidden">
                    <Tabs value={paymentType} onValueChange={setPaymentType} className="w-full">
                        <CardHeader className="border-b bg-muted/20 pb-0">
                            <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <CardTitle className="text-base">Payment log</CardTitle>
                                    <CardDescription>{periodLabel}</CardDescription>
                                </div>
                                <TabsList className="h-9 w-full sm:w-auto">
                                    <TabsTrigger value="bill" className="flex-1 sm:flex-none">
                                        Bills
                                    </TabsTrigger>
                                    <TabsTrigger value="service_charge" className="flex-1 sm:flex-none">
                                        Service charges
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <PaymentLogTable payments={safePayments} emptyMessage={emptyMessage} />
                        </CardContent>
                    </Tabs>
                </Card>
            </div>
        </AppLayout>
    );
}
