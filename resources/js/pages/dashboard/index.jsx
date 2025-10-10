import MeterStatusChart from '@/components/charts/MeterStatusChart';
import RevenueChart from '@/components/charts/RevenueChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    BarChart3,
    Bell,
    Building,
    CheckCircle,
    Clock,
    DollarSign,
    Droplets,
    FileText,
    RefreshCw,
    Settings,
    TrendingUp,
    Users,
    Wrench,
    XCircle,
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/',
    },
];

export default function Dashboard({ stats }) {
    const page = usePage();
    const { auth } = page.props;
    const userDepartment = auth.user?.department?.name;

    // Default stats if not provided
    const defaultStats = {
        totalCustomers: 0,
        activeCustomers: 0,
        activeMeters: 0,
        totalBills: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        overdueBills: 0,
        monthlyConsumption: 0,
        totalAreas: 0,
        overdueReadings: [],
        monthlyRevenue: [],
        meterStatus: [],
        outstandingAmount: 0,
        thisMonthBills: 0,
        thisMonthRevenue: 0,
        thisMonthReadings: 0,
    };

    const data = stats || defaultStats;

    // Normalize meter status data for MeterStatusChart
    const meterStatusData = (data.meterStatus || []).map((item) => {
        if (item.name !== undefined && item.value !== undefined) {
            return item;
        }
        const status = item.status || item.name || 'Unknown';
        const count = item.count ?? item.value ?? 0;
        const colorMap = {
            Active: '#10B981',
            Inactive: '#6B7280',
            Faulty: '#EF4444',
            Maintenance: '#F59E0B',
        };
        return {
            name: status,
            value: count,
            color: colorMap[status] || '#3B82F6',
        };
    });

    // Get individual meter status counts
    const getMeterStatusCount = (status) => {
        const statusItem = data.meterStatus?.find((item) => (item.status || item.name || '').toLowerCase() === status.toLowerCase());
        return statusItem ? (statusItem.count ?? statusItem.value ?? 0) : 0;
    };

    const meterStatusCounts = {
        active: getMeterStatusCount('Active'),
        inactive: getMeterStatusCount('Inactive'),
        faulty: getMeterStatusCount('Faulty'),
        maintenance: getMeterStatusCount('Maintenance'),
    };

    // Categorized metric cards
    const cardCategories = {
        customers: {
            title: 'Customers & Operations',
            cards: [
                {
                    title: 'Total Customers',
                    value: data.totalCustomers,
                    icon: Users,
                    description: 'Registered customers',
                    color: 'text-emerald-600',
                    bgColor: 'bg-emerald-50 dark:bg-emerald-950',
                    trend: '+12%',
                    trendColor: 'text-emerald-600',
                },
                {
                    title: 'Active Customers',
                    value: data.activeCustomers || 0,
                    icon: CheckCircle,
                    description: 'Currently active',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 dark:bg-green-950',
                    trend: '+8%',
                    trendColor: 'text-green-600',
                },
                {
                    title: 'Inactive Customers',
                    value: (data.totalCustomers || 0) - (data.activeCustomers || 0),
                    icon: Clock,
                    description: 'Suspended accounts',
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50 dark:bg-amber-950',
                    trend: '-3%',
                    trendColor: 'text-amber-600',
                },
                {
                    title: 'Service Areas',
                    value: data.totalAreas,
                    icon: Building,
                    description: 'Coverage zones',
                    color: 'text-teal-600',
                    bgColor: 'bg-teal-50 dark:bg-teal-950',
                    trend: '+2',
                    trendColor: 'text-teal-600',
                },
            ],
        },
        meters: {
            title: 'Meters',
            cards: [
                {
                    title: 'Active Meters',
                    value: meterStatusCounts.active,
                    icon: CheckCircle,
                    description: 'Functional meters',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 dark:bg-green-950',
                },
                {
                    title: 'Inactive Meters',
                    value: meterStatusCounts.inactive,
                    icon: XCircle,
                    description: 'Inactive meters',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 dark:bg-gray-950',
                },
                {
                    title: 'Faulty Meters',
                    value: meterStatusCounts.faulty,
                    icon: AlertTriangle,
                    description: 'Faulty meters',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 dark:bg-red-950',
                },
                {
                    title: 'Maintenance',
                    value: meterStatusCounts.maintenance,
                    icon: Wrench,
                    description: 'Under maintenance',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 dark:bg-orange-950',
                },
            ],
        },
        billing: {
            title: 'Billing',
            cards: [
                {
                    title: 'Total Bills',
                    value: data.totalBills,
                    icon: FileText,
                    description: 'Generated bills',
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-50 dark:bg-purple-950',
                },
                {
                    title: 'Bills (This Month)',
                    value: data.thisMonthBills,
                    icon: FileText,
                    description: 'Generated this month',
                    color: 'text-purple-700',
                    bgColor: 'bg-purple-50 dark:bg-purple-950',
                },
                {
                    title: 'Pending Payments',
                    value: data.pendingPayments,
                    icon: AlertTriangle,
                    description: 'Awaiting payment',
                    color: 'text-orange-600',
                    bgColor: 'bg-orange-50 dark:bg-orange-950',
                },
                {
                    title: 'Overdue Bills',
                    value: data.overdueBills,
                    icon: TrendingUp,
                    description: 'Past due',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50 dark:bg-red-950',
                },
            ],
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Enhanced Header Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white shadow-2xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-20">
                        <div
                            className="h-full w-full"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundRepeat: 'repeat',
                            }}
                        />
                    </div>

                    {/* Header Content */}
                    <div className="relative z-10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                                        <Activity className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                                        <p className="text-blue-100">Welcome to AquaBill - Water Billing Management System</p>
                                    </div>
                                </div>

                                {/* Quick Stats Row */}
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="rounded-full bg-green-500 p-1">
                                            <CheckCircle className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">System Operational</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="rounded-full bg-yellow-500 p-1">
                                            <Clock className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-sm font-medium">Last Updated: {new Date().toLocaleTimeString()}</span>
                                    </div>
                                    {userDepartment && (
                                        <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                            {userDepartment} Department
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-3">
                                <Button variant="secondary" size="sm" className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Refresh
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notifications
                                </Button>
                            </div>
                        </div>

                        {/* Key Metrics Preview */}
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100">Total Customers</p>
                                        <p className="text-2xl font-bold">{data.totalCustomers}</p>
                                    </div>
                                    <Users className="h-8 w-8 text-blue-200" />
                                </div>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100">Active Meters</p>
                                        <p className="text-2xl font-bold">{data.activeMeters}</p>
                                    </div>
                                    <Droplets className="h-8 w-8 text-blue-200" />
                                </div>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100">This Month Revenue</p>
                                        <p className="text-2xl font-bold">${data.thisMonthRevenue?.toLocaleString() || '0'}</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-blue-200" />
                                </div>
                            </div>
                            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-100">Pending Bills</p>
                                        <p className="text-2xl font-bold">{data.pendingPayments}</p>
                                    </div>
                                    <FileText className="h-8 w-8 text-blue-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Actions - Hidden from Billing and Finance departments */}
                {userDepartment !== 'Billing' && userDepartment !== 'Finance' && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center space-x-2">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <span>Quick Actions</span>
                                    </CardTitle>
                                    <CardDescription>Common tasks and shortcuts for efficient workflow</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                    {userDepartment} Access
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Link
                                    href="/customers/create"
                                    className="group relative overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-blue-800 dark:from-blue-950 dark:to-indigo-950"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="mb-3 w-fit rounded-lg bg-blue-500 p-2">
                                            <Users className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Add Customer</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Register new customer</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/billing"
                                    className="group relative overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-green-800 dark:from-green-950 dark:to-emerald-950"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="mb-3 w-fit rounded-lg bg-green-500 p-2">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Bills</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Manage billing</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/payments"
                                    className="group relative overflow-hidden rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-purple-800 dark:from-purple-950 dark:to-pink-950"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="mb-3 w-fit rounded-lg bg-purple-500 p-2">
                                            <DollarSign className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Payments</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Process payments</p>
                                    </div>
                                </Link>
                                <Link
                                    href="/invoices"
                                    className="group relative overflow-hidden rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg dark:border-orange-800 dark:from-orange-950 dark:to-amber-950"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10 opacity-0 transition-opacity group-hover:opacity-100" />
                                    <div className="relative z-10">
                                        <div className="mb-3 w-fit rounded-lg bg-orange-500 p-2">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">Invoices</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">View invoices</p>
                                    </div>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Categorized Metrics - Horizontal Layout */}
                <div className="space-y-4">
                    {Object.entries(cardCategories).map(([categoryKey, category]) => {
                        // Define category-specific styling
                        const categoryStyles = {
                            customers: {
                                bg: 'bg-white dark:bg-slate-800',
                                border: 'border-blue-200 dark:border-blue-700',
                                headerBg: 'bg-blue-50 dark:bg-blue-900/20',
                                titleColor: 'text-blue-700 dark:text-blue-300',
                                accentColor: 'text-blue-600 dark:text-blue-400',
                                iconBg: 'bg-blue-100 dark:bg-blue-800/30',
                                iconColor: 'text-blue-600 dark:text-blue-400',
                                gradient: 'from-blue-500 to-blue-600',
                            },
                            meters: {
                                bg: 'bg-white dark:bg-slate-800',
                                border: 'border-green-200 dark:border-green-700',
                                headerBg: 'bg-green-50 dark:bg-green-900/20',
                                titleColor: 'text-green-700 dark:text-green-300',
                                accentColor: 'text-green-600 dark:text-green-400',
                                iconBg: 'bg-green-100 dark:bg-green-800/30',
                                iconColor: 'text-green-600 dark:text-green-400',
                                gradient: 'from-green-500 to-green-600',
                            },
                            billing: {
                                bg: 'bg-white dark:bg-slate-800',
                                border: 'border-purple-200 dark:border-purple-700',
                                headerBg: 'bg-purple-50 dark:bg-purple-900/20',
                                titleColor: 'text-purple-700 dark:text-purple-300',
                                accentColor: 'text-purple-600 dark:text-purple-400',
                                iconBg: 'bg-purple-100 dark:bg-purple-800/30',
                                iconColor: 'text-purple-600 dark:text-purple-400',
                                gradient: 'from-purple-500 to-purple-600',
                            },
                        };

                        const style = categoryStyles[categoryKey] || {
                            bg: 'bg-white dark:bg-slate-800',
                            border: 'border-slate-200 dark:border-slate-700',
                            headerBg: 'bg-slate-50 dark:bg-slate-900/20',
                            titleColor: 'text-slate-700 dark:text-slate-300',
                            accentColor: 'text-slate-600 dark:text-slate-400',
                            iconBg: 'bg-slate-100 dark:bg-slate-800/30',
                            iconColor: 'text-slate-600 dark:text-slate-400',
                            gradient: 'from-slate-500 to-slate-600',
                        };

                        return (
                            <Card
                                key={categoryKey}
                                className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${style.bg} ${style.border} border`}
                            >
                                {/* Enhanced Header Section for Customers & Operations */}
                                {['customers', 'meters', 'billing'].includes(categoryKey) ? (
                                    <div className="relative">
                                        {/* Gradient Background */}
                                        <div
                                            className={`absolute inset-0 ${
                                                categoryKey === 'customers'
                                                    ? 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950'
                                                    : categoryKey === 'meters'
                                                      ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950'
                                                      : 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-950 dark:via-pink-950 dark:to-rose-950'
                                            }`}
                                        />

                                        {/* Header Content */}
                                        <div className="relative p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative">
                                                        <div
                                                            className={`rounded-2xl p-3 shadow-lg ${
                                                                categoryKey === 'customers'
                                                                    ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                                                                    : categoryKey === 'meters'
                                                                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                                                      : 'bg-gradient-to-br from-purple-500 to-pink-600'
                                                            }`}
                                                        >
                                                            {categoryKey === 'customers' && <Users className="h-6 w-6 text-white" />}
                                                            {categoryKey === 'meters' && <Droplets className="h-6 w-6 text-white" />}
                                                            {categoryKey === 'billing' && <FileText className="h-6 w-6 text-white" />}
                                                        </div>
                                                        <div
                                                            className={`absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full border-2 border-white ${
                                                                categoryKey === 'customers'
                                                                    ? 'bg-green-400'
                                                                    : categoryKey === 'meters'
                                                                      ? 'bg-blue-400'
                                                                      : 'bg-purple-400'
                                                            }`}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{category.title}</h3>
                                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                                            {category.cards.length} key metrics
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Total Summary */}
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                                                        {category.cards
                                                            .reduce((sum, card) => {
                                                                const value =
                                                                    typeof card.value === 'string'
                                                                        ? parseFloat(card.value.replace(/[^\d.-]/g, '')) || 0
                                                                        : card.value || 0;
                                                                return sum + value;
                                                            }, 0)
                                                            .toLocaleString()}
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {categoryKey === 'customers'
                                                            ? 'Total Operations'
                                                            : categoryKey === 'meters'
                                                              ? 'Total Meters'
                                                              : 'Total Bills'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Enhanced Metrics Grid */}
                                        <div className="p-6 pt-0">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                {category.cards.map((card, index) => (
                                                    <div
                                                        key={index}
                                                        className={`group/item relative overflow-hidden rounded-xl border border-slate-200/50 bg-white/80 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-slate-300 hover:shadow-xl dark:border-slate-600/50 dark:bg-slate-800/80 dark:hover:border-slate-500`}
                                                    >
                                                        {/* Card Header */}
                                                        <div className="mb-3 flex items-center justify-between">
                                                            <div
                                                                className={`rounded-xl p-2.5 ${card.bgColor} shadow-sm transition-transform duration-200 group-hover/item:scale-110`}
                                                            >
                                                                <card.icon className={`h-5 w-5 ${card.color}`} />
                                                            </div>
                                                            {card.trend && (
                                                                <div
                                                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${card.trendColor} bg-opacity-10 ${card.trendColor.replace('text-', 'bg-')}`}
                                                                >
                                                                    {card.trend}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Card Content */}
                                                        <div className="space-y-2">
                                                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                                                {card.value?.toLocaleString() || '0'}
                                                            </div>
                                                            <div>
                                                                <h4 className="mb-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                                    {card.title}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
                                                            </div>
                                                        </div>

                                                        {/* Hover Effect Overlay */}
                                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-transparent to-slate-100/20 opacity-0 transition-opacity duration-300 group-hover/item:opacity-100 dark:to-slate-700/20" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Original Layout for Other Categories */
                                    <div className="flex items-center">
                                        {/* Header Section */}
                                        <div className={`w-1/4 p-4 ${style.headerBg} border-r ${style.border}`}>
                                            <div className="mb-2 flex items-center space-x-3">
                                                <div className={`rounded-lg p-2 ${style.iconBg}`}>
                                                    {categoryKey === 'customers' && <Users className={`h-5 w-5 ${style.iconColor}`} />}
                                                    {categoryKey === 'meters' && <Droplets className={`h-5 w-5 ${style.iconColor}`} />}
                                                    {categoryKey === 'billing' && <FileText className={`h-5 w-5 ${style.iconColor}`} />}
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${style.titleColor}`}>{category.title}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{category.cards.length} metrics</p>
                                                </div>
                                            </div>
                                            <div className={`text-2xl font-bold ${style.titleColor}`}>
                                                {category.cards
                                                    .reduce((sum, card) => {
                                                        const value =
                                                            typeof card.value === 'string'
                                                                ? parseFloat(card.value.replace(/[^\d.-]/g, '')) || 0
                                                                : card.value || 0;
                                                        return sum + value;
                                                    }, 0)
                                                    .toLocaleString()}
                                            </div>
                                        </div>

                                        {/* Metrics Section */}
                                        <div className="flex-1 p-4">
                                            <div className="flex space-x-4">
                                                {category.cards.map((card, index) => (
                                                    <div
                                                        key={index}
                                                        className={`group/item relative flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:scale-105 hover:shadow-md dark:border-slate-600 dark:bg-slate-700/50`}
                                                    >
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <div
                                                                className={`rounded-md p-1.5 ${card.bgColor} transition-all duration-200 group-hover/item:scale-110`}
                                                            >
                                                                <card.icon className={`h-4 w-4 ${card.color}`} />
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                                    {card.value}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                                {card.title}
                                                            </h4>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Footer Section */}
                                        <div className="w-32 border-l border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                            <div className="text-center">
                                                <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">Updated</div>
                                                <div className="mb-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                                                    {new Date().toLocaleTimeString()}
                                                </div>
                                                <div className="flex items-center justify-center space-x-1">
                                                    <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></div>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">Live</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Section (both charts) */}
                <div className="flex space-x-4">
                    <RevenueChart data={data.monthlyRevenue} />
                    <MeterStatusChart data={meterStatusData} />
                </div>

                {/* Overdue Readings - Full Width */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Overdue Readings
                        </CardTitle>
                        <CardDescription>Customers with no readings for more than 1 month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.overdueReadings && data.overdueReadings.length > 0 ? (
                                data.overdueReadings.map((customer, index) => (
                                    <div
                                        key={customer.id || index}
                                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-base font-medium text-slate-900 dark:text-slate-100">{customer.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                                    {customer.account_number} • {customer.neighborhood}
                                                </p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Meter: {customer.meter_serial}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-semibold text-orange-600">
                                                {customer.days_since_reading === 'Never' ? 'Never' : `${customer.days_since_reading} days`}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                Last reading: {customer.last_reading_date}
                                            </div>
                                            <div className="text-xs text-slate-400 dark:text-slate-500">
                                                {customer.days_since_reading === 'Never'
                                                    ? 'No readings recorded'
                                                    : `Overdue by ${customer.days_since_reading} days`}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500 opacity-50" />
                                    <p className="text-muted-foreground text-lg">All customers are up to date</p>
                                    <p className="text-muted-foreground mt-1 text-sm">No overdue readings found</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
