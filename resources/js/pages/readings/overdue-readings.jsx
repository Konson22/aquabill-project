import ReadingModal from '@/components/reading-modal';
import AppLayout from '@/layouts/app-layout';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    FileSpreadsheet,
    History,
    PowerOff,
    Search,
    TriangleAlert,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs = [
    { title: 'Meter readings', href: route('readings.index') },
    { title: 'Overdue readings', href: route('readings.overdue') },
];

const currentMonthLabel = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
});

/**
 * @param {string | null | undefined} value
 */
/**
 * @param {{
 *   customer: Record<string, unknown>,
 *   onRecordReading: () => void,
 * }} props
 */
function CustomerRowActions({ customer, onRecordReading }) {
    const isDisconnected = customer.status === 'disconnected';
    const paymentSearch = customer.account_number || customer.name || undefined;

    return (
        <div className="flex flex-wrap items-center justify-end gap-1">
            <Button
                type="button"
                size="sm"
                className="h-8 gap-1 bg-emerald-600 px-2 hover:bg-emerald-700"
                onClick={onRecordReading}
                title="Record reading"
            >
                <Activity className="h-3.5 w-3.5" />
                <span className="hidden text-xs sm:inline">Record</span>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 shadow-sm" asChild title="View customer">
                <Link href={route('customers.show', customer.id)}>
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="sr-only">View</span>
                </Link>
            </Button>
            {isDisconnected ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shadow-sm"
                    disabled
                    title="Already disconnected"
                >
                    <PowerOff className="h-4 w-4 text-muted-foreground" />
                    <span className="sr-only">Disconnect</span>
                </Button>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 shadow-sm"
                    asChild
                    title="Disconnection"
                >
                    <Link href={route('customers.disconnection-status', customer.id)}>
                        <PowerOff className="h-4 w-4 text-orange-600" />
                        <span className="sr-only">Disconnect</span>
                    </Link>
                </Button>
            )}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 shadow-sm" asChild title="Issue charge">
                <Link href={route('customers.service-charges.create', customer.id)}>
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="sr-only">Charge</span>
                </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 shadow-sm" asChild title="Record payment">
                <Link
                    href={route('bills.index', {
                        search: paymentSearch,
                        status: 'pending',
                    })}
                >
                    <DollarSign className="h-4 w-4 text-sky-600" />
                    <span className="sr-only">Payment</span>
                </Link>
            </Button>
        </div>
    );
}

/**
 * @param {string | null | undefined} value
 */
