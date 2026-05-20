import AppLayout from '@/layouts/app-layout';
import ConfirmPaymentModal from './components/confirm-payment-modal';
import { RevenueStatCard } from '@/components/reports/revenue-stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    CircleCheck,
    Clock,
    CreditCard,
    DollarSign,
    Eye,
    MoreHorizontal,
    Plus,
    Printer,
    Receipt,
    Search,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Service charges',
        href: route('service-charges.index'),
    },
];

const EMPTY_SUMMARY = {
    total_count: 0,
    total_amount: 0,
    unpaid_count: 0,
    unpaid_amount: 0,
    paid_count: 0,
    paid_amount: 0,
};

/**
 * @param {string | null | undefined} value
 */
function formatIssuedDate(value) {
    if (!value) {
        return '—';
    }

    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            return String(value);
        }

        return d.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

/**
 * @param {string | undefined} status
 */
function StatusBadge({ status }) {
    if (status === 'paid') {
        return (
            <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-700 uppercase hover:bg-emerald-50"
            >
                Paid
            </Badge>
        );
    }

    if (status === 'unpaid') {
        return (
            <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black tracking-widest text-amber-700 uppercase hover:bg-amber-50"
            >
                Unpaid
            </Badge>
        );
    }

    return (
        <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-black tracking-widest uppercase">
            {status ?? '—'}
        </Badge>
    );
}

