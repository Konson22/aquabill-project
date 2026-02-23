import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    Receipt,
    Wallet,
} from 'lucide-react';

export default function GeneralReport({
    stats = {},
    highlights = [],
    usageByZone = [],
    filters = {},
}) {
    const performanceHighlights = highlights.length
        ? highlights
        : [
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="General Report" />
            <div className="mx-auto max-w-[1400px] space-y-6 p-4 md:p-0">
                <div className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            General Report
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                            System Overview
                        </h1>
                        <p className="text-sm text-slate-500">
                            Snapshot of customers, homes, meters, and usage.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            id="general-report-month"
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                            value={filters.month || 'all'}
                            onChange={(event) =>
                                handleMonthChange(event.target.value)
                            }
                        >
                            <option value="all">All Months</option>
                            {monthOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button variant="outline" asChild className="gap-2">
                            <Link href={route('dashboard')}>
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <Button variant="outline" className="gap-2">
                            <BarChart3 className="h-4 w-4 text-slate-700" />
                            Export Summary
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Bills Generated
                            </CardTitle>
                            <div className="rounded-full bg-blue-50 p-2">
                                <Receipt className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {(stats.totalBills ?? 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">
                                Bills generated in the system
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Bills Paid vs Unpaid
                            </CardTitle>
                            <div className="rounded-full bg-emerald-50 p-2">
                                <Wallet className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {(stats.paidBills ?? 0).toLocaleString()} /{' '}
                                {(stats.unpaidBills ?? 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">
                                Paid and unpaid bills
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Amount Paid
                            </CardTitle>
                            <div className="rounded-full bg-violet-50 p-2">
                                <BarChart3 className="h-4 w-4 text-violet-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {formatCurrency(stats.totalPaidAmount ?? 0)}
                            </div>
                            <p className="text-xs text-slate-500">
                                Sum of all payments
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Outstanding & Consumption
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Outstanding Balance
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {formatCurrency(
                                        stats.outstandingAmount ?? 0,
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Total Water Consumption
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {(stats.totalConsumption ?? 0).toLocaleString()}{' '}
                                    m³
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500">
                                    Payment Rate
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {(stats.paymentRate ?? 0).toFixed(1)}%
                                </span>
                            </div>
                            <div className="border-t pt-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Consumption by Zone
                                </p>
                                <div className="mt-3 space-y-2 text-sm text-slate-600">
                                    {usageByZone.length ? (
                                        usageByZone.map((zone) => (
                                            <div
                                                key={zone.name}
                                                className="flex items-center justify-between"
                                            >
                                                <span>{zone.name}</span>
                                                <span className="font-semibold text-slate-900">
                                                    {zone.value.toLocaleString()}{' '}
                                                    m³
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-slate-500">
                                            No zone consumption data available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Performance Highlights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4 text-sm text-slate-600">
                            {performanceHighlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                            {item.label}
                                        </p>
                                        <span className="text-lg font-semibold text-slate-900">
                                            {item.value}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.description}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
