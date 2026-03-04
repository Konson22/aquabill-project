import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { formatCompactNumber } from '@/lib/utils';
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function ReadingSection({
    chartData,
    billsChartData,
    paymentChartData,
    usageByCategory,
    usageByZone,
}) {
    if (!chartData || !usageByCategory || !usageByZone) return null;

    const COLORS = [
        '#0ea5e9', // Blue
        '#10b981', // Emerald
        '#f59e0b', // Amber
    ];

    // Combine monthly data from consumption, bills, and payments
    const combinedMap = new Map();

    const mergeSeries = (source, valueKey, targetKey) => {
        (source || []).forEach((item) => {
            const name = item.name;
            if (!name) return;
            const existing = combinedMap.get(name) || { name };
            existing[targetKey] = Number(item[valueKey] ?? 0);
            combinedMap.set(name, existing);
        });
    };

    mergeSeries(chartData, 'total', 'consumption');
    mergeSeries(paymentChartData, 'total', 'payments');
    mergeSeries(billsChartData, 'total', 'bills');

    const combinedData = Array.from(combinedMap.values());

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Water, Bills & Payments Overview</CardTitle>
                    <CardDescription>
                        Monthly water consumption (m³), bills generated, and
                        payments collected for the current year.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={combinedData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    `SSP ${formatCompactNumber(value)}`
                                }
                            />
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: '8px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow:
                                        '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                }}
                                formatter={(value, name) => {
                                    if (name === 'consumption') {
                                        return [`${value} m³`, 'Water Consumption'];
                                    }
                                    if (name === 'bills') {
                                        return [value, 'Bills Generated'];
                                    }
                                    return [
                                        `SSP ${formatCompactNumber(value)}`,
                                        'Payments Collected',
                                    ];
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="consumption"
                                name="Water Consumption"
                                stroke={COLORS[0]}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="bills"
                                name="Bills Generated"
                                stroke={COLORS[1]}
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="payments"
                                name="Payments Collected"
                                stroke={COLORS[2]}
                                strokeWidth={2}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
