import ConsumptionChart from '@/components/charts/ConsumptionChart';
import MeterStatusChart from '@/components/charts/MeterStatusChart';
import RevenueChart from '@/components/charts/RevenueChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

const breadcrumbs = [
    { title: 'Dashboard', href: '/' },
    { title: 'Statistics', href: '/statistics' },
];

export default function StatisticsPage({ monthlyRevenue = [], consumptionSeries = [], meterStatus = [], topPayers = [], kpis = {} }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistics" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Statistics</h1>
                    <p className="text-muted-foreground">Performance and trends</p>
                </div>

                <Tabs defaultValue="finance" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="finance">Finance</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                        <TabsTrigger value="water">Water usage</TabsTrigger>
                    </TabsList>

                    <TabsContent value="finance" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>This Month Revenue</CardTitle>
                                    <CardDescription>Total collected</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">SSP {(kpis.thisMonthRevenue || 0).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Outstanding</CardTitle>
                                    <CardDescription>Unpaid balance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">SSP {(kpis.outstandingAmount || 0).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <RevenueChart data={monthlyRevenue} />
                            </div>
                            <div className="col-span-3">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Top Customers (By Billed Amount)</CardTitle>
                                        <CardDescription>This year</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {(topPayers || []).map((c, idx) => (
                                                <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                                                    <div>
                                                        <p className="font-medium">{c.name}</p>
                                                        <p className="text-muted-foreground text-sm">{c.account_number}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold">SSP {Number(c.amount || 0).toLocaleString()}</p>
                                                        <p className="text-muted-foreground text-xs">Total billed</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(topPayers || []).length === 0 && <div className="text-muted-foreground py-6 text-center">No data</div>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="billing" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>This Month Bills</CardTitle>
                                    <CardDescription>Generated</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{(kpis.thisMonthBills || 0).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="water" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>This Month Readings</CardTitle>
                                    <CardDescription>Recorded</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{(kpis.thisMonthReadings || 0).toLocaleString()}</div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4">
                                <ConsumptionChart data={consumptionSeries} />
                            </div>
                            <div className="col-span-3">
                                <MeterStatusChart data={meterStatus} />
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
