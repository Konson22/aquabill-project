import PaymentFormModal from '@/components/payments/PaymentFormModal';
import BillStatusBadge from '@/components/ui/bill-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CustomSearchBar from '@/components/ui/custom-search-bar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select } from '@/components/ui/input';
import MetricCard from '@/components/ui/metric-card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CreditCard, DollarSign, Download, Eye, FileText, Filter, MoreVertical, Plus, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
    const [yearFilter, setYearFilter] = useState(filters.year || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [paymentDefaults, setPaymentDefaults] = useState({});
    const [selectedIds, setSelectedIds] = useState([]);

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
        if (yearFilter) {
            list = list.filter((b) => {
                const billDate = new Date(b.created_at);
                return billDate.getFullYear().toString() === yearFilter;
            });
        }
        if (monthFilter) {
            list = list.filter((b) => {
                const billDate = new Date(b.created_at);
                return (billDate.getMonth() + 1).toString() === monthFilter;
            });
        }
        return list;
    }, [billItems, searchQuery, statusFilter, yearFilter, monthFilter]);

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

    // Sync filters to server (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = {
                search: searchQuery || undefined,
                status: statusFilter || undefined,
                year: yearFilter || undefined,
                month: monthFilter || undefined,
            };
            router.get('/billing', params, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(handle);
    }, [searchQuery, statusFilter, yearFilter, monthFilter]);

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

    // Alias used by action buttons
    const handleBillPayment = (bill) => openPaymentModal(bill);

    // Selection helpers
    const isSelected = (id) => selectedIds.includes(id);
    const toggleSelect = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
    };
    const allSelected = filteredBills.length > 0 && filteredBills.every((b) => selectedIds.includes(b.id));
    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !filteredBills.some((b) => b.id === id)));
        } else {
            const ids = filteredBills.map((b) => b.id);
            setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
        }
    };
    const handlePrintSelected = () => {
        if (selectedIds.length === 0) return;
        const url = `/billing/print-multiple-only?ids=${selectedIds.join(',')}`;
        window.open(url, '_blank');
    };

    const handleExport = () => {
        const headers = [
            'Bill ID',
            'Billing Period',
            'Customer Name',
            'Meter Serial',
            'Previous Reading',
            'Current Reading',
            'Consumption',
            'Tariff Rate',
            'Consumption Amount',
            'Fixed Charge',
            'Prev Balance',
            'Total Amount',
            'Amount Paid',
            'Current Balance',
            'Status',
        ];

        const rows = filteredBills.map((b) => {
            const prevReading = b.reading?.previous ?? 0;
            const currentReading = b.reading?.value ?? 0;
            const consumption = currentReading - prevReading;
            const tariff = b.customer?.category?.tariff ?? 0;
            const consumptionAmount = consumption * tariff;
            const fixedCharge = b.customer?.category?.fixed_charge ?? 0;
            const totalAmount = parseFloat(b.total_amount || 0);
            const grandTotal = totalAmount + (b.reading?.illigal_connection || 0) * tariff;
            const amountPaid = parseFloat(b.total_amount || 0) - parseFloat(b.current_balance || 0);
            const currentBalance = totalAmount - amountPaid;

            return [
                b.id,
                b.billing_period_start && b.billing_period_end
                    ? `${new Date(b.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(b.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : '',
                b.customer ? `${b.customer.first_name} ${b.customer.last_name}` : '',
                b.meter?.serial ?? '',
                prevReading,
                currentReading,
                consumption,
                tariff,
                consumptionAmount,
                fixedCharge,
                b.prev_balance ?? '',
                totalAmount,
                amountPaid,
                currentBalance,
                b.status ?? '',
            ];
        });

        // Calculate summary totals
        const summary = {
            totalBills: filteredBills.length,
            totalConsumption: filteredBills.reduce((sum, b) => {
                const prev = b.reading?.previous ?? 0;
                const current = b.reading?.value ?? 0;
                return sum + (current - prev);
            }, 0),
            totalAmount: filteredBills.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
            totalPaid: filteredBills.reduce((sum, b) => {
                const total = parseFloat(b.total_amount || 0);
                const current = parseFloat(b.current_balance || 0);
                return sum + (total - current);
            }, 0),
            totalOutstanding: filteredBills.reduce((sum, b) => sum + parseFloat(b.current_balance || 0), 0),
            paidBills: filteredBills.filter((b) => parseFloat(b.current_balance || 0) <= 0).length,
            unpaidBills: filteredBills.filter((b) => parseFloat(b.current_balance || 0) > 0).length,
        };

        const summaryRows = [
            [''],
            ['SUMMARY'],
            ['Total Bills', summary.totalBills],
            ['Total Consumption (M³)', summary.totalConsumption],
            ['Total Amount (SSP)', summary.totalAmount],
            ['Total Amount Paid (SSP)', summary.totalPaid],
            ['Total Outstanding (SSP)', summary.totalOutstanding],
            ['Paid Bills', summary.paidBills],
            ['Unpaid Bills', summary.unpaidBills],
            ['Collection Rate (%)', summary.totalAmount > 0 ? ((summary.totalPaid / summary.totalAmount) * 100).toFixed(2) : '0.00'],
        ];

        const csv = [headers, ...rows, ...summaryRows]
            .map((row) =>
                row
                    .map((cell) => {
                        const value = cell === null || cell === undefined ? '' : String(cell);
                        const escaped = value.replace(/"/g, '""');
                        return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
                    })
                    .join(','),
            )
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const ts = new Date().toISOString().split('T')[0];
        link.download = `bills_export_${ts}.csv`;
        link.click();
        URL.revokeObjectURL(url);
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
                onSuccess: () => {
                    setPaymentModalOpen(false);
                    resolve();
                    router.reload();
                },
                onError: (errors) => {
                    console.error('Payment submission error:', errors);
                    resolve();
                },
                onFinish: () => resolve(),
            });
        });
    };

    // Calculate key metrics
    const totalBills = billItems.length;
    const paidBills = billItems.filter((bill) => bill.current_balance <= 0).length;
    const unpaidBills = billItems.filter((bill) => bill.current_balance > 0).length;
    const totalRevenue = billItems.reduce((sum, bill) => sum + (parseFloat(bill.total_amount) || 0), 0);
    const collectedAmount = billItems.reduce((sum, bill) => {
        const paid = parseFloat(bill.total_amount) - (parseFloat(bill.current_balance) || 0);
        return sum + paid;
    }, 0);
    const collectionRate = totalRevenue > 0 ? ((collectedAmount / totalRevenue) * 100).toFixed(1) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing Management" />

            {/* Modern Header Section */}
            <div className="mb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Billing Management</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Comprehensive water billing system with advanced analytics</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics Dashboard */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                    title="Total Bills"
                    value={totalBills}
                    subtitle="All generated bills"
                    icon={FileText}
                    trend="up"
                    trendValue="+12% from last month"
                    color="green"
                />

                <MetricCard
                    title="Total Revenue"
                    value={formatSSPCurrency(totalRevenue)}
                    subtitle="Total bill amount"
                    icon={DollarSign}
                    trend="up"
                    trendValue="+8.2% from last month"
                    color="blue"
                />

                <MetricCard
                    title="Outstanding"
                    value={unpaidBills}
                    subtitle={unpaidBills > 0 ? 'Requires attention' : 'All clear'}
                    icon={AlertTriangle}
                    trend={unpaidBills > 0 ? 'down' : 'up'}
                    trendValue={unpaidBills > 0 ? 'Needs action' : 'All paid'}
                    color="red"
                />
            </div>

            {/* Advanced Filters (search moved to table toolbar) */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Advanced Filters
                            </CardTitle>
                            <CardDescription>Refine your search with powerful filtering options</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('');
                                setYearFilter('');
                                setMonthFilter('');
                            }}
                        >
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                            <Select
                                placeholder="All years"
                                value={yearFilter}
                                onChange={(e) => setYearFilter(e.target.value)}
                                options={[
                                    { id: '2025', name: '2025' },
                                    { id: '2026', name: '2026' },
                                    { id: '2027', name: '2027' },
                                    { id: '2028', name: '2028' },
                                    { id: '2029', name: '2029' },
                                    { id: '2030', name: '2030' },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
                            <Select
                                placeholder="All months"
                                value={monthFilter}
                                onChange={(e) => setMonthFilter(e.target.value)}
                                options={[
                                    { id: '1', name: 'January' },
                                    { id: '2', name: 'February' },
                                    { id: '3', name: 'March' },
                                    { id: '4', name: 'April' },
                                    { id: '5', name: 'May' },
                                    { id: '6', name: 'June' },
                                    { id: '7', name: 'July' },
                                    { id: '8', name: 'August' },
                                    { id: '9', name: 'September' },
                                    { id: '10', name: 'October' },
                                    { id: '11', name: 'November' },
                                    { id: '12', name: 'December' },
                                ]}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bills Table with Tabs - Hidden on mobile */}
            <Card className="hidden lg:block">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Bills Overview
                            </CardTitle>
                            <CardDescription>
                                {billItems.length} bills found • {paidBills} paid • {unpaidBills} outstanding
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <CustomSearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search bills by customer name, account number, or meter serial..."
                                className="w-80"
                                onClear={() => setSearchQuery('')}
                            />
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleExport()}>
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">Select all</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={handlePrintSelected} disabled={selectedIds.length === 0}>
                                <Printer className="h-4 w-4" />
                                Print Selected
                            </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="border-b border-slate-200 dark:border-slate-700">
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    <th className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Bill Details</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Customer</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Consumption</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Prev Balance</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Total</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-slate-100">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {filteredBills.length > 0 ? (
                                    filteredBills.map((bill) => {
                                        const isPaid = bill.current_balance <= 0;
                                        const isOverdue = new Date(bill.due_date) < new Date() && !isPaid;

                                        return (
                                            <tr key={bill.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(bill.id)}
                                                        onChange={() => toggleSelect(bill.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <Link
                                                            href={`/billing/${bill.id}`}
                                                            className="text-slate-900 hover:text-green-600 dark:text-slate-100 dark:hover:text-green-400"
                                                        >
                                                            {bill.billing_period_start && bill.billing_period_end
                                                                ? `${new Date(bill.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(bill.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                                : '—'}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-slate-900 dark:text-slate-100">
                                                            {bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        {bill.consumption ? `${bill.consumption} m³` : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                                        {bill.prev_balance != null ? formatSSPCurrency(bill.prev_balance) : '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-right">
                                                        <p className="text-slate-900 dark:text-slate-100">{formatSSPCurrency(bill.total_amount)}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <BillStatusBadge status={isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid'} size="sm" />
                                                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                            <Link href={`/billing/${bill.id}`}>
                                                                <Eye className="h-4 w-4" />
                                                            </Link>
                                                        </Button>

                                                        {bill.current_balance > 0 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 gap-1 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                                                onClick={() => handleBillPayment(bill)}
                                                            >
                                                                <CreditCard className="h-4 w-4" />
                                                                Pay
                                                            </Button>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={`/billing/${bill.id}`} className="flex items-center gap-2">
                                                                        <Eye className="h-4 w-4" />
                                                                        View Details
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <a
                                                                        href={`/billing/${bill.id}/print-only`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2"
                                                                    >
                                                                        <Printer className="h-4 w-4" />
                                                                        Print Bill
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                {bill.current_balance > 0 && (
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleBillPayment(bill)}
                                                                        className="flex items-center gap-2 text-green-600"
                                                                    >
                                                                        <CreditCard className="h-4 w-4" />
                                                                        Process Payment
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                                    <FileText className="h-8 w-8 text-slate-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">No bills found</h3>
                                                    <p className="text-slate-500 dark:text-slate-400">Get started by creating your first bill</p>
                                                </div>
                                                <Button
                                                    onClick={() => router.get('/billing/create')}
                                                    className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Create Bill
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile Card View with Tabs - Hidden on desktop */}
            <div className="block lg:hidden">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Bills (Mobile View)
                        </CardTitle>
                        <CardDescription>
                            {billItems.length} bills found • {paidBills} paid • {unpaidBills} outstanding
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {filteredBills.length > 0 ? (
                            filteredBills.map((bill) => {
                                const isPaid = bill.current_balance <= 0;
                                const isOverdue = new Date(bill.due_date) < new Date() && !isPaid;

                                return (
                                    <Card key={bill.id} className="border-l-4 border-l-slate-200 dark:border-l-slate-700">
                                        <CardContent className="p-4">
                                            <div className="mb-3 flex items-start justify-between">
                                                <div>
                                                    <Link
                                                        href={`/billing/${bill.id}`}
                                                        className="text-slate-900 hover:text-green-600 dark:text-slate-100 dark:hover:text-green-400"
                                                    >
                                                        {bill.billing_period_start && bill.billing_period_end
                                                            ? `${new Date(bill.billing_period_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(bill.billing_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                                                            : '—'}
                                                    </Link>
                                                    <p className="text-sm text-slate-900 dark:text-slate-100">
                                                        {bill.customer ? `${bill.customer.first_name} ${bill.customer.last_name}` : '—'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {bill.customer?.account_number || 'No account'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected(bill.id)}
                                                        onChange={() => toggleSelect(bill.id)}
                                                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4 grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Consumption</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {bill.consumption ? `${bill.consumption} m³` : '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Prev Balance</p>
                                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                                    {bill.prev_balance != null ? formatSSPCurrency(bill.prev_balance) : '—'}
                                                </p>
                                            </div>

                                            <div className="mb-4">
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
                                                <p className="text-slate-900 dark:text-slate-100">{formatSSPCurrency(bill.total_amount)}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <BillStatusBadge status={isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid'} size="sm" />
                                                <Button variant="ghost" size="sm" asChild className="flex-1">
                                                    <Link href={`/billing/${bill.id}`}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View
                                                    </Link>
                                                </Button>

                                                {bill.current_balance > 0 && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20"
                                                        onClick={() => handleBillPayment(bill)}
                                                    >
                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                        Pay
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })
                        ) : (
                            <div className="py-8 text-center">
                                <div className="mx-auto mb-4 w-fit rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                    <FileText className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">No bills found</h3>
                                <p className="mb-4 text-slate-500 dark:text-slate-400">Get started by creating your first bill</p>
                                <Button
                                    onClick={() => router.get('/billing/create')}
                                    className="gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                                >
                                    <Plus className="h-4 w-4" />
                                    Create Bill
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Modal */}
            <PaymentFormModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                defaultValues={paymentDefaults}
                onSubmit={submitPayment}
                methods={[
                    { value: 'cash', label: 'Cash', icon: DollarSign, color: 'bg-green-100 text-green-800' },
                    { value: 'mobile_money', label: 'Mobile Money', icon: CreditCard, color: 'bg-orange-100 text-orange-800' },
                    { value: 'bank_transfer', label: 'Bank Transfer', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
                ]}
            />
        </AppLayout>
    );
}
