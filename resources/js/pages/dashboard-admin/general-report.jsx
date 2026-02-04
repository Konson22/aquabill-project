import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    BarChart3,
    Building2,
    Droplets,
    Users,
} from 'lucide-react';

export default function GeneralReport({ stats = {}, highlights = [] }) {
    const summary = {
        customers: stats.customers ?? 0,
        homes: stats.homes ?? 0,
        meters: stats.meters ?? 0,
        consumption: stats.consumption ?? 0,
    };
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

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Customers
                            </CardTitle>
                            <div className="rounded-full bg-blue-50 p-2">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {summary.customers.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">
                                Active customer accounts
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Homes
                            </CardTitle>
                            <div className="rounded-full bg-emerald-50 p-2">
                                <Building2 className="h-4 w-4 text-emerald-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {summary.homes.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">
                                Registered home connections
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Meters
                            </CardTitle>
                            <div className="rounded-full bg-violet-50 p-2">
                                <BarChart3 className="h-4 w-4 text-violet-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {summary.meters.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">
                                Active meter installations
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Total Consumption
                            </CardTitle>
                            <div className="rounded-full bg-amber-50 p-2">
                                <Droplets className="h-4 w-4 text-amber-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold text-slate-900">
                                {summary.consumption.toLocaleString()} m³
                            </div>
                            <p className="text-xs text-slate-500">
                                Recorded total usage
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Card className="border-slate-200/80 shadow-sm">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900">
                                Consumption Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="py-10 text-center text-sm text-slate-500">
                            Connect analytics data to populate this chart.
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
