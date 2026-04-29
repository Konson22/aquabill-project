import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Head, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Download,
    Droplets,
    Map,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const breadcrumbs = [
    {
        title: 'Water Usage Report',
        href: '/reports/water-usage',
    },
];

export default function WaterUsageReport({
    summary,
    chartData = [],
    zoneData = [],
    topConsumers = [],
    filters,
}) {
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                breadcrumbs[0].href,
                {
                    from: from || undefined,
                    to: to || undefined,
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                },
            );
        }, 500);

        return () => clearTimeout(timeout);
    }, [from, to]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Water Usage Report" />

            <div className="flex h-full flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <Activity className="h-6 w-6 text-blue-500" />
                            </div>
                            Water Usage Analytics
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Analyze consumption patterns, zone performance, and peak usage periods.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2 font-bold shadow-sm">
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Filters & Stats Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Summary Cards */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="shadow-sm border-blue-100 overflow-hidden group hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Consumption</CardTitle>
                                    <Droplets className="h-4 w-4 text-blue-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-blue-600">
                                    {Number(summary.total_consumption).toLocaleString()} <span className="text-sm font-bold text-muted-foreground uppercase ml-1">m³</span>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">Total water units billed in period</div>
                            </CardContent>
                            <div className="h-1 w-full bg-blue-500/10 mt-auto">
                                <div className="h-full bg-blue-500 w-2/3" />
                            </div>
                        </Card>

                        <Card className="shadow-sm border-emerald-100 overflow-hidden group hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Consumption</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-emerald-600">
                                    {Number(summary.avg_consumption).toFixed(1)} <span className="text-sm font-bold text-muted-foreground uppercase ml-1">m³</span>
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">Average units per bill issued</div>
                            </CardContent>
                            <div className="h-1 w-full bg-emerald-500/10 mt-auto">
                                <div className="h-full bg-emerald-500 w-1/2" />
                            </div>
                        </Card>

                        <Card className="shadow-sm border-amber-100 overflow-hidden group hover:shadow-md transition-all">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Readings</CardTitle>
                                    <Activity className="h-4 w-4 text-amber-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black text-amber-600">
                                    {Number(summary.bills_count).toLocaleString()}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">Count of successful bill cycles</div>
                            </CardContent>
                            <div className="h-1 w-full bg-amber-500/10 mt-auto">
                                <div className="h-full bg-amber-500 w-3/4" />
                            </div>
                        </Card>
                    </div>

                    {/* Date Filters */}
                    <Card className="shadow-sm border-muted">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Filter Period
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase">From Date</label>
                                <Input 
                                    type="date" 
                                    value={from} 
                                    onChange={(e) => setFrom(e.target.value)} 
                                    className="h-9 text-xs rounded-lg bg-muted/30 border-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-muted-foreground uppercase">To Date</label>
                                <Input 
                                    type="date" 
                                    value={to} 
                                    onChange={(e) => setTo(e.target.value)} 
                                    className="h-9 text-xs rounded-lg bg-muted/30 border-none focus:ring-1 focus:ring-blue-500 transition-all"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Usage Chart */}
                    <Card className="lg:col-span-2 shadow-sm border-muted">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-black">Daily Consumption Trend</CardTitle>
                                    <p className="text-xs text-muted-foreground">Volumetric usage over the selected period</p>
                                </div>
                                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] font-black uppercase">m³ Units</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                            dataKey="date" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                                            dy={10}
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                                            tickFormatter={(val) => `${val}m³`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                borderRadius: '16px', 
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                padding: '12px'
                                            }}
                                            formatter={(value) => [`${value.toLocaleString()} m³`, 'Consumption']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="consumption" 
                                            stroke="#3b82f6" 
                                            strokeWidth={4}
                                            fillOpacity={1} 
                                            fill="url(#usageGradient)" 
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Zone Breakdown */}
                    <Card className="shadow-sm border-muted">
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base font-black">Zone Breakdown</CardTitle>
                                    <p className="text-xs text-muted-foreground">Usage distribution across zones</p>
                                </div>
                                <Map className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={zoneData} layout="vertical" margin={{ left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                        <XAxis type="number" hide />
                                        <YAxis 
                                            dataKey="name" 
                                            type="category" 
                                            axisLine={false} 
                                            tickLine={false}
                                            tick={{ fontSize: 10, fontWeight: 'bold', fill: '#1e293b' }}
                                            width={80}
                                        />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${value} m³`, 'Usage']}
                                        />
                                        <Bar 
                                            dataKey="consumption" 
                                            radius={[0, 4, 4, 0]} 
                                            barSize={18}
                                        >
                                            {zoneData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row - Top Consumers */}
                <Card className="shadow-sm border-muted overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-lg font-black">Top Consumers</CardTitle>
                            </div>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight">Highest Usage Records in Period</p>
                        </div>
                    </CardHeader>
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10">
                                <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">Customer Name</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest">Account Number</TableHead>
                                <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-6">Consumption (m³)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topConsumers.map((customer, index) => (
                                <TableRow key={index} className="group hover:bg-blue-50/50 transition-colors">
                                    <TableCell className="pl-6 font-bold text-sm group-hover:text-blue-600 transition-colors">
                                        {customer.name}
                                    </TableCell>
                                    <TableCell className="text-xs font-mono text-muted-foreground uppercase">
                                        #{customer.account}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <span className="font-black text-blue-600 tabular-nums">
                                            {customer.consumption.toLocaleString()}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {topConsumers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="py-12 text-center text-muted-foreground font-bold">
                                        No usage data available for the selected period.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </AppLayout>
    );
}
