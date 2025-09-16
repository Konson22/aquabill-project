import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function MeterStatusChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Meter Status</CardTitle>
                    <CardDescription>Distribution of meter statuses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                        <div className="text-center">
                            <Droplets className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No meter data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sample data structure - you can modify this based on your actual data
    const meterData =
        data.length > 0
            ? data
            : [
                  { name: 'Active', value: 85, color: '#10B981' },
                  { name: 'Inactive', value: 10, color: '#6B7280' },
                  { name: 'Faulty', value: 5, color: '#EF4444' },
              ];

    const totalMeters = meterData.reduce((sum, item) => sum + item.value, 0);

    // Custom tooltip component
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / totalMeters) * 100).toFixed(1);
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {data.value} meters ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom legend component
    const CustomLegend = ({ payload }) => {
        return (
            <div className="mt-4 flex flex-wrap justify-center gap-4">
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card className="flex-">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Droplets className="h-5 w-5" />
                    Meter Status Distribution
                </CardTitle>
                <CardDescription>Overview of meter operational status</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex">
                    {/* Donut chart with centered total */}
                    <div className="relative h-[250px] w-[250px] md:col-span-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={meterData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={4}
                                    dataKey="value"
                                    isAnimationActive={true}
                                >
                                    {meterData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold">{totalMeters}</div>
                            <div className="text-muted-foreground text-xs">Total meters</div>
                        </div>
                    </div>

                    {/* Compact legend */}
                    <div className="flex flex-col justify-center gap-3">
                        {meterData.map((item, index) => {
                            const pct = ((item.value / totalMeters) * 100).toFixed(1);
                            return (
                                <div key={index} className="flex items-center justify-between rounded-lg border p-2">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{item.value}</span>
                                        <span className="text-muted-foreground text-xs">({pct}%)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
