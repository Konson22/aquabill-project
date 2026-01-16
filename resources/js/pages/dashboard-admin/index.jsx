import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    Banknote,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    Droplets,
    FileText,
    Gauge,
    Users,
    Zap,
} from 'lucide-react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Helper component for Stat Cards
function StatCard({
    title,
    value,
    subtext,
    icon: Icon,
    trend,
    trendType = 'neutral', // neutral, positive, negative
    className,
    gradient,
    solidBgColor,
}) {
    return (
        <Card
            className={cn(
                'relative overflow-hidden border-none shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg',
                className,
                // Apply solid background color or fallback to default card color
                solidBgColor ? solidBgColor : 'bg-card',
            )}
        >
            <div className={cn('absolute inset-0 opacity-[0.03]', gradient)} />
            <CardContent className="relative z-10 p-4">
                <div className="mb-2 flex items-start justify-between">
                    <div
                        className={cn(
                            'rounded-lg border bg-background/20 p-1.5 shadow-sm backdrop-blur-sm',
                        )}
                    >
                        <Icon className="h-4 w-4 text-foreground/80" />
                    </div>
                    {trend && (
                        <div
                            className={cn(
                                'flex items-center gap-1 rounded-full bg-background/30 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm',
                                trendType === 'positive' &&
                                    'text-emerald-700 dark:text-emerald-300',
                                trendType === 'negative' &&
                                    'text-rose-700 dark:text-rose-300',
                                trendType === 'neutral' &&
                                    'text-slate-600 dark:text-slate-300',
                            )}
                        >
                            {trend}
                        </div>
                    )}
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-medium text-muted-foreground">
                        {title}
                    </p>
                    <h3 className="text-xl font-bold tracking-tight">
                        {value}
                    </h3>
                    {subtext && (
                        <p className="text-[10px] text-muted-foreground/80">
                            {subtext}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

// Helper for Report Quick Links
function ReportLink({
    title,
    description,
    href,
    icon: Icon,
    solidBgClass,
    iconBgClass,
}) {
    return (
        <Link href={href} className="group block h-full">
            <Card
                className={cn(
                    'relative h-full overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-lg',
                    solidBgClass,
                )}
            >
                <CardContent className="relative z-10 flex h-full items-start gap-3 p-4">
                    <div
                        className={cn(
                            'rounded-xl p-2.5 shadow-sm transition-colors duration-300',
                            iconBgClass,
                        )}
                    >
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-0.5 text-white">
                        <div className="flex items-center gap-2 transition-all duration-300 group-hover:gap-3">
                            <h3 className="text-sm font-semibold">{title}</h3>
                            <ArrowRight className="h-3 w-3 -translate-x-2 text-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                        </div>
                        <p className="text-xs leading-relaxed text-white/80">
                            {description}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function Dashboard({ stats, chartData, usageByCategory }) {
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Admin Overview', href: '#' },
    ];

    // Calculate totals for simpler display
    const totalTransactions = stats.totalBills + stats.totalInvoices;
    const paidTransactions = stats.paidBills + stats.paidInvoices;
    const unpaidTransactions = stats.unpaidBills + stats.unpaidInvoices;
    const overdueTotal = stats.overdueBillsCount + stats.overdueInvoices;

    // Calculate percentages for meter status
    const activeMeterPercent =
        Math.round((stats.activeMeters / stats.totalMeters) * 100) || 0;

    // Formatting currency wrapper (assuming generic currency, adjust as needed)
    const formatNumber = (num) => num?.toLocaleString() || '0';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-[1600px] animate-in space-y-5 p-4 duration-500 fade-in slide-in-from-bottom-4">
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-foreground text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Overview of system performance, financials, and
                            operations.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date().toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>

                {/* Quick Reports Grid */}
                <div>
                    <h2 className="mb-2 px-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <ReportLink
                            title="Payment Reports"
                            description="Settlement trends & revenue analytics."
                            href={route('payments.report')}
                            icon={Banknote}
                            solidBgClass="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 transition-colors"
                            iconBgClass="bg-white/20"
                        />
                        <ReportLink
                            title="Meter Reports"
                            description="Consumption, zones & device health."
                            href={route('meter-readings.report')}
                            icon={Gauge}
                            solidBgClass="bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 transition-colors"
                            iconBgClass="bg-white/20"
                        />
                        <ReportLink
                            title="Billing Reports"
                            description="Invoices, billing cycles & collections."
                            href={route('bills.report')}
                            icon={FileText}
                            solidBgClass="bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 transition-colors"
                            iconBgClass="bg-white/20"
                        />
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid gap-6">
                    {/* Financial Performance */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                <Banknote className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">
                                Financial Performance
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Transactions"
                                value={formatNumber(totalTransactions)}
                                subtext="Bills & Invoices generated"
                                icon={Activity}
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-blue-500"
                            />
                            <StatCard
                                title="Collections"
                                value={formatNumber(paidTransactions)}
                                subtext="Successfully collected"
                                icon={CheckCircle2}
                                trend={`${Math.round((paidTransactions / totalTransactions) * 100) || 0}% rate`}
                                trendType="positive"
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-emerald-500"
                            />
                            <StatCard
                                title="Pending Payments"
                                value={formatNumber(unpaidTransactions)}
                                subtext="Awaiting settlement"
                                icon={Clock}
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-amber-500"
                            />
                            <StatCard
                                title="Overdue Accounts"
                                value={formatNumber(overdueTotal)}
                                subtext="Requires attention"
                                icon={AlertCircle}
                                trend="Critical"
                                trendType="negative"
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-destructive"
                            />
                        </div>
                    </div>

                    {/* Operational Metrics */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                <Gauge className="h-3.5 w-3.5" />
                            </div>
                            <h2 className="text-sm font-bold tracking-tight text-foreground/80 uppercase">
                                Operational Metrics
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Total Customers"
                                value={formatNumber(stats.totalCustomers)}
                                subtext="Registered accounts"
                                icon={Users}
                                trend={`${stats.customersTrend > 0 ? '+' : ''}${stats.customersTrend}%`}
                                trendType={
                                    stats.customersTrend >= 0
                                        ? 'positive'
                                        : 'negative'
                                }
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-indigo-500"
                            />
                            <StatCard
                                title="Active Meters"
                                value={formatNumber(stats.activeMeters)}
                                subtext={`Out of ${formatNumber(stats.totalMeters)} total units`}
                                icon={Zap}
                                trend={`${activeMeterPercent}% active`}
                                trendType="neutral"
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-cyan-500"
                            />
                            <StatCard
                                title="Maintenance"
                                value={formatNumber(
                                    stats.maintenanceMeters +
                                        stats.damageMeters,
                                )}
                                subtext="Units needing repair"
                                icon={AlertTriangle}
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-orange-500"
                            />
                            <StatCard
                                title="Yearly Consumption"
                                value={`${formatNumber(stats.totalConsumptionThisYear)} m³`}
                                subtext="Total distributed water"
                                icon={Droplets}
                                solidBgColor="bg-card hover:bg-accent/5 transition-colors border-l-4 border-l-sky-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Charts Area */}
                {/* Main Area Chart */}
                <Card className="border-none shadow-md lg:col-span-2">
                    <CardHeader className="p-4 pb-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold">
                                    Water Consumption Trends
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Monthly usage (m³) analysis for the current
                                    year
                                </CardDescription>
                            </div>
                            <div className="rounded-lg bg-primary/5 p-1.5">
                                <BarChart3 className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 5,
                                        left: -20,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorUsage"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="hsl(var(--primary))"
                                                stopOpacity={0}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        className="stroke-muted/30"
                                    />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: 'hsl(var(--muted-foreground))',
                                            fontSize: 10,
                                        }}
                                        dy={5}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: 'hsl(var(--muted-foreground))',
                                            fontSize: 10,
                                        }}
                                        tickFormatter={(val) => `${val}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor:
                                                'hsl(var(--background))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '0.5rem',
                                            boxShadow:
                                                '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                        }}
                                        itemStyle={{
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsage)"
                                        animationDuration={1500}
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
