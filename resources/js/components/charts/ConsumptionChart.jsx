import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp } from 'lucide-react';
import { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    Area,
    AreaChart
} from 'recharts';

export default function ConsumptionChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Water Consumption</CardTitle>
                    <CardDescription>Monthly consumption trends</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-muted-foreground flex h-[300px] items-center justify-center">
                        <div className="text-center">
                            <Activity className="mx-auto mb-2 h-12 w-12 opacity-50" />
                            <p>No consumption data available</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const totalConsumption = data.reduce((sum, item) => sum + item.consumption, 0);
    const averageConsumption = totalConsumption / data.length;

    // Custom tooltip component
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                    <p className="text-blue-600 font-bold">
                        Consumption: {payload[0].value.toLocaleString()} m³
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Water Consumption Trends
                </CardTitle>
                <CardDescription>Monthly water consumption patterns</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-4 text-center dark:from-blue-950 dark:to-blue-900">
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totalConsumption.toLocaleString()} m³
                            </p>
                            <p className="text-muted-foreground text-sm">Total Consumption</p>
                        </div>
                        <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-100 p-4 text-center dark:from-green-950 dark:to-green-900">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {averageConsumption.toFixed(0)} m³
                            </p>
                            <p className="text-muted-foreground text-sm">Monthly Average</p>
                        </div>
                    </div>

                    {/* Line Chart */}
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
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
                                    <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#E5E7EB" 
                                    strokeOpacity={0.3}
                                />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#6B7280"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value.toLocaleString()} m³`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="consumption"
                                    stroke="#3B82F6"
                                    strokeWidth={3}
                                    fill="url(#consumptionGradient)"
                                    fillOpacity={0.6}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Additional Line Chart for trend analysis */}
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={data}
                                margin={{
                                    top: 20,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#E5E7EB" 
                                    strokeOpacity={0.3}
                                />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#6B7280"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    stroke="#6B7280"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value.toLocaleString()} m³`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line 
                                    type="monotone" 
                                    dataKey="consumption" 
                                    stroke="#3B82F6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Consumption Insights */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">Consumption Insights</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                    Peak Month
                                </div>
                                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                    {data.reduce((max, item) => item.consumption > max.consumption ? item : max, data[0])?.month || 'N/A'}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                    Lowest Month
                                </div>
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                    {data.reduce((min, item) => item.consumption < min.consumption ? item : min, data[0])?.month || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
