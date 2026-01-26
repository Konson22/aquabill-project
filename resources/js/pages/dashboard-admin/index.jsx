import AppLayout from '@/layouts/app-layout';
import { Link, usePage } from '@inertiajs/react';
import { Activity, Banknote, FileText, Receipt } from 'lucide-react';
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
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md"
    >
        <div
            className={`absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-5 transition-transform group-hover:scale-110 ${bgClass}`}
        />
        <div className="relative z-10 flex items-center gap-4">
            <div className={`rounded-lg p-2.5 ${bgClass} bg-opacity-10`}>
                <Icon className={`h-5 w-5 ${colorClass}`} />
            </div>
            <div>
                <h3 className="font-semibold text-slate-900">{title}</h3>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
        </div>
    </Link>
);

export default function Dashboard({
    stats,
    chartData,
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
                        href={route('bills.report')}
                        icon={FileText}
                        title="Billing Report"
                        description="View billing analytics"
                        colorClass="text-blue-600"
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
                        href={route('bills')}
                        icon={Receipt}
                        title="Billing Management"
                        description="Manage customer bills"
                        colorClass="text-violet-600"
                        bgClass="bg-violet-600"
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
                    usageByCategory={usageByCategory}
                    usageByZone={usageByZone}
                />
            </div>
        </AppLayout>
    );
}
