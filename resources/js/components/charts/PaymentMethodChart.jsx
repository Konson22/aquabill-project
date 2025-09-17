import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Smartphone, Wallet } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
    cash: '#10B981',
    mobile_money: '#F59E0B',
    bank_transfer: '#3B82F6',
};

const METHOD_LABELS = {
    cash: 'Cash',
    mobile_money: 'Mobile Money',
    bank_transfer: 'Bank Transfer',
};

const METHOD_ICONS = {
    cash: Wallet,
    mobile_money: Smartphone,
    bank_transfer: CreditCard,
};

export default function PaymentMethodChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>Breakdown of payment methods used</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                        <div className="text-center">
                            <CreditCard className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No payment data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Process data for pie chart
    const chartData = data.map((item) => ({
        name: METHOD_LABELS[item.method] || item.method,
        value: item.amount,
        count: item.count,
        method: item.method,
        color: COLORS[item.method] || '#6B7280',
    }));

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="mb-2 flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: data.color }} />
                        <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Amount: <span className="font-bold">SSP {data.value.toLocaleString()}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Count: <span className="font-bold">{data.count}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Percentage: <span className="font-bold">{((data.value / totalAmount) * 100).toFixed(1)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom legend
    const CustomLegend = ({ payload }) => {
        return (
            <div className="mt-4 flex flex-wrap justify-center gap-4">
                {payload.map((entry, index) => {
                    const IconComponent = METHOD_ICONS[entry.payload.method];
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                            <span className="text-sm text-gray-600 dark:text-gray-400">{entry.value}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Methods
                </CardTitle>
                <CardDescription>Breakdown of payment methods used</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Summary */}
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">SSP {totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
                    </div>

                    {/* Chart */}
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <CustomLegend
                        payload={chartData.map((item) => ({
                            value: item.name,
                            color: item.color,
                            payload: item,
                        }))}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