export default function ServiceChargesIndex({
    charges,
    stations = [],
    filters = {},
    statusCounts = {},
    summary,
}) {
    const safeCharges = charges ?? { data: [], links: [], from: 0, to: 0, total: 0 };
    const rows = safeCharges.data ?? [];
    const safeSummary = summary ?? EMPTY_SUMMARY;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');
    const [selectedCharge, setSelectedCharge] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('service-charges.index'),
                {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['charges', 'filters', 'statusCounts', 'summary'],
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status]);

    const openConfirmPayment = (charge) => {
        setSelectedCharge(charge);
        setIsPaymentModalOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Service charges" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Service charges</h1>
                        <p className="text-sm text-muted-foreground">
                            One-off fees issued to customers — confirm payment or open a customer to issue a new charge.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <RevenueStatCard title="Total charges" valueClassName="text-primary">
                        {safeSummary.total_count.toLocaleString()}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            {formatCurrency(safeSummary.total_amount)}
                        </span>
                    </RevenueStatCard>
                    <RevenueStatCard title="Unpaid" valueClassName="text-amber-600 dark:text-amber-400">
                        {safeSummary.unpaid_count.toLocaleString()}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            {formatCurrency(safeSummary.unpaid_amount)}
                        </span>
                    </RevenueStatCard>
                    <RevenueStatCard title="Paid" valueClassName="text-emerald-600 dark:text-emerald-400">
                        {safeSummary.paid_count.toLocaleString()}
                        <span className="mt-1 block text-sm font-normal text-muted-foreground">
                            {formatCurrency(safeSummary.paid_amount)}
                        </span>
                    </RevenueStatCard>
                </div>

                <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="flex flex-col justify-between gap-4 bg-sky-800 px-4 pt-4 sm:px-6 md:flex-row md:items-end">
                        <Tabs value={status} onValueChange={setStatus} className="-mb-px w-full overflow-hidden md:w-auto">
                            <TabsList className="hide-scrollbar flex h-auto w-full gap-1 overflow-x-auto bg-transparent p-0 md:w-auto">
                                <TabsTrigger
                                    value="all"
                                    className="flex items-center gap-2 rounded-t-lg rounded-b-none border-0 px-4 py-2.5 text-[13px] font-bold whitespace-nowrap text-white/70 transition-colors hover:bg-white/20 hover:text-white data-[state=active]:bg-card data-[state=active]:text-sky-800 data-[state=active]:shadow-none data-[state=inactive]:bg-white/10"
                                >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    All
                                    <span
                                        className={cn(
                                            'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm px-1 text-[9px] font-black tabular-nums',
                                            status === 'all' ? 'bg-sky-800/10 text-sky-800' : 'bg-black/10 text-white',
                                        )}
                                    >
                                        {statusCounts.all ?? 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unpaid"
                                    className="flex items-center gap-2 rounded-t-lg rounded-b-none border-0 px-4 py-2.5 text-[13px] font-bold whitespace-nowrap text-white/70 transition-colors hover:bg-white/20 hover:text-white data-[state=active]:bg-card data-[state=active]:text-sky-800 data-[state=active]:shadow-none data-[state=inactive]:bg-white/10"
                                >
                                    <Clock className="h-3.5 w-3.5" />
                                    Unpaid
                                    <span
                                        className={cn(
                                            'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm px-1 text-[9px] font-black tabular-nums',
                                            status === 'unpaid' ? 'bg-sky-800/10 text-sky-800' : 'bg-black/10 text-white',
                                        )}
                                    >
                                        {statusCounts.unpaid ?? 0}
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="paid"
                                    className="flex items-center gap-2 rounded-t-lg rounded-b-none border-0 px-4 py-2.5 text-[13px] font-bold whitespace-nowrap text-white/70 transition-colors hover:bg-white/20 hover:text-white data-[state=active]:bg-card data-[state=active]:text-sky-800 data-[state=active]:shadow-none data-[state=inactive]:bg-white/10"
                                >
                                    <CircleCheck className="h-3.5 w-3.5" />
                                    Paid
                                    <span
                                        className={cn(
                                            'inline-flex h-4 min-w-[1rem] items-center justify-center rounded-sm px-1 text-[9px] font-black tabular-nums',
                                            status === 'paid' ? 'bg-sky-800/10 text-sky-800' : 'bg-black/10 text-white',
                                        )}
                                    >
                                        {statusCounts.paid ?? 0}
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-3 pb-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-2 rounded-lg border-white/20 bg-white/10 text-white shadow-sm hover:bg-white/20 hover:text-white"
                                asChild
                            >
                                <Link
                                    href={route('payments-report.index', { payment_type: 'service_charge' })}
                                >
                                    <Receipt className="h-4 w-4" />
                                    <span className="hidden sm:inline">Payment log</span>
                                </Link>
                            </Button>
                            <Button
                                size="sm"
                                className="h-9 gap-2 rounded-lg bg-white font-semibold text-sky-800 shadow-sm hover:bg-white/90"
                                asChild
                            >
                                <Link href={route('customers.index')}>
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Issue charge</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center border-b p-4">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search customer, account, or charge type..."
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
                                    <TableHead className="px-6 py-4">Charge type</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Amount</TableHead>
                                    <TableHead className="px-6 py-4">Issued</TableHead>
                                    <TableHead className="px-6 py-4 text-center">Status</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-muted-foreground"
                                        >
                                            <Users className="mx-auto mb-3 h-8 w-8 opacity-40" />
                                            <p className="font-medium text-foreground">No service charges found</p>
                                            <p className="mt-1 text-sm">Try another search or status filter.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map((charge) => (
                                        <TableRow
                                            key={charge.id}
                                            className="group text-sm transition-colors duration-200 hover:bg-blue-50/40"
                                        >
                                            <TableCell className="px-6 py-4">
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium">{charge.customer?.name ?? '—'}</p>
                                                    <p className="font-mono text-xs text-muted-foreground">
                                                        #{charge.customer?.account_number ?? '—'}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <p className="font-medium">{charge.service_charge_type?.name ?? '—'}</p>
                                                {charge.service_charge_type?.code ? (
                                                    <p className="text-xs text-muted-foreground">
                                                        {charge.service_charge_type.code}
                                                    </p>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right font-semibold tabular-nums">
                                                {formatCurrency(charge.total_due ?? charge.amount)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-muted-foreground">
                                                {formatIssuedDate(charge.issued_date)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-center">
                                                <StatusBadge status={charge.status} />
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-8 w-8 rounded-lg p-0 shadow-sm"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route('service-charges.print', charge.id)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Print receipt"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                            <span className="sr-only">Print</span>
                                                        </Link>
                                                    </Button>
                                                    <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 w-8 rounded-lg p-0 shadow-sm"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
                                                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                                                            Actions
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
                                                            <Link href={route('service-charges.show', charge.id)}>
                                                                <Eye className="h-4 w-4 text-blue-500" />
                                                                View details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild className="cursor-pointer gap-2 py-2">
                                                            <Link
                                                                href={route('service-charges.print', charge.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Printer className="h-4 w-4 text-muted-foreground" />
                                                                Print receipt
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 py-2 text-emerald-600 focus:text-emerald-600"
                                                            disabled={charge.status === 'paid'}
                                                            onSelect={() => openConfirmPayment(charge)}
                                                        >
                                                            <DollarSign className="h-4 w-4" />
                                                            Confirm payment
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {safeCharges.links?.length > 3 ? (
                        <div className="flex flex-col items-center justify-between gap-3 border-t bg-muted/10 px-6 py-4 sm:flex-row">
                            <span className="text-xs font-medium text-muted-foreground">
                                Showing <span className="font-bold text-foreground">{safeCharges.from}</span> to{' '}
                                <span className="font-bold text-foreground">{safeCharges.to}</span> of{' '}
                                <span className="font-bold text-foreground">{safeCharges.total}</span> charges
                            </span>
                            <div className="flex items-center gap-1">
                                {safeCharges.links.map((link, index) => (
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
            </div>

            <ConfirmPaymentModal
                charge={selectedCharge}
                stations={stations}
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
        </AppLayout>
    );
}
