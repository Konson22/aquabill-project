import CreateInvoiceModal from '@/components/invoices/create-invoice-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    CreditCard,
    FileText,
    Gauge,
    Home,
    Mail,
    MapPin,
    Phone,
    Plus,
    Receipt,
} from 'lucide-react';
import { useMemo, useState } from 'react';

export default function CustomerShow({ customer, zones = [], tariffs = [] }) {
    const [createHomeOpen, setCreateHomeOpen] = useState(false);
    const [selectedHomeId, setSelectedHomeId] = useState(null);
    const {
        data: homeData,
        setData: setHomeData,
        post: postHome,
        processing: homeProcessing,
        errors: homeErrors,
        reset: resetHome,
    } = useForm({
        address: '',
        plot_number: '',
        customer_id: customer.id,
        zone_id: '',
        area_id: '',
        tariff_id: '',
    });

    const availableAreas = useMemo(() => {
        if (!homeData.zone_id) return [];
        const selectedZone = zones.find(
            (z) => z.id.toString() === homeData.zone_id,
        );
        return selectedZone ? selectedZone.areas : [];
    }, [homeData.zone_id, zones]);

    const accountSummary = useMemo(() => {
        let invoiceCount = 0;
        let unpaidInvoices = 0;
        let billCount = 0;
        let overdueBills = 0;
        let paymentCount = 0;
        let totalPaid = 0;
        let totalMeters = 0;

        if (customer.homes) {
            customer.homes.forEach((home) => {
                if (home.meter) {
                    totalMeters++;
                }
                // Invoices
                if (home.invoices) {
                    invoiceCount += home.invoices.length;
                    home.invoices.forEach((inv) => {
                        if (inv.status !== 'paid') {
                            unpaidInvoices++;
                        }
                        if (inv.payments) {
                            paymentCount += inv.payments.length;
                            inv.payments.forEach(
                                (p) => (totalPaid += parseFloat(p.amount || 0)),
                            );
                        }
                    });
                }

                // Bills
                if (home.bills) {
                    billCount += home.bills.length;
                    home.bills.forEach((bill) => {
                        if (bill.status === 'overdue') {
                            overdueBills++;
                        }
                        if (bill.payments) {
                            paymentCount += bill.payments.length;
                            bill.payments.forEach(
                                (p) => (totalPaid += parseFloat(p.amount || 0)),
                            );
                        }
                    });
                }
            });
        }
        return {
            invoiceCount,
            unpaidInvoices,
            billCount,
            overdueBills,
            paymentCount,
            totalPaid,
            totalMeters,
        };
    }, [customer.homes]);

    const allBills = useMemo(() => {
        return (customer.homes || [])
            .flatMap((home) =>
                (home.bills || []).map((bill) => ({
                    ...bill,
                    home_address: home.address,
                })),
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [customer.homes]);

    const allInvoices = useMemo(() => {
        return (customer.homes || [])
            .flatMap((home) =>
                (home.invoices || []).map((invoice) => ({
                    ...invoice,
                    home_address: home.address,
                })),
            )
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [customer.homes]);

    const allPayments = useMemo(() => {
        const fromInvoices = (customer.homes || []).flatMap((home) =>
            (home.invoices || []).flatMap((inv) =>
                (inv.payments || []).map((p) => ({
                    ...p,
                    source: `Invoice #${inv.invoice_number}`,
                    date: p.payment_date,
                    home_address: home.address,
                })),
            ),
        );
        const fromBills = (customer.homes || []).flatMap((home) =>
            (home.bills || []).flatMap((bill) =>
                (bill.payments || []).map((p) => ({
                    ...p,
                    source: `Bill #${bill.bill_number}`,
                    date: p.payment_date,
                    home_address: home.address,
                })),
            ),
        );
        return [...fromInvoices, ...fromBills].sort(
            (a, b) => new Date(b.date) - new Date(a.date),
        );
    }, [customer.homes]);

    const handleCreateHome = (e) => {
        e.preventDefault();
        postHome(route('homes.store'), {
            onSuccess: () => {
                setCreateHomeOpen(false);
                resetHome();
            },
        });
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
                <Card className="mb-6 p-6">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                        {/* Identity & Contact */}
                        <div className="flex items-start gap-5">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-bold text-white shadow-md">
                                {customer.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                        {customer.name}
                                    </h1>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 text-[10px] font-medium tracking-wide text-green-700 uppercase ring-1 ring-green-600/20 ring-inset">
                                        Active
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{customer.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span>{customer.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                        <span
                                            className="max-w-[200px] truncate"
                                            title={customer.address}
                                        >
                                            {customer.address || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-muted-foreground/60">
                                    Member since{' '}
                                    {new Date(
                                        customer.created_at,
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats - Compact Row */}
                        <div className="flex flex-wrap gap-3">
                            <div className="group flex min-w-[100px] flex-col rounded-lg border bg-card px-4 py-2 transition-colors hover:border-orange-100 hover:bg-orange-50/50">
                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase group-hover:text-orange-600/80">
                                    Unpaid
                                </span>
                                <div className="mt-0.5 flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-foreground group-hover:text-orange-700">
                                        {accountSummary.unpaidInvoices}
                                    </span>
                                    <span className="text-xs text-muted-foreground/60">
                                        / {accountSummary.invoiceCount}
                                    </span>
                                </div>
                            </div>

                            <div className="group flex min-w-[100px] flex-col rounded-lg border bg-card px-4 py-2 transition-colors hover:border-yellow-100 hover:bg-yellow-50/50">
                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase group-hover:text-yellow-600/80">
                                    Overdue
                                </span>
                                <div className="mt-0.5 flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-foreground group-hover:text-yellow-700">
                                        {accountSummary.overdueBills}
                                    </span>
                                    <span className="text-xs text-muted-foreground/60">
                                        / {accountSummary.billCount}
                                    </span>
                                </div>
                            </div>

                            <div className="group flex min-w-[100px] flex-col rounded-lg border bg-card px-4 py-2 transition-colors hover:border-blue-100 hover:bg-blue-50/50">
                                <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase group-hover:text-blue-600/80">
                                    Properties
                                </span>
                                <div className="mt-0.5">
                                    <span className="text-xl font-bold text-foreground group-hover:text-blue-700">
                                        {customer.homes?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="overflow-hidden border-none shadow-lg">
                    <Tabs defaultValue="homes" className="w-full">
                        <div className="border-b bg-muted/5 px-6">
                            <TabsList className="h-auto w-full justify-start gap-2 rounded-none bg-transparent p-0">
                                <TabsTrigger
                                    value="homes"
                                    className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-4 pt-3 pb-3 font-medium text-muted-foreground shadow-none transition-none hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Homes
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
                        {/* Homes Tab */}
                        <TabsContent value="homes" className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold">
                                    <Home className="h-4 w-4" />
                                    Properties
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Dialog
                                        open={createHomeOpen}
                                        onOpenChange={setCreateHomeOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Home
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Add New Property
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Link a new home/property to{' '}
                                                    {customer.name}.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                onSubmit={handleCreateHome}
                                                className="grid gap-4 py-4"
                                            >
                                                <div className="grid gap-2">
                                                    <Label htmlFor="address">
                                                        Address
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        value={homeData.address}
                                                        onChange={(e) =>
                                                            setHomeData(
                                                                'address',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. 123 Main St"
                                                    />
                                                    {homeErrors.address && (
                                                        <span className="text-xs text-red-500">
                                                            {homeErrors.address}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="plot_number">
                                                        Plot Number
                                                    </Label>
                                                    <Input
                                                        id="plot_number"
                                                        value={
                                                            homeData.plot_number
                                                        }
                                                        onChange={(e) =>
                                                            setHomeData(
                                                                'plot_number',
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="e.g. Plot 45B"
                                                    />
                                                    {homeErrors.plot_number && (
                                                        <span className="text-xs text-red-500">
                                                            {
                                                                homeErrors.plot_number
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="zone">
                                                        Zone
                                                    </Label>
                                                    <Select
                                                        value={homeData.zone_id}
                                                        onValueChange={(val) =>
                                                            setHomeData(
                                                                'zone_id',
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Zone" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {zones.map(
                                                                (zone) => (
                                                                    <SelectItem
                                                                        key={
                                                                            zone.id
                                                                        }
                                                                        value={zone.id.toString()}
                                                                    >
                                                                        {
                                                                            zone.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {homeErrors.zone_id && (
                                                        <span className="text-xs text-red-500">
                                                            {homeErrors.zone_id}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="area">
                                                        Area
                                                    </Label>
                                                    <Select
                                                        value={homeData.area_id}
                                                        onValueChange={(val) =>
                                                            setHomeData(
                                                                'area_id',
                                                                val,
                                                            )
                                                        }
                                                        disabled={
                                                            !homeData.zone_id
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Area" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableAreas.map(
                                                                (area) => (
                                                                    <SelectItem
                                                                        key={
                                                                            area.id
                                                                        }
                                                                        value={area.id.toString()}
                                                                    >
                                                                        {
                                                                            area.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {homeErrors.area_id && (
                                                        <span className="text-xs text-red-500">
                                                            {homeErrors.area_id}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="tariff">
                                                        Tariff
                                                    </Label>
                                                    <Select
                                                        value={
                                                            homeData.tariff_id
                                                        }
                                                        onValueChange={(val) =>
                                                            setHomeData(
                                                                'tariff_id',
                                                                val,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Tariff" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {tariffs.map(
                                                                (tariff) => (
                                                                    <SelectItem
                                                                        key={
                                                                            tariff.id
                                                                        }
                                                                        value={tariff.id.toString()}
                                                                    >
                                                                        {
                                                                            tariff.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {homeErrors.tariff_id && (
                                                        <span className="text-xs text-red-500">
                                                            {
                                                                homeErrors.tariff_id
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                                <DialogFooter>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            homeProcessing
                                                        }
                                                    >
                                                        Create Home
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                            {customer.homes && customer.homes.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>
                                                    Plot Number
                                                </TableHead>
                                                <TableHead>Address</TableHead>
                                                <TableHead>Meter</TableHead>
                                                <TableHead>
                                                    Last Reading
                                                </TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customer.homes.map((home) => {
                                                const readings = Array.from(
                                                    new Map(
                                                        [
                                                            ...(home.readings ||
                                                                []),
                                                            ...(home.meter
                                                                ?.readings ||
                                                                []),
                                                        ].map((r) => [r.id, r]),
                                                    ).values(),
                                                ).sort(
                                                    (a, b) =>
                                                        new Date(
                                                            b.reading_date,
                                                        ) -
                                                        new Date(
                                                            a.reading_date,
                                                        ),
                                                );
                                                const lastReading =
                                                    readings.length > 0
                                                        ? readings[0]
                                                        : null;

                                                return (
                                                    <TableRow
                                                        key={home.id}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {home.plot_number}
                                                        </TableCell>
                                                        <TableCell>
                                                            {home.address}
                                                        </TableCell>
                                                        <TableCell>
                                                            {home.meter ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Gauge className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-mono text-xs">
                                                                        {
                                                                            home
                                                                                .meter
                                                                                .meter_number
                                                                        }
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground italic">
                                                                    No Meter
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {lastReading
                                                                ? lastReading.current_reading
                                                                : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'customers.home',
                                                                            home.id,
                                                                        )}
                                                                    >
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                                <CreateInvoiceModal
                                                                    trigger={
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 px-2 lg:px-3"
                                                                        >
                                                                            <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                                            Invoice
                                                                        </Button>
                                                                    }
                                                                    initialHome={
                                                                        home
                                                                    }
                                                                />
                                                                {!home.meter && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'meters.assign',
                                                                                home.id,
                                                                            )}
                                                                        >
                                                                            <Gauge className="mr-2 h-3 w-3" />
                                                                            Assign
                                                                            Meter
                                                                        </Link>
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                                        <Home className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">
                                        No properties found
                                    </h3>
                                    <p className="mt-2 mb-4 max-w-sm text-sm text-muted-foreground">
                                        This customer doesn't have any linked
                                        properties yet. Add a property to get
                                        started.
                                    </p>
                                    <Button
                                        onClick={() => setCreateHomeOpen(true)}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Home
                                    </Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Bills Tab */}
                        <TabsContent value="bills" className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold">
                                    <Receipt className="h-4 w-4" />
                                    All Bills
                                </h2>
                            </div>
                            {allBills.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>
                                                    Bill Number
                                                </TableHead>
                                                <TableHead>Property</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allBills.map((bill) => (
                                                <TableRow
                                                    key={bill.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        {bill.bill_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {bill.home_address}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(
                                                            bill.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            bill.created_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                                bill.status ===
                                                                'paid'
                                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                                    : bill.status ===
                                                                        'overdue'
                                                                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                                                                      : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                            }`}
                                                        >
                                                            {bill.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                bill.status.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Receipt className="mb-4 h-10 w-10 opacity-20" />
                                    <p>No bills found for this customer.</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Invoices Tab */}
                        <TabsContent value="invoices" className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold">
                                    <FileText className="h-4 w-4" />
                                    All Invoices
                                </h2>
                            </div>
                            {allInvoices.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>
                                                    Invoice Number
                                                </TableHead>
                                                <TableHead>Property</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allInvoices.map((invoice) => (
                                                <TableRow
                                                    key={invoice.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        {invoice.invoice_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.home_address}
                                                    </TableCell>
                                                    <TableCell>
                                                        {invoice.type}
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatCurrency(
                                                            invoice.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            invoice.created_at,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                                invoice.status ===
                                                                'paid'
                                                                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                                                                    : invoice.status ===
                                                                        'overdue'
                                                                      ? 'bg-red-50 text-red-700 ring-red-600/20'
                                                                      : 'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                                                            }`}
                                                        >
                                                            {invoice.status
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                invoice.status.slice(
                                                                    1,
                                                                )}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <FileText className="mb-4 h-10 w-10 opacity-20" />
                                    <p>No invoices found for this customer.</p>
                                </div>
                            )}
                        </TabsContent>

                        {/* Payments Tab */}
                        <TabsContent value="payments" className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-lg font-semibold">
                                    <CreditCard className="h-4 w-4" />
                                    Payment History
                                </h2>
                            </div>
                            {allPayments.length > 0 ? (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Property</TableHead>
                                                <TableHead>Amount</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Method</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allPayments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell className="font-mono font-medium">
                                                        {
                                                            payment.reference_number
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                                                            {payment.source}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {payment.home_address}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-green-600">
                                                        {new Intl.NumberFormat(
                                                            'en-US',
                                                            {
                                                                style: 'currency',
                                                                currency: 'USD',
                                                            },
                                                        ).format(
                                                            payment.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(
                                                            payment.date,
                                                        ).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="capitalize">
                                                        {payment.payment_method}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <CreditCard className="mb-4 h-10 w-10 opacity-20" />
                                    <p>No payments found for this customer.</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>

            {/* Removed AssignMeterModal */}
        </AppLayout>
    );
}
