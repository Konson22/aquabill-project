import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, DollarSign, FileText, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [
    { title: 'Billing', href: '/billing' },
    { title: 'Range Filter', href: '/billing-range' },
];

const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    balance_forwarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function BillingRange({ bills, filters = {}, stats = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [selectedIds, setSelectedIds] = useState([]);
    const allIdsOnPage = useMemo(() => (bills?.data ? bills.data.map((b) => b.id) : []), [bills]);
    const allSelectedOnPage = useMemo(
        () => allIdsOnPage.length > 0 && allIdsOnPage.every((id) => selectedIds.includes(id)),
        [allIdsOnPage, selectedIds],
    );

    const billItems = useMemo(() => (bills?.data ? bills.data : []), [bills]);

    const formatCurrency = (amount) => `SSP ${Number(amount || 0).toLocaleString('en-SS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (date) => (date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Range" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Billing - Range Filter</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Filter bills by date range and status</p>
                </div>
                <div>
                    <Button
                        variant="default"
                        onClick={() => {
                            router.visit(route('billing.range.export'), {
                                method: 'get',
                                data: {
                                    search: searchQuery || undefined,
                                    status: statusFilter || undefined,
                                    date_from: dateFrom || undefined,
                                    date_to: dateTo || undefined,
                                },
                            });
                        }}
                        className="gap-2"
                    >
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total || 0}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">In selected range</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Sum in range</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <DollarSign className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.outstanding)}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Unpaid in range</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <Calendar className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.overdue || 0}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Past due in range</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Bills</CardTitle>
                            <CardDescription className="mt-1 block">Choose a date range and filters</CardDescription>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                            <div className="relative w-48 sm:w-64">
                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name, account, meter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-background h-9 rounded-md border px-3 text-sm"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="">All statuses</option>
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                                <option value="partially_paid">Partially Paid</option>
                                <option value="balance_forwarded">Balance Forwarded</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
                                <span className="text-sm text-slate-500">to</span>
                                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        router.get(
                                            '/billing-range',
                                            {
                                                search: searchQuery || undefined,
                                                status: statusFilter || undefined,
                                                date_from: dateFrom || undefined,
                                                date_to: dateTo || undefined,
                                            },
                                            { preserveScroll: true, preserveState: true },
                                        );
                                    }}
                                >
                                    Apply
                                </Button>
                                {(filters.date_from || filters.date_to) && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setDateFrom('');
                                            setDateTo('');
                                            router.get(
                                                '/billing-range',
                                                {
                                                    search: searchQuery || undefined,
                                                    status: statusFilter || undefined,
                                                },
                                                { preserveScroll: true, preserveState: true },
                                            );
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                                <Button
                                    variant="default"
                                    onClick={() => {
                                        router.visit(route('billing.range.export'), {
                                            method: 'get',
                                            data: {
                                                search: searchQuery || undefined,
                                                status: statusFilter || undefined,
                                                date_from: dateFrom || undefined,
                                                date_to: dateTo || undefined,
                                            },
                                        });
                                    }}
                                >
                                    Export Excel
                                </Button>
                                <Button
                                    variant="default"
                                    disabled={selectedIds.length === 0}
                                    onClick={() => {
                                        const idsParam = selectedIds.join(',');
                                        router.get(route('billing.print-multiple-only'), { ids: idsParam }, { preserveScroll: true });
                                    }}
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" /> Print All
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3">
                                        <input
                                            type="checkbox"
                                            checked={allSelectedOnPage}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    const merged = Array.from(new Set([...selectedIds, ...allIdsOnPage]));
                                                    setSelectedIds(merged);
                                                } else {
                                                    const filtered = selectedIds.filter((id) => !allIdsOnPage.includes(id));
                                                    setSelectedIds(filtered);
                                                }
                                            }}
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold">Meter</th>
                                    <th className="px-4 py-3 text-left font-semibold">Period</th>
                                    <th className="px-4 py-3 text-left font-semibold">Consumption</th>
                                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                                    <th className="px-4 py-3 text-left font-semibold">Outstanding</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {billItems.length > 0 ? (
                                    billItems.map((bill) => (
                                        <tr
                                            key={bill.id}
                                            className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(bill.id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedIds((prev) => Array.from(new Set([...prev, bill.id])));
                                                        } else {
                                                            setSelectedIds((prev) => prev.filter((id) => id !== bill.id));
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-medium">
                                                    {bill.customer ? (
                                                        <>
                                                            {bill.customer.first_name} {bill.customer.last_name}
                                                            {bill.customer.account_number && (
                                                                <p className="text-xs text-slate-500">#{bill.customer.account_number}</p>
                                                            )}
                                                        </>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm">{bill.meter ? bill.meter.serial : '—'}</td>
                                            <td className="px-4 py-3 text-sm">
                                                {formatDate(bill.billing_period_start)} — {formatDate(bill.billing_period_end)}
                                            </td>
                                            <td className="px-4 py-3 text-sm">{Number(bill.consumption || 0).toLocaleString()} m³</td>
                                            <td className="px-4 py-3 text-sm">{formatCurrency(bill.total_amount)}</td>
                                            <td className="px-4 py-3 text-sm">{formatCurrency(bill.current_balance)}</td>
                                            <td className="px-4 py-3">
                                                <Badge className={statusColors[bill.status] || ''}>{bill.status?.replace('_', ' ') || '—'}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button asChild variant="outline" size="sm" className="gap-2">
                                                    <Link href={route('billing.print-only', bill.id)} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="h-4 w-4" /> Print
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                                            No bills found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
