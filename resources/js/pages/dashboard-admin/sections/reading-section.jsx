import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function ReadingSection({
    chartData,
    usageByCategory,
    usageByZone,
}) {
    if (!chartData || !usageByCategory || !usageByZone) return null;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Water Consumption Overview</CardTitle>
                    <CardDescription>
                        Monthly water usage in cubic meters (m³) for the current
                        year
                    </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="colorTotal"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#0ea5e9"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#0ea5e9"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>
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
                                tickFormatter={(value) => `${value}m³`}
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
                                itemStyle={{
                                    color: '#0ea5e9',
                                    fontWeight: 600,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#0ea5e9"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <div className="col-span-3 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Usage by Tariff</CardTitle>
                        <CardDescription>
                            Distribution of consumption across tariffs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={usageByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {usageByCategory.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `${value} m³`}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {usageByCategory.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="truncate text-slate-500">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Usage by Zone</CardTitle>
                        <CardDescription>
                            Distribution of consumption across zones
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={usageByZone}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {usageByZone.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.fill}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => `${value} m³`}
                                    contentStyle={{
                                        backgroundColor: '#fff',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {usageByZone.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: item.fill }}
                                    />
                                    <span className="truncate text-slate-500">
                                        {item.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
