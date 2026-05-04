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
    BellOff,
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
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';

export default function Show({ customer, unassignedMeters = [] }) {
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
    const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('customer-info');

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
    const bills = customer?.bills ?? [];
    const totalBills = bills.length;
    const paidBills = bills.filter((bill) => bill?.status === 'paid').length;
    const unpaidBills = bills.filter((bill) => bill?.status === 'pending' || bill?.status === 'partial').length;
    const overdueBills = bills.filter((bill) => bill?.status === 'overdue').length;
    const meters = customer?.meters ?? [];
    const meterHistories = customer?.meterHistories ?? customer?.meter_histories ?? [];
    const unpaidAmount = bills
        .filter((bill) => bill?.status !== 'paid')
        .reduce((carry, bill) => carry + Number(bill?.total_amount ?? bill?.total ?? 0), 0);

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

                {/* Header */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            {customer?.name ?? 'Customer'}
                        </h1>
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
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Zone: {customer?.zone?.name ?? '—'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest font-black">
                            Tariff: {customer?.tariff?.name ?? '—'}
                        </Badge>
                    </div>
                </div>

                {/* Billing summary cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                Total Bills
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black">{totalBills}</p>
                            <p className="text-xs text-muted-foreground">All issued invoices</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                Unpaid Bills
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black">{unpaidBills}</p>
                            <p className="text-xs text-muted-foreground">Current outstanding invoices</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                Overdue Bills
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-black">{overdueBills}</p>
                            <p className="text-xs text-muted-foreground">Past due invoices</p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                                Amount Due
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-black font-mono">{formatCurrency(unpaidAmount)}</p>
                            <p className="text-xs text-muted-foreground">{paidBills} paid bill(s)</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Data Tabs */}
                <Card className="rounded-xl border shadow-sm">
                    <CardContent className="p-4 md:p-6">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-lg bg-muted/40 p-1 md:grid-cols-7">
                                <TabsTrigger value="customer-info" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <User className="mr-2 h-4 w-4" />
                                    Info
                                </TabsTrigger>
                                <TabsTrigger value="disconnections" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <PowerOff className="mr-2 h-4 w-4" />
                                    Status
                                </TabsTrigger>
                                <TabsTrigger value="bills" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Bills
                                </TabsTrigger>
                                <TabsTrigger value="readings" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Droplet className="mr-2 h-4 w-4" />
                                    Readings
                                </TabsTrigger>
                                <TabsTrigger value="meters" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Gauge className="mr-2 h-4 w-4" />
                                    Meters
                                </TabsTrigger>
                                <TabsTrigger value="payments" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Payments
                                </TabsTrigger>
                                <TabsTrigger value="charges" className="py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Wrench className="mr-2 h-4 w-4" />
                                    Charges
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-5">
                                <TabsContent value="customer-info" className="m-0 border-none p-0 outline-none">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <Card className="rounded-xl shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    Contact
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1">
                                                <p className="text-sm font-medium">{customer?.phone ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground">{customer?.email ?? 'No email'}</p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                                    Address
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1">
                                                <p className="text-sm font-medium leading-relaxed">{customer?.address ?? '—'}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Plot: {customer?.plot_no ?? '—'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    National ID: {customer?.national_id ?? '—'}
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card className="rounded-xl shadow-sm">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-base flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    Connection
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-1">
                                                <p className="text-sm font-medium">{formatDate(customer?.connection_date)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Created: {formatDate(customer?.created_at)}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                <TabsContent value="disconnections" className="m-0 border-none p-0 outline-none">
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
