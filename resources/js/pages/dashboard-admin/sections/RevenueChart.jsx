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


export default function RevenueChart({ data = [], paymentsData = [] }) {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueMap = new Map(
        (data || []).map((d) => [d.name, Number(d.total ?? 0)]),
    );
    const paymentsMap = new Map(
        (paymentsData || []).map((d) => [d.name, Number(d.total ?? 0)]),
    );
    const normalizedData = MONTHS.map((name) => ({
        name,
        revenue: revenueMap.get(name) ?? 0,
        payments: paymentsMap.get(name) ?? 0,
    }));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Generated Bills Vs Payments Collected</CardTitle>
                
            </CardHeader>
            <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={normalizedData}>
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
                                const label =
                                    name === 'payments'
                                        ? 'Payments Collected'
                                        : 'Water Revenue';
                                return [
                                    `SSP ${formatCompactNumber(value)}`,
                                    label,
                                ];
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="revenue"
                            name="Water Revenue"
                            stroke="#0ea5e9"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="payments"
                            name="Payments Collected"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
