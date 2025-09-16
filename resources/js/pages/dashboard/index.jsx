import MeterStatusChart from '@/components/charts/MeterStatusChart';
import RevenueChart from '@/components/charts/RevenueChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertTriangle,
    Building,
    CheckCircle,
    Clock,
    DollarSign,
    Droplets,
    FileText,
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
        recentActivity: [],
        monthlyRevenue: [],
        topCustomers: [],
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
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50 dark:bg-blue-950',
                },
                {
                    title: 'Active Customers',
                    value: data.activeCustomers || 0,
                    icon: Users,
                    description: 'Active customers',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50 dark:bg-green-950',
                },
                {
                    title: 'Inactive Customers',
                    value: (data.totalCustomers || 0) - (data.activeCustomers || 0),
                    icon: Users,
                    description: 'Inactive customers',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50 dark:bg-gray-950',
                },
                {
                    title: 'Service Areas',
                    value: data.totalAreas,
                    icon: Building,
                    description: 'Coverage areas',
                    color: 'text-indigo-600',
                    bgColor: 'bg-indigo-50 dark:bg-indigo-950',
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

    const getActivityIcon = (type) => {
        switch (type) {
            case 'customer_registered':
                return <Users className="h-4 w-4" />;
            case 'bill_generated':
                return <FileText className="h-4 w-4" />;
            case 'payment_received':
                return <DollarSign className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getActivityColor = (color) => {
        const colorMap = {
            green: 'bg-green-500',
            blue: 'bg-blue-500',
            purple: 'bg-purple-500',
            orange: 'bg-orange-500',
            red: 'bg-red-500',
        };
        return colorMap[color] || 'bg-gray-500';
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

                {/* Quick Actions - moved to top */}
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
                                className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${style.bg} ${style.border} border`}
                            >
                                {/* Horizontal Layout */}
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
                                                            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{card.value}</div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-300">{card.title}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">{card.description}</p>
                                                    </div>

                                                    {/* Mini progress bar */}
                                                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600">
                                                        <div
                                                            className={`h-full bg-gradient-to-r ${style.gradient} rounded-full transition-all duration-1000 group-hover/item:w-full`}
                                                            style={{ width: '60%' }}
                                                        ></div>
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
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Section (both charts) */}
                <div className="flex space-x-4">
                    <RevenueChart data={data.monthlyRevenue} />
                    <MeterStatusChart data={meterStatusData} />
                </div>

                {/* Activity and Top Customers */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest system activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.recentActivity && data.recentActivity.length > 0 ? (
                                    data.recentActivity.map((activity, index) => (
                                        <div key={index} className="flex items-center space-x-4">
                                            <div className={`h-2 w-2 ${getActivityColor(activity.color)} rounded-full`}></div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{activity.message}</p>
                                                <p className="text-muted-foreground text-xs">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-4 text-center">
                                        <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                        <p className="text-muted-foreground text-sm">No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Customers by Consumption</CardTitle>
                            <CardDescription>Customers with highest water consumption</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.topCustomers && data.topCustomers.length > 0 ? (
                                <div className="space-y-3">
                                    {data.topCustomers.map((customer, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="font-medium">{customer.name}</p>
                                                <p className="text-muted-foreground text-sm">{customer.account_number}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">{customer.consumption.toLocaleString()} m³</p>
                                                <p className="text-muted-foreground text-sm">Total consumption</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-4 text-center">
                                    <Users className="mx-auto mb-2 h-8 w-8 opacity-50" />
                                    <p className="text-muted-foreground text-sm">No customer data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
