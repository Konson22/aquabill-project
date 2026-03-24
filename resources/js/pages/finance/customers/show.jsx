import CreateInvoiceModal from '@/components/invoices/create-invoice-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    CreditCard,
    FileText,
    Gauge,
    LayoutDashboard,
    Receipt,
} from 'lucide-react';
import { useMemo } from 'react';
import {
    BillsTab,
    InvoicesTab,
    OverviewTab,
    PaymentsTab,
    ReadingsTab,
} from '../../admin/customers/components';

export default function CustomerShow({ customer, zones = [], tariffs = [] }) {
    const accountSummary = useMemo(() => {
        const bills = customer.bills || [];
        const invoices = customer.invoices || [];
        const metersCount = customer.meters?.length ?? (customer.meter ? 1 : 0);
        const unpaidInvoices = invoices.filter(
            (inv) => inv.status !== 'paid',
        ).length;
        const overdueBills = bills.filter((bill) => {
            const isOverdue =
                new Date(bill.due_date) < new Date() &&
                (bill.status === 'pending' || bill.status === 'partial paid');
            return bill.status === 'overdue' || isOverdue;
        }).length;
        let paymentCount = 0;
        let totalPaid = 0;
        bills.forEach((bill) => {
            if (bill.payments) {
                paymentCount += bill.payments.length;
                bill.payments.forEach(
                    (p) => (totalPaid += parseFloat(p.amount || 0)),
                );
            }
        });
        totalPaid += (invoices || []).reduce(
            (sum, inv) => sum + parseFloat(inv.amount_paid || 0),
            0,
        );
        return {
            invoiceCount: invoices.length,
            unpaidInvoices,
            billCount: bills.length,
            overdueBills,
            paymentCount,
            totalPaid,
            totalMeters: metersCount,
        };
    }, [customer.bills, customer.invoices, customer.meter, customer.meters]);

    const allBills = useMemo(() => {
        return (customer.bills || [])
            .map((bill) => ({ ...bill, home_address: customer.address }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [customer.bills, customer.address]);

    const allInvoices = useMemo(() => {
        return (customer.invoices || [])
            .map((inv) => ({ ...inv, home_address: customer.address }))
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [customer.invoices, customer.address]);

    const allPayments = useMemo(() => {
        const fromBills = (customer.bills || []).flatMap((bill) =>
            (bill.payments || []).map((p) => ({
                ...p,
                source: `Bill #${bill.bill_number}`,
                source_href: route('bills.show', bill.id),
                date: p.payment_date,
                meter_number:
                    bill.meter_reading?.meter?.meter_number ||
                    customer.meter?.meter_number ||
                    '—',
            })),
        );
        const fromInvoices = (customer.invoices || []).flatMap((inv) =>
            (inv.payments || []).map((p) => ({
                ...p,
                source: `Invoice #${inv.invoice_number}`,
                source_href: route('invoices.show', inv.id),
                date: p.payment_date,
                meter_number: '—',
            })),
        );
        return [...fromBills, ...fromInvoices].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
    }, [customer.bills, customer.invoices, customer.meter]);

    const allReadings = useMemo(() => {
        return (customer.readings || []).sort(
            (a, b) => new Date(b.reading_date) - new Date(a.reading_date),
        );
    }, [customer.readings]);

    const getMeterNumber = (reading) => {
        if (reading.meter?.meter_number) return reading.meter.meter_number;
        if (reading.meter_id && customer.meter?.id === reading.meter_id)
            return customer.meter?.meter_number;
        if (reading.meter_id && customer.meters?.length)
            return customer.meters.find((m) => m.id === reading.meter_id)
                ?.meter_number;
        return '—';
    };

    const getBillForReading = (reading) => {
        if (reading.bill) return reading.bill;
        return (customer.bills || []).find(
            (b) => b.meter_reading_id === reading.id,
        );
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Customers',
            href: route('customers.index'),
        },
        {
            title: customer.name,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Customer - ${customer.name}`} />

            <div className="">
                {/* Main Profile Card */}
                <div className="overflow-hidden rounded-lg border bg-card">
                    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                        {/* Left: Customer identity */}
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <h1 className="text-base font-semibold text-foreground">
                                {customer.name}
                            </h1>
                            <p className="truncate">
                                {[customer.phone, customer.email]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </p>
                            <p className="truncate">
                                {[customer.plot_number, customer.zone?.name, customer.area?.name]
                                    .filter(Boolean)
                                    .join(' · ') || '—'}
                            </p>
                            <p className="truncate">
                                {customer.address || '—'}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">
                                    Joined:
                                </span>{' '}
                                {new Date(customer.created_at).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            <CreateInvoiceModal
                                trigger={
                                    <Button size="sm" variant="secondary">
                                        <FileText className="mr-2 h-3.5 w-3.5" />
                                        Create Invoice
                                    </Button>
                                }
                                initialCustomer={{
                                    id: customer.id,
                                    address: customer.address,
                                    name: customer.name,
                                    meter: customer.meter,
                                }}
                            />
                            {(!customer.meter ||
                                (customer.meters && customer.meters.length === 0)) && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('meters.assign', customer.id)}>
                                        <Gauge className="mr-2 h-3 w-3" />
                                        Assign Meter
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <Card className="overflow-hidden border-none shadow-lg">
                    <Tabs defaultValue="overview" className="w-full">
                        <div className="border-b bg-muted/5 px-6">
                            <TabsList className="h-auto w-full justify-start gap-2 rounded-none bg-transparent p-0">
                                <TabsTrigger
                                    value="overview"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger
                                    value="readings"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <Activity className="mr-2 h-4 w-4" />
                                    Readings
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bills"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <Receipt className="mr-2 h-4 w-4" />
                                    Bills
                                </TabsTrigger>
                                <TabsTrigger
                                    value="invoices"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    Invoices
                                </TabsTrigger>
                                <TabsTrigger
                                    value="payments"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    Payments
                                </TabsTrigger>
                            </TabsList>
                        </div>
                        <TabsContent value="overview" className="p-0">
                            <OverviewTab
                                accountSummary={accountSummary}
                                customer={customer}
                            />
                        </TabsContent>
                        <TabsContent value="readings" className="p-6">
                            <ReadingsTab
                                allReadings={allReadings}
                                getMeterNumber={getMeterNumber}
                                getBillForReading={getBillForReading}
                            />
                        </TabsContent>
                        <TabsContent value="bills" className="p-6">
                            <BillsTab allBills={allBills} />
                        </TabsContent>
                        <TabsContent value="invoices" className="p-6">
                            <InvoicesTab allInvoices={allInvoices} />
                        </TabsContent>
                        <TabsContent value="payments" className="p-6">
                            <PaymentsTab allPayments={allPayments} />
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>

            {/* Removed AssignMeterModal */}
        </AppLayout>
    );
}
