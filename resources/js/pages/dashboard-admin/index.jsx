import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import { Activity, Banknote, BarChart3, ChevronRight } from 'lucide-react';
import FinanceSection from './sections/finance';
import HomesSection from './sections/homes-section';
import MeterSection from './sections/meters-section';
import ReadingSection from './sections/reading-section';

const QuickAction = ({
    href,
    icon: Icon,
    title,
    description,
    colorClass,
    bgClass,
}) => (
    <Link
        href={href}
        className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
    >
        <div className="absolute top-0 left-0 h-full w-1 rounded-r-full bg-gradient-to-b from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bgClass} shadow-sm transition-transform duration-200 group-hover:scale-105`}
            >
                <Icon className={`h-5 w-5 ${colorClass}`} />
            </div>
            <ChevronRight
                className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
            />
        </div>
        <div className="space-y-1">
            <h3 className="font-semibold tracking-tight text-foreground">
                {title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
                {description}
            </p>
        </div>
    </Link>
);

export default function Dashboard({
    stats,
    chartData,
    billsChartData,
    paymentChartData,
    usageByCategory,
    usageByZone,
    overdueReadings = [],
    overdueBills = [],
}) {
    const { auth } = usePage().props;
    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'Overview', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto min-h-screen max-w-[1600px] space-y-8 pb-8">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <QuickAction
                        href={route('general-report')}
                        icon={BarChart3}
                        title="General Report"
                        description="System-wide overview"
                        colorClass="text-white"
                        bgClass="bg-slate-900"
                    />
                    <QuickAction
                        href={route('payments.report')}
                        icon={Banknote}
                        title="Payment Report"
                        description="Track revenue streams"
                        colorClass="text-white"
                        bgClass="bg-emerald-600"
                    />
                    <QuickAction
                        href={route('meter-readings.report')}
                        icon={Activity}
                        title="Reading Report"
                        description="Consumption analysis"
                        colorClass="text-white"
                        bgClass="bg-amber-600"
                    />
                </div>
                <FinanceSection
                    stats={stats.bills}
                    performance={stats.billingPerformance}
                    invoices={stats.invoices}
                    totalBillsAmount={stats.totalBillsAmount}
                    totalPaymentsAmount={stats.totalPaymentsAmount}
                />
                <HomesSection stats={stats.homes} trend={stats.homesTrend} />
                <MeterSection stats={stats.meters} trend={stats.metersTrend} />
                <ReadingSection
                    chartData={chartData}
                    billsChartData={billsChartData}
                    paymentChartData={paymentChartData}
                    usageByCategory={usageByCategory}
                    usageByZone={usageByZone}
                />
            </div>
        </AppLayout>
    );
}
