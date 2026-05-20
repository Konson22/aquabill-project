import { formatCompactNumber, formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';
import {
    Bar,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    Line,
    Pie,
    PieChart,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const YEAR_PIE_COLORS = ['#16a34a', '#dc2626'];

/**
 * @param {{
 *   cx?: number,
 *   cy?: number,
 *   midAngle?: number,
 *   innerRadius?: number,
 *   outerRadius?: number,
 *   percent?: number,
 * }} props
 */
function renderYearPieLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }) {
    if (percent < 0.04) {
        return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const angle = (-midAngle * Math.PI) / 180;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);

    return (
        <text
            x={x}
            y={y}
            fill="#fff"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-semibold"
        >
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
}

/**
 * @param {number} value
 */
function axisSspLabel(value) {
    return formatCompactNumber(value);
}

/**
 * @param {{
 *   chartData?: Array<{
 *     date: string,
 *     collection_rate_percent: number,
 *     payments_collected?: number,
 *     billed_amount?: number,
 *   }>,
 *   summary: { total_billed_revenue: number, total_paid: number, collection_rate_percent: number },
 *   collectionTargetPercent: number,
 * }} props
 */
export function RevenueCollectionCharts({ chartData = [], summary, collectionTargetPercent }) {
    const target = Number(collectionTargetPercent ?? 90);

    const monthlyChartData = useMemo(
        () =>
            chartData.map((row) => ({
                month: row.date,
                collected: Number(row.payments_collected ?? 0),
                billed: Number(row.billed_amount ?? 0),
                collection_rate_percent: Number(row.collection_rate_percent ?? 0),
            })),
        [chartData],
    );

    const yearPieData = useMemo(() => {
        const collected = Number(summary.total_paid ?? 0);
        const pending = Math.max(0, Number(summary.total_outstanding ?? 0));
        const pieTotal = collected + pending;

        const slices = [
            { name: 'Collected', value: collected },
            { name: 'Pending', value: pending },
        ].filter((slice) => slice.value > 0);

        return { slices, billed: pieTotal, collectionRate: Number(summary.collection_rate_percent ?? 0) };
    }, [summary]);

    return (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm xl:col-span-7">
                <h3 className="text-sm font-semibold text-foreground">Monthly payments collected (SSP)</h3>
                <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={monthlyChartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis
                                yAxisId="amount"
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={axisSspLabel}
                            />
                            <YAxis
                                yAxisId="rate"
                                orientation="right"
                                domain={[0, 100]}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `${v}%`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '10px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '12px',
                                }}
                                formatter={(value, name) => {
                                    if (name === 'Collection rate %') {
                                        return [`${Number(value).toFixed(1)}%`, name];
                                    }

                                    return [formatCurrency(Number(value)), name];
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                            <Bar
                                yAxisId="amount"
                                dataKey="collected"
                                name="Payments collected"
                                fill="#166534"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                            />
                            <Bar
                                yAxisId="amount"
                                dataKey="billed"
                                name="Billed that month"
                                fill="#93c5fd"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={28}
                            />
                            <Line
                                yAxisId="rate"
                                type="monotone"
                                dataKey="collection_rate_percent"
                                name="Collection rate %"
                                stroke="#1e293b"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                            <ReferenceLine
                                yAxisId="rate"
                                y={target}
                                stroke="#dc2626"
                                strokeDasharray="4 4"
                                label={{
                                    value: `Target ${target}%`,
                                    position: 'insideTopRight',
                                    fill: '#dc2626',
                                    fontSize: 10,
                                }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm xl:col-span-5">
                <h3 className="text-sm font-semibold text-foreground">Full year overview (SSP)</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    Collected payments vs pending bill amounts
                </p>
                <div className="relative mt-4 h-72 w-full">
                    {yearPieData.slices.length === 0 || yearPieData.billed <= 0 ? (
                        <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            No billed revenue in this period.
                        </p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={yearPieData.slices}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={58}
                                        outerRadius={96}
                                        paddingAngle={2}
                                        label={renderYearPieLabel}
                                        labelLine={false}
                                    >
                                        {yearPieData.slices.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={YEAR_PIE_COLORS[index % YEAR_PIE_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => {
                                            const amount = Number(value);
                                            const total = yearPieData.billed;
                                            const pct = total > 0 ? ((amount / total) * 100).toFixed(1) : '0';

                                            return [`${formatCurrency(amount)} (${pct}%)`, name];
                                        }}
                                        contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                    Collection rate
                                </span>
                                <span className="text-2xl font-bold tabular-nums text-red-700 dark:text-red-400">
                                    {yearPieData.collectionRate.toLocaleString(undefined, {
                                        maximumFractionDigits: 1,
                                    })}
                                    %
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
