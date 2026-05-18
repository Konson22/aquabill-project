import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const ZONE_PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#64748b'];

/**
 * Zone revenue donut, optional middle content (e.g. bill-period summary), then collection rate by month.
 *
 * @param {{
 *   zoneRevenueComparison?: { zone: string, collected: number }[],
 *   chartData?: { date: string, collection_rate_percent: number }[],
 *   children?: import('react').ReactNode,
 * }} props
 */
export function RevenueCharts({ zoneRevenueComparison = [], chartData = [], children }) {
    const zonePieData = useMemo(
        () =>
            zoneRevenueComparison.map((row) => ({
                name: row.zone,
                value: Number(row.collected) || 0,
            })),
        [zoneRevenueComparison],
    );

    const zonePieTotal = useMemo(() => zonePieData.reduce((sum, d) => sum + d.value, 0), [zonePieData]);

    return (
        <div className="flex space-x-4">
            <Card className="shadow-sm flex-1">
                <CardHeader className="pb-2">
                    <div className=" gap-3">
                            <CardTitle className="text-base">Collection rate by month</CardTitle>
                            <div className="text-xs text-muted-foreground">
                                For each month: paid bill amounts (by bill date) plus paid service charges (by issue date),
                                divided by that month&apos;s billed water plus fixed charges — same basis as period collection rate.
                            </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorCollectionRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
            <div className="rounded-lg border bg-card p-4 w-1/3">
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Zone revenue comparison</h3>
                {zonePieData.length === 0 || zonePieTotal <= 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                        No zone revenue to display for the selected collection filters.
                    </p>
                ) : (
                    <div className="mx-auto flex min-h-[280px] w-full max-w-lg flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={zonePieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    innerRadius={48}
                                    paddingAngle={2}
                                >
                                    {zonePieData.map((entry, index) => (
                                        <Cell key={`${entry.name}-${index}`} fill={ZONE_PIE_COLORS[index % ZONE_PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [formatCurrency(Number(value)), 'Collected']}
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="bottom"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
}
