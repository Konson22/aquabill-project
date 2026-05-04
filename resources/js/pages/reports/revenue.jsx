import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueSummaryTable } from '@/pages/reports/components/revenue-summary-table';
import { Head, Link, router } from '@inertiajs/react';
import { Receipt, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { OverdueBills } from './components/overdue-bills';

const breadcrumbs = [
    {
        title: 'Revenue Reports',
        href: '/reports/revenue',
    },
];

/**
 * @param {Date} [d]
 * @returns {{ from: string, to: string }}
 */
function calendarFullYearBounds(d = new Date()) {
    const y = d.getFullYear();

    return { from: `${y}-01-01`, to: `${y}-12-31` };
}

/**
 * @param {{ from?: string, to?: string }} f
 */
function initialBillMonthRange(f) {
    const from = f.from?.trim() ?? '';
    const to = f.to?.trim() ?? '';
    if (from && to) {
        return { from, to };
    }

    return calendarFullYearBounds();
}

export default function RevenueReport({
    summary,
    chartData = [],
    rows,
    filters,
    overdueBills = [],
    overdueBillsMeta,
}) {
    const safeSummary = summary ?? {
        total_revenue: 0,
        fixed_charge_revenue: 0,
        total_billed_revenue: 0,
        total_paid: 0,
        total_outstanding: 0,
        collection_rate_percent: 0,
        payments_count: 0,
    };

    const safeRows = rows.data ?? [];
    const safeFilters = filters ?? { search: '', from: '', to: '' };

    const [from, setFrom] = useState(() => initialBillMonthRange(filters ?? { from: '', to: '' }).from);
    const [to, setTo] = useState(() => initialBillMonthRange(filters ?? { from: '', to: '' }).to);

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                breadcrumbs[0].href,
                {
                    from,
                    to,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['summary', 'rows', 'filters', 'chartData', 'overdueBills', 'overdueBillsMeta'],
                },
            );
        }, 350);

        return () => clearTimeout(timeout);
    }, [from, to]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Revenue Reports" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                            Revenue Reports
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track collections, outstanding balances, and revenue performance across time.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" asChild>
                            <Link href={route('bills.index')}>
                                <Receipt className="mr-2 h-4 w-4" />
                                View Bills
                            </Link>
                        </Button>
                    </div>
                </div>

                <RevenueSummaryTable
                    summary={safeSummary}
                    filters={safeFilters}
                    onBillDateRangeChange={(fromValue, toValue) => {
                        setFrom(fromValue);
                        setTo(toValue);
                    }}
                />

                <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <CardTitle className="text-base">Collection rate by month</CardTitle>
                                <div className="text-xs text-muted-foreground">
                                    For each month: paid bill amounts (by bill date) plus paid service charges (by issue date),
                                    divided by that month&apos;s billed water plus fixed charges — same basis as period collection rate.
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest text-emerald-600 border-emerald-200 bg-emerald-50">
                                Live Data
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorCollectionRate" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        interval={0}
                                        tick={{ fontSize: 9, fill: '#888', angle: -32, textAnchor: 'end' }}
                                        height={48}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#888' }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                        }}
                                        formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Collection rate']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="collection_rate_percent"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCollectionRate)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <OverdueBills overdueBills={overdueBills} overdueBillsMeta={overdueBillsMeta} />
            </div>
        </AppLayout>
    );
}
