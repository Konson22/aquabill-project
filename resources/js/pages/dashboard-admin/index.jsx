import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    Banknote,
    BarChart3,
    ChevronRight,
    FileText,
    Receipt,
} from 'lucide-react';
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
        className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
    >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1.5 opacity-70 transition-opacity group-hover:opacity-100">
            <div className={`h-full w-full ${bgClass}`} />
        </div>
        <div className="relative z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${bgClass} bg-opacity-10 ring-1 ring-inset ring-slate-200/70 transition-transform group-hover:-rotate-3`}
                >
                    <Icon className={`h-6 w-6 ${colorClass}`} />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition-colors group-hover:border-slate-300 group-hover:bg-white group-hover:text-slate-700">
                    Open
                    <ChevronRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                    />
                </span>
            </div>
            <div className="space-y-1.5">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">
                    {title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                    {description}
                </p>
            </div>
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <QuickAction
                        href={route('general-report')}
                        icon={BarChart3}
                        title="General Report"
                        description="System-wide overview"
                        colorClass="text-white"
                        bgClass="bg-slate-900"
                    />
                    <QuickAction
                        href={route('bills.report')}
                        icon={FileText}
                        title="Billing Report"
                        description="View billing analytics"
                        colorClass="text-white"
                        bgClass="bg-blue-600"
                    />
                    <QuickAction
                        href={route('payments.report')}
                        icon={Banknote}
                        title="Payment Report"
                        description="Track revenue streams"
                        colorClass="text-emerald-600"
                        bgClass="bg-emerald-600"
                    />
                    <QuickAction
                        href={route('meter-readings.report')}
                        icon={Activity}
                        title="Reading Report"
                        description="Consumption analysis"
                        colorClass="text-amber-600"
                        bgClass="bg-amber-600"
                    />
                </div>
                <FinanceSection
                    stats={stats.bills}
                    performance={stats.billingPerformance}
                    invoices={stats.invoices}
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
