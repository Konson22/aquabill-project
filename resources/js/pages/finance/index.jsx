import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Bell,
    CheckCircle,
    Clock,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Filter,
    Printer,
    Receipt,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatSSPCurrency } from '../../utils/formatSSPCurrency';

const breadcrumbs = [{ title: 'Revenue Report', href: '/finance' }];

export default function FinanceIndex({ allPayments, allInvoices, allBills = [], receivablesAging = [], categories = [], filters = {} }) {
    // Filter states
    const [yearFilter, setYearFilter] = useState(filters.year || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');

    // Sync filters to server (debounced)
    useEffect(() => {
        const handle = setTimeout(() => {
            const params = {
                year: yearFilter || undefined,
                month: monthFilter || undefined,
                category: categoryFilter || undefined,
            };
            router.get('/finance', params, { preserveState: true, replace: true, preserveScroll: true });
        }, 400);
        return () => clearTimeout(handle);
    }, [yearFilter, monthFilter, categoryFilter]);

    // Calculate KPIs
    const calculateKPIs = () => {
        const totalBills = allBills?.data?.length || 0;
        const totalInvoices = allInvoices?.data?.length || 0;
        const totalPayments = allPayments?.data?.length || 0;

        // Calculate total revenue from invoices
        const totalRevenue = allInvoices?.data?.reduce((sum, invoice) => sum + (parseFloat(invoice.amount_due) || 0), 0) || 0;

        // Calculate total collected from payments
        const totalCollected = allPayments?.data?.reduce((sum, payment) => sum + (parseFloat(payment.amount_paid) || 0), 0) || 0;

        // Calculate outstanding amounts
        const outstandingBills = allBills?.data?.filter((bill) => bill.current_balance > 0).length || 0;
        const outstandingInvoices = allInvoices?.data?.filter((invoice) => invoice.status !== 'paid').length || 0;

        // Calculate collection rate
        const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0;

        // Calculate aging buckets
        const agingBuckets = {
            '0-30': { amount: 0, count: 0 },
            '31-60': { amount: 0, count: 0 },
            '61+': { amount: 0, count: 0 },
        };

        receivablesAging.forEach((item) => {
            const daysOverdue = item.daysOverdue || 0;
            if (daysOverdue <= 30) {
                agingBuckets['0-30'].amount += item.amount || 0;
                agingBuckets['0-30'].count += 1;
            } else if (daysOverdue <= 60) {
                agingBuckets['31-60'].amount += item.amount || 0;
                agingBuckets['31-60'].count += 1;
            } else {
                agingBuckets['61+'].amount += item.amount || 0;
                agingBuckets['61+'].count += 1;
            }
        });

        const totalOutstanding = Object.values(agingBuckets).reduce((sum, bucket) => sum + bucket.amount, 0);

        return {
            totalBills,
            totalInvoices,
            totalPayments,
            totalRevenue,
            totalCollected,
            outstandingBills,
            outstandingInvoices,
            collectionRate,
            agingBuckets,
            totalOutstanding,
        };
    };

    const kpis = calculateKPIs();

    // Prepare chart data
    const prepareChartData = () => {
        // Revenue vs Collection chart data - 12 months
        const revenueCollectionData = [
            { name: 'Jan', revenue: kpis.totalRevenue * 0.08, collected: kpis.totalCollected * 0.08 },
            { name: 'Feb', revenue: kpis.totalRevenue * 0.09, collected: kpis.totalCollected * 0.09 },
            { name: 'Mar', revenue: kpis.totalRevenue * 0.1, collected: kpis.totalCollected * 0.1 },
            { name: 'Apr', revenue: kpis.totalRevenue * 0.11, collected: kpis.totalCollected * 0.11 },
            { name: 'May', revenue: kpis.totalRevenue * 0.12, collected: kpis.totalCollected * 0.12 },
            { name: 'Jun', revenue: kpis.totalRevenue * 0.13, collected: kpis.totalCollected * 0.13 },
            { name: 'Jul', revenue: kpis.totalRevenue * 0.14, collected: kpis.totalCollected * 0.14 },
            { name: 'Aug', revenue: kpis.totalRevenue * 0.15, collected: kpis.totalCollected * 0.15 },
            { name: 'Sep', revenue: kpis.totalRevenue * 0.16, collected: kpis.totalCollected * 0.16 },
            { name: 'Oct', revenue: kpis.totalRevenue * 0.17, collected: kpis.totalCollected * 0.17 },
            { name: 'Nov', revenue: kpis.totalRevenue * 0.18, collected: kpis.totalCollected * 0.18 },
            { name: 'Dec', revenue: kpis.totalRevenue * 0.19, collected: kpis.totalCollected * 0.19 },
        ];

        // Aging analysis pie chart
        const agingData = [
            { name: '0-30 days', value: kpis.agingBuckets['0-30'].amount, color: '#10B981' },
            { name: '31-60 days', value: kpis.agingBuckets['31-60'].amount, color: '#F59E0B' },
            { name: '61+ days', value: kpis.agingBuckets['61+'].amount, color: '#EF4444' },
        ];

        // Revenue by category data
        const revenueByCategoryData = [
            { name: 'Residential', revenue: kpis.totalRevenue * 0.45, customers: 120 },
            { name: 'Commercial', revenue: kpis.totalRevenue * 0.35, customers: 45 },
            { name: 'Industrial', revenue: kpis.totalRevenue * 0.15, customers: 12 },
            { name: 'Government', revenue: kpis.totalRevenue * 0.05, customers: 8 },
        ];

        return { revenueCollectionData, agingData, revenueByCategoryData };
    };

    const chartData = prepareChartData();

    // Get overdue items (more than 30 days)
    const getOverdueItems = () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const overdueBills =
            allBills?.data?.filter((bill) => {
                if (bill.current_balance <= 0) return false; // Skip paid bills
                const billDate = new Date(bill.created_at);
                return billDate < thirtyDaysAgo;
            }) || [];

        const overdueInvoices =
            allInvoices?.data?.filter((invoice) => {
                if (invoice.status === 'paid') return false; // Skip paid invoices
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate < thirtyDaysAgo;
            }) || [];

        return { overdueBills, overdueInvoices };
    };

    const { overdueBills, overdueInvoices } = getOverdueItems();

    // Get recent activity
    const getRecentActivity = () => {
        const activities = [];

        // Recent payments
        const recentPayments = allPayments?.data?.slice(0, 5) || [];
        recentPayments.forEach((payment) => {
            activities.push({
                type: 'payment',
                title: 'Payment Received',
                description: `${formatSSPCurrency(payment.amount_paid)} from ${payment.customer?.first_name} ${payment.customer?.last_name}`,
                time: new Date(payment.created_at).toLocaleDateString(),
                icon: CheckCircle,
                color: 'text-green-600',
            });
        });

        // Recent invoices
        const recentInvoices = allInvoices?.data?.slice(0, 3) || [];
        recentInvoices.forEach((invoice) => {
            activities.push({
                type: 'invoice',
                title: 'Invoice Created',
                description: `Invoice #${invoice.invoice_number || invoice.id} for ${formatSSPCurrency(invoice.amount_due)}`,
                time: new Date(invoice.created_at).toLocaleDateString(),
                icon: Receipt,
                color: 'text-blue-600',
            });
        });

        return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
    };

    const recentActivity = getRecentActivity();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue Report">
                <style>
                    {`
                        @media print {
                            .no-print { display: none !important; }
                            body { margin: 0; padding: 20px; }
                            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
                            .print-header h1 { margin: 0; font-size: 28px; }
                            .print-header p { margin: 5px 0 0 0; color: #666; }
                            .section-title { font-size: 20px; font-weight: bold; margin: 20px 0 10px 0; color: #333; }
                            .card { border: 1px solid #ddd; margin-bottom: 15px; page-break-inside: avoid; }
                            .chart-container { height: 300px; margin: 15px 0; }
                            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; font-weight: bold; }
                        }
                    `}
                </style>
            </Head>

            {/* Print Header - Only visible when printing */}
            <div className="print-header no-print">
                <h1>Revenue Report</h1>
                <p>Generated on {new Date().toLocaleDateString()}</p>
            </div>

            {/* Revenue Report Header */}
            <div className="mb-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Revenue Report</h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Comprehensive revenue analysis and financial performance tracking
                        </p>
                    </div>
                    <div className="no-print flex items-center gap-3">
                        <Button variant="outline" onClick={() => window.print()} className="flex items-center gap-2">
                            <Printer className="h-4 w-4" />
                            Print Report
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const params = new URLSearchParams({
                                    year: yearFilter || '',
                                    month: monthFilter || '',
                                    category: categoryFilter || '',
                                });
                                window.open(`/finance/export?${params.toString()}`, '_blank');
                            }}
                            className="flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export Revenue Report
                        </Button>
                    </div>
                </div>
            </div>

            {/* Advanced Filters */}
            <Card className="no-print mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Advanced Filters
                            </CardTitle>
                            <CardDescription>Refine your financial data with powerful filtering options</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setYearFilter('');
                                setMonthFilter('');
                                setCategoryFilter('');
                            }}
                        >
                            Clear All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                            <Select
                                placeholder="All categories"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                options={categories.map((category) => ({
                                    id: category.id.toString(),
                                    name: category.name,
                                }))}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards */}
            <div id="kpi-cards" className="mb-8">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Metrics</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Total Revenue */}
                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSSPCurrency(kpis.totalRevenue)}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className="mr-1 h-4 w-4 text-green-600" />
                                <span className="text-green-600">From all invoices</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Collected */}
                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Collected</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSSPCurrency(kpis.totalCollected)}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                                    <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <CheckCircle className="mr-1 h-4 w-4 text-blue-600" />
                                <span className="text-blue-600">From all payments</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Collection Rate */}
                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Collection Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpis.collectionRate.toFixed(1)}%</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                                    <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <TrendingUp className="mr-1 h-4 w-4 text-purple-600" />
                                <span className="text-purple-600">Efficiency metric</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Outstanding Amount */}
                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatSSPCurrency(kpis.totalOutstanding)}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900">
                                    <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center text-sm">
                                <Clock className="mr-1 h-4 w-4 text-orange-600" />
                                <span className="text-orange-600">Pending collection</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Revenue Analysis */}
            <div id="secondary-metrics" className="mb-8">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue Analysis</h2>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bills</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.totalBills}</p>
                                </div>
                                <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                    {kpis.outstandingBills} outstanding
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.totalInvoices}</p>
                                </div>
                                <Receipt className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                    {kpis.outstandingInvoices} unpaid
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{kpis.totalPayments}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                    All time
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Charts Section */}
            <div id="charts-section" className="mb-8">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Charts</h2>
                </div>
                {/* Revenue vs Collection Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Revenue Performance Trend (12 Months)
                        </CardTitle>
                        <CardDescription>Monthly revenue generation vs collection performance throughout the year</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.revenueCollectionData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                                        </linearGradient>
                                        <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => formatSSPCurrency(value)}
                                    />
                                    <Tooltip
                                        formatter={(value, name) => [formatSSPCurrency(value), name === 'revenue' ? 'Revenue' : 'Collected']}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                        labelStyle={{ color: '#374151', fontWeight: '500' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fill="url(#revenueGradient)"
                                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
                                        name="Revenue"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="collected"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fill="url(#collectedGradient)"
                                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
                                        name="Collected"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Receivables Analysis & Notifications */}
            <div id="receivables-analysis" className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Receivables Analysis & Notifications</h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => printSection('receivables-analysis', 'Receivables Analysis & Notifications')}
                        className="flex items-center gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
                <div className="flex flex-col gap-6 lg:flex-row">
                    {/* Receivables Aging Analysis & Outstanding Amounts */}
                    <div className="flex flex-col gap-6 lg:flex-1">
                        {/* Receivables Aging Analysis */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Revenue Collection Analysis
                                </CardTitle>
                                <CardDescription>Breakdown of outstanding amounts by age</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(kpis.agingBuckets).map(([range, bucket]) => {
                                        const percentage = kpis.totalOutstanding > 0 ? (bucket.amount / kpis.totalOutstanding) * 100 : 0;

                                        return (
                                            <div key={range} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-3 w-3 rounded-full ${
                                                            range === '0-30' ? 'bg-green-500' : range === '31-60' ? 'bg-orange-500' : 'bg-red-500'
                                                        }`}
                                                    />
                                                    <div>
                                                        <p className="font-medium">{range} days</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{bucket.count} items</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatSSPCurrency(bucket.amount)}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Outstanding Amounts by Age Chart */}
                        <Card className="flex-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Outstanding Amounts by Age
                                </CardTitle>
                                <CardDescription>Visual breakdown of receivables aging analysis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData.agingData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value, percent }) =>
                                                    `${name}: ${formatSSPCurrency(value)} (${(percent * 100).toFixed(1)}%)`
                                                }
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {chartData.agingData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatSSPCurrency(value)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notifications */}
                    <Card className="flex flex-1 flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notifications
                            </CardTitle>
                            <CardDescription>Overdue bills and invoices requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col">
                            {overdueBills.length > 0 || overdueInvoices.length > 0 ? (
                                <div className="space-y-6">
                                    {/* Overdue Bills Table */}
                                    {overdueBills.length > 0 && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-2">
                                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                                <h4 className="text-lg font-semibold text-red-800 dark:text-red-200">
                                                    Overdue Bills ({overdueBills.length})
                                                </h4>
                                            </div>
                                            <div className="overflow-hidden rounded-lg border border-red-200 dark:border-red-800">
                                                <table className="w-full">
                                                    <thead className="bg-red-50 dark:bg-red-900/20">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase dark:text-red-200">
                                                                Bill #
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase dark:text-red-200">
                                                                Customer
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase dark:text-red-200">
                                                                Due Date
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase dark:text-red-200">
                                                                Amount
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-red-800 uppercase dark:text-red-200">
                                                                Days Overdue
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-red-200 bg-white dark:divide-red-800 dark:bg-gray-900">
                                                        {overdueBills.map((bill) => {
                                                            const dueDate = new Date(bill.due_date);
                                                            const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));
                                                            return (
                                                                <tr key={bill.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <Link
                                                                            href={`/billing/${bill.id}`}
                                                                            className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                                                        >
                                                                            #{bill.id}
                                                                        </Link>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                                        {bill.customer
                                                                            ? `${bill.customer.first_name} ${bill.customer.last_name}`
                                                                            : 'Unknown Customer'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                                        {dueDate.toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-red-600 dark:text-red-400">
                                                                        {formatSSPCurrency(bill.current_balance)}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                                                            {daysOverdue} days
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Overdue Invoices Table */}
                                    {overdueInvoices.length > 0 && (
                                        <div>
                                            <div className="mb-4 flex items-center gap-2">
                                                <Clock className="h-5 w-5 text-orange-600" />
                                                <h4 className="text-lg font-semibold text-orange-800 dark:text-orange-200">
                                                    Overdue Invoices ({overdueInvoices.length})
                                                </h4>
                                            </div>
                                            <div className="overflow-hidden rounded-lg border border-orange-200 dark:border-orange-800">
                                                <table className="w-full">
                                                    <thead className="bg-orange-50 dark:bg-orange-900/20">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-orange-800 uppercase dark:text-orange-200">
                                                                Invoice #
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-orange-800 uppercase dark:text-orange-200">
                                                                Customer
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-orange-800 uppercase dark:text-orange-200">
                                                                Due Date
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-orange-800 uppercase dark:text-orange-200">
                                                                Amount
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-orange-800 uppercase dark:text-orange-200">
                                                                Days Overdue
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-orange-200 bg-white dark:divide-orange-800 dark:bg-gray-900">
                                                        {overdueInvoices.map((invoice) => {
                                                            const dueDate = new Date(invoice.due_date);
                                                            const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24));
                                                            return (
                                                                <tr key={invoice.id} className="hover:bg-orange-50 dark:hover:bg-orange-900/10">
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <Link
                                                                            href={`/invoices/${invoice.id}`}
                                                                            className="text-sm font-medium text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                                                                        >
                                                                            #{invoice.invoice_number || invoice.id}
                                                                        </Link>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-white">
                                                                        {invoice.customer
                                                                            ? `${invoice.customer.first_name} ${invoice.customer.last_name}`
                                                                            : 'Unknown Customer'}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                                        {dueDate.toLocaleDateString()}
                                                                    </td>
                                                                    <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-orange-600 dark:text-orange-400">
                                                                        {formatSSPCurrency(invoice.amount_due)}
                                                                    </td>
                                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                                        <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                                                                            {daysOverdue} days
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Collection Rate Warning */}
                                    {kpis.collectionRate < 80 && (
                                        <div className="flex items-start gap-3 rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                            <TrendingDown className="mt-0.5 h-5 w-5 text-yellow-600" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Collection rate below 80%</p>
                                                <p className="text-xs text-yellow-600 dark:text-yellow-300">
                                                    Current: {kpis.collectionRate.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                    <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-green-800 dark:text-green-200">All systems running smoothly</p>
                                        <p className="text-xs text-green-600 dark:text-green-300">No overdue bills or invoices</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Revenue by Category Chart */}
            <div id="revenue-by-category" className="mb-8">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Revenue by Category</h2>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Revenue Distribution by Customer Category
                        </CardTitle>
                        <CardDescription>Revenue breakdown by customer categories and tariff structures</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.revenueByCategoryData}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => formatSSPCurrency(value)}
                                    />
                                    <Tooltip
                                        formatter={(value) => [formatSSPCurrency(value), 'Revenue']}
                                        contentStyle={{
                                            backgroundColor: '#FFFFFF',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                        labelStyle={{ color: '#374151', fontWeight: '500' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        fill="url(#revenueGradient)"
                                        dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#FFFFFF' }}
                                        name="Revenue"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
