import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function RevenueTrendChart({ data, type = 'area' }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No revenue data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalRevenue = data.reduce((sum, item) => sum + Number(item.revenue || 0), 0);
    const averageRevenue = data.length > 0 ? totalRevenue / data.length : 0;
    const maxRevenue = Math.max(...data.map((item) => Number(item.revenue || 0)));

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="font-bold text-blue-600">Revenue: SSP {Number(payload[0].value || 0).toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="flex-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue trends for {new Date().getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 text-center dark:from-blue-950 dark:to-blue-900">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">SSP {totalRevenue.toLocaleString()}</p>
                            <p className="text-muted-foreground text-sm">Total Revenue</p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4 text-center dark:from-green-950 dark:to-green-900">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">SSP {averageRevenue.toFixed(0)}</p>
                            <p className="text-muted-foreground text-sm">Monthly Average</p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 p-4 text-center dark:from-purple-950 dark:to-purple-900">
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">SSP {maxRevenue.toLocaleString()}</p>
                            <p className="text-muted-foreground text-sm">Peak Month</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {type === 'area' ? (
                                <AreaChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `SSP ${(Number(value || 0) / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fill="url(#revenueGradient)"
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            ) : (
                                <BarChart
                                    data={data}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
                                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis
                                        stroke="#6B7280"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `SSP ${(Number(value || 0) / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
