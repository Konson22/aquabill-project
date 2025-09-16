import PaymentFormModal from '@/components/payments/PaymentFormModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input, Select } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, CreditCard, DollarSign, Download, Eye, FileText, MoreVertical, Printer, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [
    {
        title: 'Finance',
        href: '/finance',
    },
    {
        title: 'Billing',
        href: '/billing',
    },
];

const statusColors = {
    paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    partially_paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    balance_forwarded: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function BillingIndex({ bills, filters = {} }) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentDefaults, setPaymentDefaults] = useState({});

    const billItems = useMemo(() => {
        if (!bills || !bills.data) return [];
        return bills.data;
    }, [bills]);

    const filteredBills = useMemo(() => {
        let list = billItems;
        if (searchQuery.trim() !== '') {
            const s = searchQuery.toLowerCase();
            list = list.filter((b) => {
                const name = `${b.customer?.first_name || ''} ${b.customer?.last_name || ''}`.toLowerCase();
                const acct = (b.customer?.account_number || '').toString().toLowerCase();
                const serial = (b.meter?.serial || '').toLowerCase();
                return name.includes(s) || acct.includes(s) || serial.includes(s);
            });
        }
        if (statusFilter) {
            list = list.filter((b) => b.status === statusFilter);
        }
        return list;
    }, [billItems, searchQuery, statusFilter]);

    const stats = useMemo(() => {
        const total = filteredBills.length;
        const totalAmount = filteredBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
        const outstanding = filteredBills.reduce((sum, b) => sum + parseFloat(b.current_balance || 0), 0);

        // This month's bills
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const thisMonthBills = filteredBills.filter((b) => {
            const billDate = new Date(b.created_at);
            return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
        });

        return {
            total,
            totalAmount,
            outstanding,
            paid: filteredBills.filter((b) => b.status === 'paid').length,
            unpaid: filteredBills.filter((b) => b.status === 'unpaid').length,
            overdue: filteredBills.filter((b) => b.status === 'overdue').length,
            thisMonth: thisMonthBills.length,
            thisMonthAmount: thisMonthBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
        };
    }, [filteredBills]);

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const openPaymentModal = (bill) => {
        setPaymentDefaults({
            bill_id: bill.id,
            customer_id: bill.customer?.id || '',
            customer_name: bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '',
            prev_balance: bill.prev_balance || 0,
            total_amount: bill.total_amount || 0,
            amount: bill.current_balance || '',
            tariff: bill.customer.category.tariff || '',
            fixed_charge: bill.customer.category.fixed_charge || '',
            illigal_connection: bill.reading.illigal_connection || 0,
            date: new Date().toISOString().split('T')[0],
            method: 'cash',
        });
        setPaymentModalOpen(true);
    };

    const submitPayment = (data) => {
        const payload = {
            bill_id: data.bill_id,
            customer_id: data.customer_id,
            payment_date: data.date,
            amount_paid: data.amount,
            payment_method: data.method,
            reference_number: data.reference_number || 'N/A', // Fix field name mismatch
        };

        return new Promise((resolve) => {
            router.post('/payments', payload, {
                onSuccess: () => resolve(),
                onError: (errors) => {
                    console.error('Payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Billing</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">Browse and manage bills</p>
                </div>
                <div className="flex items-center gap-2">
                    <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                    <span className="text-sm text-slate-500">to</span>
                    <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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
                        Range Filter
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (searchQuery) params.set('search', searchQuery);
                            if (statusFilter) params.set('status', statusFilter);
                            if (dateFrom) params.set('date_from', dateFrom);
                            if (dateTo) params.set('date_to', dateTo);
                            const query = params.toString();
                            window.location.href = `/billing-range/export${query ? `?${query}` : ''}`;
                        }}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Export Excel
                    </Button>
                </div>
            </div>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                                <CardDescription>All bills</CardDescription>
                            </div>
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium">Paid Bills</CardTitle>
                                <CardDescription>Successfully paid</CardDescription>
                            </div>
                            <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.paid}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
                                <CardDescription>Pending payment</CardDescription>
                            </div>
                            <DollarSign className="h-5 w-5 text-yellow-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.unpaid}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                <CardDescription>Bills generated this month</CardDescription>
                            </div>
                            <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.thisMonth}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">{formatSSPCurrency(stats.thisMonthAmount)}</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <CardTitle>Bills</CardTitle>
                            <CardDescription>Search and filter bills</CardDescription>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative w-[30rem]">
                                <Input
                                    type="text"
                                    placeholder="Search by name, account, meter..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="">
                                <Select
                                    placeholder="All statuses"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { id: 'unpaid', name: 'Unpaid' },
                                        { id: 'paid', name: 'Paid' },
                                        { id: 'overdue', name: 'Overdue' },
                                        { id: 'partially_paid', name: 'Partially Paid' },
                                        { id: 'balance_forwarded', name: 'Balance Forwarded' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-4 py-3 text-left font-semibold">Customer</th>
                                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                                    <th className="px-4 py-3 text-left font-semibold">Total</th>
                                    <th className="px-4 py-3 text-left font-semibold">Paid</th>
                                    <th className="px-4 py-3 text-left font-semibold">Balance</th>
                                    <th className="px-4 py-3 text-left font-semibold">Ref No</th>
                                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBills.length > 0 ? (
                                    filteredBills.map((bill) => {
                                        const totalSum = Number(bill.total_amount);
                                        const tariff = Number(bill?.customer?.category?.tariff || 0);
                                        const paid = Number(bill?.payment?.amount_paid || 0);

                                        const balance = totalSum - paid;

                                        return (
                                            <tr
                                                key={bill.id}
                                                className="border-b border-slate-100 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                                            >
                                                <td className="px-4 py-3">
                                                    <Link href={`/customers/${bill?.customer_id}`}>
                                                        <div className="text-sm font-medium">
                                                            {bill.customer ? (
                                                                <>
                                                                    {bill.customer.first_name} {bill.customer.last_name}
                                                                    {bill.meter && <p className="text-xs text-slate-500">{bill.meter.serial}</p>}
                                                                </>
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{formatDate(bill.created_at)}</td>
                                                <td className="px-4 py-3 text-sm">{formatSSPCurrency(totalSum)}</td>
                                                <td className="px-4 py-3 text-sm">{formatSSPCurrency(paid)}</td>
                                                <td className="px-4 py-3 text-sm">{formatSSPCurrency(balance)}</td>
                                                <td className="px-4 py-3 text-sm text-red-500">
                                                    {bill?.payment?.reference_number ? (
                                                        <Link href={`/payments/${bill?.payment?.reference_number}`}>
                                                            REF: ({bill?.payment?.reference_number})
                                                        </Link>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge className={statusColors[bill.status] || ''}>{bill.status?.replace('_', ' ') || '—'}</Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('billing.show', bill.id)} className="flex items-center gap-2">
                                                                    <Eye className="h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {bill.status == 'unpaid' && (
                                                                <>
                                                                    <DropdownMenuItem asChild>
                                                                        <Link
                                                                            href={route('billing.print', bill.id)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <Printer className="h-4 w-4" />
                                                                            Print
                                                                        </Link>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onSelect={(e) => {
                                                                            e.preventDefault();
                                                                            openPaymentModal(bill);
                                                                        }}
                                                                    >
                                                                        <CreditCard className="h-4 w-4" />
                                                                        Pay
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                            <div className="flex flex-col items-center">
                                                <Search className="mb-2 h-8 w-8 text-slate-300" />
                                                <p className="text-sm">No bills found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {bills && bills.links && bills.links.length > 0 && (
                        <div className="mt-6 flex items-center justify-end gap-2">
                            {bills.links.map((link, idx) => (
                                <Link
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`rounded border px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <PaymentFormModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                defaultValues={paymentDefaults}
                onSubmit={submitPayment}
                methods={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'mobile_money', label: 'Mobile Money' },
                    { value: 'bank_transfer', label: 'Bank Transfer' },
                ]}
                trigger={<span />}
            />
        </AppLayout>
    );
}
