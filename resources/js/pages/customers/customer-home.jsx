import UpdateMeterStatusModal from '@/components/app/update-meter-status-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Banknote,
    Calendar,
    Clock,
    Droplets,
    FileText,
    History,
    Home,
    MapPin,
    RefreshCw,
    Settings2,
    User,
    Zap,
} from 'lucide-react';

export default function CustomerHome({ home, overview }) {
    // Removal of replaceMeterOpen state as we now use a dedicated page
    const formatDate = (dateString, options = {}) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            ...options,
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
            case 'active':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'pending':
            case 'unpaid':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'overdue':
            case 'inactive':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Customers', href: route('customers.index') },
                {
                    title: home.customer?.name,
                    href: route('customers.show', home.customer_id),
                },
                { title: home.address, href: '#' },
            ]}
        >
            <Head title={`Home: ${home.address}`} />

            <div className="flex flex-col gap-6">
                {/* Hero Section */}
                {/* Hero Section */}
                <Card className="overflow-hidden">
                    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-start md:justify-between">
                        <div className="flex gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border bg-blue-50 text-blue-600">
                                <Home className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl font-bold tracking-tight">
                                        {home.address}
                                    </h1>
                                    <Badge
                                        variant="secondary"
                                        className="h-5 font-normal"
                                    >
                                        Plot: {home.plot_number || 'N/A'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>
                                            {home.zone?.name}, {home.area?.name}
                                        </span>
                                    </div>
                                    <span className="text-border">|</span>
                                    <span>
                                        Tariff:{' '}
                                        <span className="font-medium text-foreground">
                                            {home.tariff?.name || '-'}
                                        </span>
                                    </span>
                                    {home.customer && (
                                        <>
                                            <span className="text-border">
                                                |
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <User className="h-3.5 w-3.5" />
                                                <Link
                                                    href={route(
                                                        'customers.show',
                                                        home.customer.id,
                                                    )}
                                                    className="font-medium hover:text-primary hover:underline"
                                                >
                                                    {home.customer.name}
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" asChild>
                            <Link
                                href={route('customers.show', home.customer_id)}
                            >
                                <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                                Back to Customer
                            </Link>
                        </Button>
                    </div>
                </Card>

                {/* Tabs Section */}
                <Tabs defaultValue="overview" className="w-full">
                    <Card>
                        <CardHeader className="border-b px-6 py-4">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <CardTitle>Property Details</CardTitle>
                                <TabsList className="h-9 w-full justify-start rounded-lg bg-muted/50 p-1 md:w-auto">
                                    <TabsTrigger
                                        value="overview"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="bills"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Bills
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="payments"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Payments
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="readings"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Readings
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="invoices"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Invoices
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="meter"
                                        className="h-7 px-4 text-xs"
                                    >
                                        Meter Info
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <TabsContent
                                value="overview"
                                className="mt-0 animate-in fade-in-50"
                            >
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card className="bg-muted/30 shadow-none transition-all hover:bg-muted/50 hover:shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Last Reading
                                            </CardTitle>
                                            <Activity className="h-4 w-4 text-sky-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {overview.last_reading
                                                    ? overview.last_reading
                                                          .current_reading
                                                    : 'N/A'}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {overview.last_reading
                                                    ? formatDate(
                                                          overview.last_reading
                                                              .reading_date,
                                                      )
                                                    : 'No readings recorded'}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-muted/30 shadow-none transition-all hover:bg-muted/50 hover:shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Outstanding Bills
                                            </CardTitle>
                                            <FileText className="h-4 w-4 text-amber-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-amber-600">
                                                {formatCurrency(
                                                    overview.unpaid_bills_amount ||
                                                        0,
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                {overview.unpaid_bills_count}{' '}
                                                unpaid bill(s)
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-muted/30 shadow-none transition-all hover:bg-muted/50 hover:shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Pending Invoices
                                            </CardTitle>
                                            <AlertCircle className="h-4 w-4 text-orange-600" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-orange-600">
                                                {overview.unpaid_invoices_count}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Invoices pending payment
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-muted/30 shadow-none transition-all hover:bg-muted/50 hover:shadow-sm">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Meter Status
                                            </CardTitle>
                                            <Zap
                                                className={`h-4 w-4 ${home.meter?.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}
                                            />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="truncate text-xl font-bold">
                                                {home.meter
                                                    ? home.meter.meter_number
                                                    : 'No Meter'}
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className={`mt-1 capitalize ${home.meter?.status === 'active' ? 'bg-green-100 text-green-700' : ''}`}
                                            >
                                                {home.meter
                                                    ? home.meter.status
                                                    : 'Not Assigned'}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="bills"
                                className="mt-0 animate-in fade-in-50"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-none font-medium tracking-tight">
                                                Billing History
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                View payment status and billing
                                                statements.
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Download Report
                                        </Button>
                                    </div>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>
                                                        Bill #
                                                    </TableHead>
                                                    <TableHead>
                                                        Billing Period
                                                    </TableHead>
                                                    <TableHead>
                                                        Due Date
                                                    </TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Balance
                                                    </TableHead>
                                                    <TableHead>
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {home.bills &&
                                                home.bills.length > 0 ? (
                                                    home.bills.map((bill) => (
                                                        <TableRow
                                                            key={bill.id}
                                                            className="hover:bg-muted/50"
                                                        >
                                                            <TableCell className="font-mono text-sm font-medium">
                                                                <Link
                                                                    href={route(
                                                                        'bills.show',
                                                                        bill.id,
                                                                    )}
                                                                    className="text-primary hover:underline"
                                                                >
                                                                    {
                                                                        bill.bill_number
                                                                    }
                                                                </Link>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {
                                                                    bill.billing_period
                                                                }
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                                                    {formatDate(
                                                                        bill.due_date,
                                                                    )}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {formatCurrency(
                                                                    bill.total_amount,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatCurrency(
                                                                    bill.current_balance,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={getStatusColor(
                                                                        bill.status,
                                                                    )}
                                                                >
                                                                    {
                                                                        bill.status
                                                                    }
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    asChild
                                                                >
                                                                    <Link
                                                                        href={route(
                                                                            'bills.show',
                                                                            bill.id,
                                                                        )}
                                                                    >
                                                                        View
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            className="h-32 text-center text-muted-foreground"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <FileText className="h-8 w-8 opacity-20" />
                                                                <p>
                                                                    No billing
                                                                    history
                                                                    found
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="payments"
                                className="mt-0 animate-in fade-in-50"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-none font-medium tracking-tight">
                                                Payment History
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Record of all payments made for
                                                this property.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>
                                                        Receipt #
                                                    </TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>
                                                        Method
                                                    </TableHead>
                                                    <TableHead>
                                                        Reference
                                                    </TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Recorded By
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {home.payments &&
                                                home.payments.length > 0 ? (
                                                    home.payments.map(
                                                        (payment) => (
                                                            <TableRow
                                                                key={payment.id}
                                                                className="hover:bg-muted/50"
                                                            >
                                                                <TableCell className="font-mono font-medium">
                                                                    {
                                                                        payment.receipt_number
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatDate(
                                                                        payment.payment_date,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="capitalize">
                                                                    {
                                                                        payment.payment_method
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                                    {payment.reference_number ||
                                                                        '-'}
                                                                </TableCell>
                                                                <TableCell className="font-bold text-green-600">
                                                                    {formatCurrency(
                                                                        payment.amount,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {payment
                                                                        .recorded_by
                                                                        ?.name ||
                                                                        'System'}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'payments.show',
                                                                                payment.id,
                                                                            )}
                                                                        >
                                                                            View
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={7}
                                                            className="h-32 text-center text-muted-foreground"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Banknote className="h-8 w-8 opacity-20" />
                                                                <p>
                                                                    No payment
                                                                    history
                                                                    found
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="readings"
                                className="mt-0 animate-in fade-in-50"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-none font-medium tracking-tight">
                                                Meter Readings
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Historical usage data and
                                                reading logs.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>
                                                        Date Recorded
                                                    </TableHead>
                                                    <TableHead>
                                                        Previous Reading
                                                    </TableHead>
                                                    <TableHead>
                                                        Current Reading
                                                    </TableHead>
                                                    <TableHead>
                                                        Consumption
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Recorded By
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {home.readings &&
                                                home.readings.length > 0 ? (
                                                    home.readings.map(
                                                        (reading) => (
                                                            <TableRow
                                                                key={reading.id}
                                                                className="hover:bg-muted/50"
                                                            >
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">
                                                                            {formatDate(
                                                                                reading.reading_date,
                                                                            )}
                                                                        </span>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            <Clock className="mr-1 inline h-3 w-3" />
                                                                            {new Date(
                                                                                reading.created_at,
                                                                            ).toLocaleTimeString(
                                                                                [],
                                                                                {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit',
                                                                                },
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="font-mono text-muted-foreground">
                                                                    {
                                                                        reading.previous_reading
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="font-mono font-bold">
                                                                    {
                                                                        reading.current_reading
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="gap-1"
                                                                    >
                                                                        <Droplets className="h-3 w-3 text-sky-500" />
                                                                        {reading.consumption_units ||
                                                                            (
                                                                                reading.current_reading -
                                                                                reading.previous_reading
                                                                            ).toFixed(
                                                                                2,
                                                                            )}{' '}
                                                                        Units
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right text-muted-foreground">
                                                                    {reading
                                                                        .reader
                                                                        ?.name ||
                                                                        'System'}
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={5}
                                                            className="h-32 text-center text-muted-foreground"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <History className="h-8 w-8 opacity-20" />
                                                                <p>
                                                                    No readings
                                                                    recorded yet
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="invoices"
                                className="mt-0 animate-in fade-in-50"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-none font-medium tracking-tight">
                                                Invoices & Charges
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                One-time charges, installation
                                                fees, and other invoices.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>
                                                        Invoice #
                                                    </TableHead>
                                                    <TableHead>
                                                        Description
                                                    </TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="text-right">
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {home.invoices &&
                                                home.invoices.length > 0 ? (
                                                    home.invoices.map(
                                                        (invoice) => (
                                                            <TableRow
                                                                key={invoice.id}
                                                            >
                                                                <TableCell className="font-mono font-medium">
                                                                    {
                                                                        invoice.invoice_number
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">
                                                                            {
                                                                                invoice.type
                                                                            }
                                                                        </span>
                                                                        <span className="max-w-[200px] truncate text-xs text-muted-foreground">
                                                                            {invoice.description ||
                                                                                'No description'}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatDate(
                                                                        invoice.created_at,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {formatCurrency(
                                                                        invoice.amount,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className={getStatusColor(
                                                                            invoice.status,
                                                                        )}
                                                                    >
                                                                        {
                                                                            invoice.status
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        asChild
                                                                    >
                                                                        <Link
                                                                            href={route(
                                                                                'invoices.show',
                                                                                invoice.id,
                                                                            )}
                                                                        >
                                                                            View
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={6}
                                                            className="h-32 text-center text-muted-foreground"
                                                        >
                                                            <div className="flex flex-col items-center gap-2">
                                                                <Banknote className="h-8 w-8 opacity-20" />
                                                                <p>
                                                                    No invoices
                                                                    found
                                                                </p>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent
                                value="meter"
                                className="mt-0 animate-in fade-in-50"
                            >
                                {/* Removal of AssignMeterModal component */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                        <div className="flex flex-col space-y-1.5 p-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="flex items-center gap-2 leading-none font-semibold tracking-tight">
                                                    <Zap className="h-5 w-5 text-amber-500" />
                                                    Meter Details
                                                </h3>
                                                {home.meter && (
                                                    <div className="flex items-center gap-2">
                                                        <UpdateMeterStatusModal
                                                            meter={home.meter}
                                                            trigger={
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Settings2 className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                                    Status
                                                                </Button>
                                                            }
                                                        />
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
                                                                <RefreshCw className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                                                                Replace
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-6 pt-0">
                                            {home.meter ? (
                                                <div className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                Serial Number
                                                            </p>
                                                            <p className="font-mono text-lg font-bold">
                                                                {
                                                                    home.meter
                                                                        .meter_number
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                Detailed Status
                                                            </p>
                                                            <Badge
                                                                className={getStatusColor(
                                                                    home.meter
                                                                        .status,
                                                                )}
                                                            >
                                                                {
                                                                    home.meter
                                                                        .status
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                Meter Type
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">
                                                                    {
                                                                        home
                                                                            .meter
                                                                            .meter_type
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-muted-foreground">
                                                                Installation
                                                                Date
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                <span>
                                                                    {formatDate(
                                                                        home
                                                                            .meter
                                                                            .installation_date,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg bg-muted p-4">
                                                        <h4 className="mb-2 text-sm font-semibold">
                                                            Technical Specs
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <span className="text-muted-foreground">
                                                                Model:
                                                            </span>
                                                            <span>N/A</span>
                                                            <span className="text-muted-foreground">
                                                                Manufacturer:
                                                            </span>
                                                            <span>N/A</span>
                                                            <span className="text-muted-foreground">
                                                                Last Serviced:
                                                            </span>
                                                            <span>Never</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                                    <div className="rounded-full bg-muted p-4">
                                                        <Zap className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="mt-4 text-lg font-semibold">
                                                        No Meter Assigned
                                                    </h3>
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        This property does not
                                                        currently have a meter
                                                        assigned.
                                                    </p>
                                                    <Button
                                                        className="mt-4"
                                                        asChild
                                                    >
                                                        <Link
                                                            href={route(
                                                                'meters.assign',
                                                                home.id,
                                                            )}
                                                        >
                                                            <Zap className="mr-2 h-4 w-4" />
                                                            Assign Meter
                                                        </Link>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                                        <div className="flex flex-col space-y-1.5 p-6">
                                            <h3 className="leading-none font-semibold tracking-tight">
                                                Usage Statistics
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Monthly consumption trends
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center p-6 py-12 pt-0">
                                            <div className="text-center text-muted-foreground">
                                                <Activity className="mx-auto mb-4 h-12 w-12 opacity-20" />
                                                <p>
                                                    Usage chart visualization
                                                    coming soon.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 rounded-xl border bg-card text-card-foreground shadow-sm md:col-span-2">
                                        <div className="flex flex-col space-y-1.5 p-6">
                                            <h3 className="leading-none font-semibold tracking-tight">
                                                Meter Assignment History
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Previous meters assigned to this
                                                property
                                            </p>
                                        </div>
                                        <div className="p-6 pt-0">
                                            <div className="rounded-md border">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50">
                                                            <TableHead>
                                                                Meter Number
                                                            </TableHead>
                                                            <TableHead>
                                                                Type
                                                            </TableHead>
                                                            <TableHead>
                                                                Assigned Date
                                                            </TableHead>
                                                            <TableHead>
                                                                Removed Date
                                                            </TableHead>
                                                            <TableHead>
                                                                Final Reading
                                                            </TableHead>
                                                            <TableHead>
                                                                Reason
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Merged By
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {home.meter_history &&
                                                        home.meter_history
                                                            .length > 0 ? (
                                                            home.meter_history.map(
                                                                (history) => (
                                                                    <TableRow
                                                                        key={
                                                                            history.id
                                                                        }
                                                                        className="hover:bg-muted/50"
                                                                    >
                                                                        <TableCell className="font-medium">
                                                                            {history
                                                                                .meter
                                                                                ?.meter_number ||
                                                                                'Unknown'}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">
                                                                                {history
                                                                                    .meter
                                                                                    ?.meter_type ||
                                                                                    'N/A'}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatDate(
                                                                                history.assigned_at,
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            {formatDate(
                                                                                history.unassigned_at,
                                                                            )}
                                                                        </TableCell>
                                                                        <TableCell className="font-mono">
                                                                            {
                                                                                history.final_reading
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="capitalize">
                                                                            {history.reason ||
                                                                                '-'}
                                                                        </TableCell>
                                                                        <TableCell className="text-right text-sm text-muted-foreground">
                                                                            {history
                                                                                .replaced_by
                                                                                ?.name ||
                                                                                'System'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell
                                                                    colSpan={7}
                                                                    className="h-24 text-center text-muted-foreground"
                                                                >
                                                                    No meter
                                                                    history
                                                                    records
                                                                    found.
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>
                </Tabs>
            </div>
        </AppLayout>
    );
}
