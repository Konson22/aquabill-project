import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Activity,
    BadgeCheck,
    Calendar,
    CreditCard,
    Droplet,
    MapPin,
    Gauge,
    Phone,
    Receipt,
    User,
    Wrench,
    PowerOff,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReadingModal from '@/components/reading-modal';
import CustomerBills from './components/customer-bills';
import CustomerReadings from './components/customer-readings';
import CustomerPayments from './components/customer-payments';
import CustomerServiceCharges from './components/customer-service-charges';
import DisconnectionManagement from './components/disconnection-management';
import MeterStatusModal from './components/meter-status-modal';
import ReplaceMeterModal from './components/replace-meter-modal';
import { useState } from 'react';

export default function Show({ customer, unassignedMeters = [] }) {
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('bills');

    const breadcrumbs = [
        { title: 'Customers', href: '/customers' },
        { title: customer?.account_number ?? 'Customer', href: customer ? `/customers/${customer.id}` : '/customers' },
    ];

    const formatDate = (value) => {
        if (!value) {
            return '—';
        }

        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return String(value);
        }
    };

    const statusVariant = customer?.status === 'active' ? 'success' : 'secondary';
    const meters = customer?.meters ?? [];
    const meterHistories = customer?.meterHistories ?? customer?.meter_histories ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={customer ? `${customer.name} • ${customer.account_number}` : 'Customer'} />

            <div className="mx-auto w-full max-w-6xl p-6 space-y-6 animate-in fade-in duration-500">
                {/* Top actions */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <Link
                        href="/customers"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Customers
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700" asChild>
                            <Link href={route('customers.disconnection-status', customer.id)}>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Disconnection
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('customers.edit', customer.id)}>
                                <Wrench className="mr-2 h-4 w-4" />
                                Edit Customer
                            </Link>
                        </Button>
                        <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsReadingModalOpen(true)}
                        >
                            <Droplet className="mr-2 h-4 w-4" />
                            Record Reading
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                    <div className="lg:col-span-4">
                        <Card className="rounded-xl border shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 space-y-2">
                                        <CardTitle className="text-xl font-bold leading-tight">
                                            {customer?.name ?? 'Customer'}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="font-mono font-bold text-primary">
                                                {customer?.account_number ?? '—'}
                                            </span>
                                            <span className="text-muted-foreground/60">•</span>
                                            <span className="capitalize">{customer?.customer_type ?? '—'}</span>
                                            <span className="text-muted-foreground/60">•</span>
                                            <Badge variant={statusVariant} className="capitalize text-[10px]">
                                                <BadgeCheck className="mr-1.5 h-3 w-3" />
                                                {customer?.status ?? 'unknown'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                                                Zone: {customer?.zone?.name ?? '—'}
                                            </Badge>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                                                Tariff: {customer?.tariff?.name ?? '—'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 border-t pt-6">
                                <section className="space-y-2">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Phone className="h-3.5 w-3.5" />
                                        Contact
                                    </h3>
                                    <p className="text-sm font-medium text-foreground">{customer?.phone ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">{customer?.email ?? 'No email'}</p>
                                </section>
                                <section className="space-y-2 border-t pt-6">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <MapPin className="h-3.5 w-3.5" />
                                        Address
                                    </h3>
                                    <p className="text-sm font-medium leading-relaxed text-foreground">{customer?.address ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">Plot: {customer?.plot_no ?? '—'}</p>
                                    <p className="text-xs text-muted-foreground">National ID: {customer?.national_id ?? '—'}</p>
                                </section>
                                <section className="space-y-2 border-t pt-6">
                                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Connection
                                    </h3>
                                    <p className="text-sm font-medium text-foreground">{formatDate(customer?.connection_date)}</p>
                                    <p className="text-xs text-muted-foreground">Created: {formatDate(customer?.created_at)}</p>
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: tabbed data */}
                    <div className="lg:col-span-8">
                        <Card className="rounded-xl border shadow-sm">
                            <CardContent className="p-4 md:p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1 sm:grid-cols-3 lg:grid-cols-6">
                                        <TabsTrigger
                                            value="overview"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <PowerOff className="mr-2 h-4 w-4" />
                                            Overview
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="bills"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <Receipt className="mr-2 h-4 w-4" />
                                            Bills
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="readings"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <Droplet className="mr-2 h-4 w-4" />
                                            Readings
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="meters"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <Gauge className="mr-2 h-4 w-4" />
                                            Meters
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="payments"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <CreditCard className="mr-2 h-4 w-4" />
                                            Payments
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="charges"
                                            className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                                        >
                                            <Wrench className="mr-2 h-4 w-4" />
                                            Charges
                                        </TabsTrigger>
                                    </TabsList>

                                    <div className="mt-5">
                                        <TabsContent value="overview" className="m-0 border-none p-0 outline-none">
                                            <DisconnectionManagement customer={customer} />
                                        </TabsContent>

                                <TabsContent value="bills" className="m-0 border-none p-0 outline-none">
                                    <CustomerBills bills={customer?.bills} />
                                </TabsContent>

                                <TabsContent value="readings" className="m-0 border-none p-0 outline-none">
                                    <CustomerReadings readings={customer?.readings} />
                                </TabsContent>

                                <TabsContent value="meters" className="m-0 border-none p-0 outline-none">
                                    {!meters.length ? (
                                        <div className="rounded-lg border border-dashed bg-muted/5 p-8 text-center text-sm text-muted-foreground">
                                            <Gauge className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                                            <p>No meter is assigned to this customer.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {meters.map((meter) => (
                                                <div key={meter.id} className="rounded-lg border bg-card p-4 shadow-sm">
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                        <div>
                                                            <p className="font-mono text-sm font-bold text-foreground">
                                                                {meter?.meter_number ?? '—'}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Type: {meter?.meter_type ?? '—'}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={meter?.status === 'active' ? 'success' : 'secondary'} className="w-fit capitalize text-[10px]">
                                                                {meter?.status ?? 'unknown'}
                                                            </Badge>
                                                            <div className="flex items-center gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                                                    onClick={() => {
                                                                        setSelectedMeter(meter);
                                                                        setIsStatusModalOpen(true);
                                                                    }}
                                                                >
                                                                    Status
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                                                                    onClick={() => {
                                                                        setSelectedMeter(meter);
                                                                        setIsReplaceModalOpen(true);
                                                                    }}
                                                                >
                                                                    Replace
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-muted-foreground md:grid-cols-3">
                                                        <p>
                                                            Installed: <span className="font-medium text-foreground">{formatDate(meter?.installation_date)}</span>
                                                        </p>
                                                        <p>
                                                            Last Reading: <span className="font-medium text-foreground">{meter?.last_reading?.reading_value ?? meter?.lastReading?.reading_value ?? '—'}</span>
                                                        </p>
                                                        <p>
                                                            Last Read Date: <span className="font-medium text-foreground">{formatDate(meter?.last_reading?.reading_date ?? meter?.lastReading?.reading_date)}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {meterHistories.length > 0 && (
                                        <div className="mt-8 space-y-4">
                                            <div className="flex items-center gap-2 border-b pb-2">
                                                <Activity className="h-4 w-4 text-muted-foreground" />
                                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Meter Replacement History</h3>
                                            </div>
                                            <div className="space-y-3">
                                                {meterHistories.map((history) => (
                                                    <div key={history.id} className="rounded-lg border bg-muted/20 p-4 text-sm shadow-sm">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                            <div>
                                                                <p className="font-mono font-bold text-foreground">
                                                                    {history.meter?.meter_number ?? 'Unknown Meter'}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    Unassigned on: {formatDate(history.unassigned_at)}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-xs font-medium text-foreground">Reason: {history.reason}</p>
                                                                <p className="text-[10px] text-muted-foreground">Final Reading: {history.final_reading}</p>
                                                            </div>
                                                        </div>
                                                        {history.notes && (
                                                            <div className="mt-2 border-t pt-2 text-[11px] italic text-muted-foreground">
                                                                Notes: {history.notes}
                                                            </div>
                                                        )}
                                                        <div className="mt-2 text-[10px] text-muted-foreground">
                                                            Processed by: {history.replaced_by?.name ?? history.replacedBy?.name ?? 'System'}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="payments" className="m-0 border-none p-0 outline-none">
                                    <CustomerPayments bills={customer?.bills} />
                                </TabsContent>

                                <TabsContent value="charges" className="m-0 border-none p-0 outline-none">
                                    <CustomerServiceCharges serviceCharges={customer?.serviceCharges} />
                                </TabsContent>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
                    </div>
                </div>
            </div>

            <MeterStatusModal
                meter={selectedMeter}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            />

            <ReplaceMeterModal
                meter={selectedMeter}
                unassignedMeters={unassignedMeters}
                isOpen={isReplaceModalOpen}
                onClose={() => setIsReplaceModalOpen(false)}
            />

            <ReadingModal
                customer={customer}
                isOpen={isReadingModalOpen}
                onClose={() => setIsReadingModalOpen(false)}
            />
        </AppLayout>
    );
}
