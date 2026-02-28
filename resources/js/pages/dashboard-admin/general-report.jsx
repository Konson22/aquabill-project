import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    FileSpreadsheet,
    LayoutDashboard,
} from 'lucide-react';
import {
    CustomerSection,
    FinanceSection,
    WaterUsageSection,
} from './report-sections';

export default function GeneralReport({
    stats = {},
    customerStats = {},
    highlights = [],
    usageByZone = [],
    filters = {},
}) {
    const defaultHighlights = [
        {
            label: 'Overdue bills',
            value: '0',
            description: 'Pending balance: 0.00',
        },
        {
            label: 'Readings overdue',
            value: '0',
            description: 'Active meters without 30-day read',
        },
        {
            label: 'Collection rate',
            value: '0%',
            description: 'Fully paid bills vs total',
        },
    ];
    const allHighlights = highlights.length ? highlights : defaultHighlights;
    const financeHighlights = allHighlights.filter(
        (h) =>
            h.label.toLowerCase().includes('overdue bill') ||
            h.label.toLowerCase().includes('collection'),
    );
    const waterHighlights = allHighlights.filter(
        (h) => h.label.toLowerCase().includes('reading'),
    );

    const breadcrumbs = [
        { title: 'Dashboard', href: route('dashboard') },
        { title: 'General Report', href: route('general-report') },
    ];

    const monthOptions = Array.from({ length: 12 }).map((_, index) => {
        const date = new Date();
        date.setMonth(date.getMonth() - index);
        return {
            value: date.toISOString().slice(0, 7),
            label: date.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
            }),
        };
    });

    const handleMonthChange = (value) => {
        router.get(
            route('general-report'),
            { month: value === 'all' ? null : value },
            { preserveState: true, preserveScroll: true },
        );
    };

    const selectedMonthLabel =
        filters.month &&
        monthOptions.find((o) => o.value === filters.month)?.label;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Report" />
            <div className="mx-auto max-w-[1400px] space-y-8 ">
                {/* Page header */}
                <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between md:p-8">
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <LayoutDashboard className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        General Report
                                    </p>
                                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                                        System Overview
                                    </h1>
                                </div>
                            </div>
                            <p className="max-w-xl text-sm text-slate-600">
                                Snapshot of finance, water usage, and key
                                metrics.
                                {selectedMonthLabel && (
                                    <span className="mt-1 block font-medium text-slate-700">
                                        Showing: {selectedMonthLabel}
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <Select
                                    value={filters.month || 'all'}
                                    onValueChange={handleMonthChange}
                                >
                                    <SelectTrigger className="h-10 w-[180px] rounded-lg border-slate-200 bg-white shadow-sm">
                                        <SelectValue placeholder="Period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All months
                                        </SelectItem>
                                        {monthOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.value}
                                                value={opt.value}
                                            >
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button variant="outline" asChild className="h-10 gap-2">
                                <Link href={route('dashboard')}>
                                    <ArrowLeft className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <Button
                                className="h-10 gap-2 shadow-sm"
                                variant="default"
                            >
                                <FileSpreadsheet className="h-4 w-4" />
                                Export summary
                            </Button>
                        </div>
                    </div>
                </header>

                <div className="space-y-8">
                    <FinanceSection
                        stats={stats}
                        highlights={financeHighlights}
                    />
                    <WaterUsageSection
                        stats={stats}
                        usageByZone={usageByZone}
                        highlights={waterHighlights}
                        filters={filters}
                        monthOptions={monthOptions}
                        onMonthChange={handleMonthChange}
                        onDownloadReport={() => {
                            const params = new URLSearchParams();
                            if (filters.month) params.set('month', filters.month);
                            window.location.href = `${route('meter-readings.export')}?${params.toString()}`;
                        }}
                    />
                    <CustomerSection stats={customerStats} />
                </div>
            </div>
        </AppLayout>
    );
}