function formatLastReadingDate(value) {
    if (!value) {
        return 'Never';
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);

        return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

/**
 * @param {{ overdueCustomers?: object, filters?: { search?: string } }} props
 */
export default function OverdueReadings({ overdueCustomers, filters = {} }) {
    const safeCustomers = overdueCustomers ?? { data: [], links: [], from: 0, to: 0, total: 0 };
    const rows = safeCustomers.data ?? [];

    const [search, setSearch] = useState(filters?.search ?? '');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('readings.overdue'),
                { search: search || undefined },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['overdueCustomers', 'filters'],
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    const pageStats = useMemo(() => {
        const neverRead = rows.filter((c) => !c.last_reading_date).length;
        const maxDays = rows.reduce((max, c) => Math.max(max, Number(c.days_overdue ?? 0)), 0);

        return { neverRead, maxDays };
    }, [rows]);

    const exportHref = useMemo(() => {
        const params = new URLSearchParams();
        if (search) {
            params.set('search', search);
        }

        const query = params.toString();

        return `${route('readings.overdue.export')}${query ? `?${query}` : ''}`;
    }, [search]);

    const openRecordReading = (customer) => {
        setSelectedCustomer(customer);
        setIsReadingModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overdue meter readings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                            <TriangleAlert className="h-7 w-7 text-amber-600" />
                            Overdue readings
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Active customers with an active meter who have no reading recorded in{' '}
                            {currentMonthLabel}.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                            <a href={exportHref}>
                                <FileSpreadsheet className="h-4 w-4" />
                                Export CSV
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                            <Link href={route('readings.index')}>
                                <History className="h-4 w-4" />
                                Reading history
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <RevenueStatCard title="Overdue customers" valueClassName="text-amber-600 dark:text-amber-400">
                        {safeCustomers.total.toLocaleString()}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            Missing a reading this month
                        </span>
                    </RevenueStatCard>
                    <RevenueStatCard title="Never recorded" valueClassName="text-rose-600 dark:text-rose-400">
                        {pageStats.neverRead.toLocaleString()}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            On this page (no last reading date)
                        </span>
                    </RevenueStatCard>
                    <RevenueStatCard title="Longest gap (page)" valueClassName="text-slate-900 dark:text-slate-100">
                        {pageStats.maxDays > 0 ? `${pageStats.maxDays} days` : '—'}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            Since last reading or connection
                        </span>
                    </RevenueStatCard>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b bg-sky-800 px-4 py-4 sm:px-6 md:flex-row md:items-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                                <Calendar className="mr-1 h-3 w-3" />
                                {currentMonthLabel}
                            </Badge>
                            <Badge className="border-amber-300/40 bg-amber-500/20 text-amber-50 hover:bg-amber-500/20">
                                {safeCustomers.total.toLocaleString()} overdue
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center border-b p-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search name, account, plot, or meter..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 rounded-xl border-gray-300/70 bg-background pl-9 transition-all focus-visible:border-primary/30 focus-visible:bg-background"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-x-auto">
                      <Table>
                          <TableHeader>
                              <TableRow className="border-y bg-muted text-[10px] font-black tracking-widest text-muted-foreground uppercase hover:bg-muted/30">
                                  <TableHead className="px-6 py-4">Customer</TableHead>
                                  <TableHead className="px-6 py-4">Meter no.</TableHead>
                                  <TableHead className="px-6 py-4">Zone</TableHead>
                                  <TableHead className="px-6 py-4 text-right">Reading (m³)</TableHead>
                                  <TableHead className="px-6 py-4">Reading date</TableHead>
                                  <TableHead className="px-6 py-4 text-right">Days since</TableHead>
                                  <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {rows.length === 0 ? (
                                  <TableRow>
                                      <TableCell
                                          colSpan={7}
                                          className="px-6 py-12 text-center text-muted-foreground"
                                      >
                                          <Users className="mx-auto mb-3 h-8 w-8 opacity-40" />
                                          <p className="font-medium text-foreground">No overdue readings</p>
                                          <p className="mt-1 text-sm">
                                              Every active customer has a reading for {currentMonthLabel}.
                                          </p>
                                      </TableCell>
                                  </TableRow>
                              ) : (
                                  rows.map((customer) => {
                                      const meter = customer.meters?.[0];
                                      const daysOverdue = customer.days_overdue;
                                      const readingDate = customer.last_reading_date;
                                      const lastIndex = meter?.last_reading;
                                      const neverRead = !readingDate;

                                      return (
                                          <TableRow
                                              key={customer.id}
                                              className="group text-sm transition-colors duration-200 hover:bg-amber-50/40"
                                          >
                                              <TableCell className="px-6 py-4">
                                                  <div className="min-w-0">
                                                      <Link
                                                          href={route('customers.show', customer.id)}
                                                          className="truncate font-medium text-foreground hover:text-sky-700 hover:underline"
                                                      >
                                                          {customer.name ?? '—'}
                                                      </Link>
                                                      <p className="font-mono text-xs text-muted-foreground">
                                                          {customer.account_number ?? '—'}
                                                      </p>
                                                  </div>
                                              </TableCell>
                                              <TableCell className="px-6 py-4">
                                                  <span className="font-mono text-sm">
                                                      {meter?.meter_number ?? '—'}
                                                  </span>
                                              </TableCell>
                                              <TableCell className="px-6 py-4 text-muted-foreground">
                                                  {customer.zone?.name ?? '—'}
                                              </TableCell>
                                              <TableCell className="px-6 py-4 text-right font-mono tabular-nums">
                                                  {lastIndex != null && lastIndex !== ''
                                                      ? Number(lastIndex).toLocaleString(undefined, {
                                                            maximumFractionDigits: 2,
                                                        })
                                                      : '—'}
                                              </TableCell>
                                              <TableCell className="px-6 py-4">
                                                  <span
                                                      className={cn(
                                                          'tabular-nums',
                                                          neverRead && 'font-medium text-rose-600',
                                                      )}
                                                  >
                                                      {formatLastReadingDate(readingDate)}
                                                  </span>
                                              </TableCell>
                                              <TableCell className="px-6 py-4 text-right">
                                                  {daysOverdue != null && daysOverdue > 0 ? (
                                                      <Badge
                                                          variant="outline"
                                                          className="border-amber-200 bg-amber-50 font-mono text-[10px] text-amber-800"
                                                      >
                                                          {daysOverdue}d
                                                      </Badge>
                                                  ) : (
                                                      <span className="text-xs text-muted-foreground">—</span>
                                                  )}
                                              </TableCell>
                                              <TableCell className="px-6 py-4 text-right">
                                                  <CustomerRowActions
                                                      customer={customer}
                                                      onRecordReading={() => openRecordReading(customer)}
                                                  />
                                              </TableCell>
                                          </TableRow>
                                      );
                                  })
                              )}
                          </TableBody>
                      </Table>
                    </div>

                    {safeCustomers.links?.length > 3 ? (
                        <div className="flex flex-col items-center justify-between gap-3 border-t bg-muted/10 px-6 py-4 sm:flex-row">
                            <span className="text-xs font-medium text-muted-foreground">
                                Showing <span className="font-bold text-foreground">{safeCustomers.from}</span> to{' '}
                                <span className="font-bold text-foreground">{safeCustomers.to}</span> of{' '}
                                <span className="font-bold text-foreground">{safeCustomers.total}</span> customers
                            </span>
                            <div className="flex items-center gap-1">
                                {safeCustomers.links.map((link, index) => (
                                    <Button
                                        key={index}
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
                    ) : null}
                </div>

                <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                    <p>
                        <span className="font-semibold">Days since</span> is measured from the customer&apos;s last
                        reading date, or connection date if they have never been read. Capture a reading to generate
                        this month&apos;s bill.
                    </p>
                </div>
            </div>

            <ReadingModal
                customer={selectedCustomer}
                isOpen={isReadingModalOpen}
                onClose={() => setIsReadingModalOpen(false)}
            />
        </AppLayout>
    );
}
