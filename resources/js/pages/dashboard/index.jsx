import MeterStatusChart from '@/components/charts/MeterStatusChart';
import RevenueChart from '@/components/charts/RevenueChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Building, CheckCircle, Clock, DollarSign, Droplets, FileText, TrendingUp, Users, Wrench, XCircle } from 'lucide-react';

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
                {/* Welcome Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome to AquaBill - Water Billing Management System</p>
                </div>

                {/* Quick Actions - moved to top - Hidden from Billing and Finance departments */}
                {userDepartment !== 'Billing' && userDepartment !== 'Finance' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks and shortcuts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Link
                                    href="/customers/create"
                                    className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <Users className="h-5 w-5" />
                                    <span>Add Customer</span>
                                </Link>
                                <Link
                                    href="/billing"
                                    className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <FileText className="h-5 w-5" />
                                    <span>Bills</span>
                                </Link>
                                <Link
                                    href="/payments"
                                    className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <DollarSign className="h-5 w-5" />
                                    <span>Payments</span>
                                </Link>
                                <Link
                                    href="/invoices"
                                    className="flex items-center space-x-2 rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <DollarSign className="h-5 w-5" />
                                    <span>Invoices</span>
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
