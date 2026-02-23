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
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    FileText,
    MapPin,
    Printer,
    Receipt,
    User,
} from 'lucide-react';

export default function PaymentShow({ payment }) {
    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Payments',
            href: route('payments'),
        },
        {
            title: payment.reference_number || 'Payment Details',
            href: '#',
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const isBill =
        payment.type === 'bill' || payment.payable_type?.includes?.('Bill');
    const payableTypeLabel = isBill ? 'Bill' : 'Invoice';
    const payableNumber = isBill
        ? payment.payable?.bill_number
        : payment.payable?.invoice_number;

    const bill = isBill ? payment.payable : null;
    const consumption = bill?.meter_reading
        ? Number(bill.meter_reading?.current_reading ?? 0) -
          Number(bill.meter_reading?.previous_reading ?? 0)
        : 0;

    const amountPaid = payment.amount_paid ?? payment.amount ?? 0;
    const customer = payment.payable?.customer;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Payment ${payment.reference_number || ''}`} />

            <div className="mx-auto max-w-4xl space-y-6 pb-10">
                {/* Header + Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Payment {payment.reference_number || 'Details'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Payment receipt and related information
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('payments')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Payments
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.print()}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </Button>
                        {isBill && bill && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('bills.show', bill.id)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    View Bill
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main card */}
                <Card>
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <CreditCard className="h-5 w-5" />
                                    {payment.reference_number || 'Payment'}
                                </CardTitle>
                                <Badge className="border-green-500 bg-green-50 text-green-700">
                                    Paid
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(payment.payment_date)}</span>
                                <span>·</span>
                                <span className="font-medium text-foreground">
                                    {formatCurrency(amountPaid)}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* Customer & property */}
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <User className="h-4 w-4" />
                                Customer & property
                            </h3>
                            {customer ? (
                                <div className="space-y-1 text-sm">
                                    <p className="font-medium">
                                        {customer.name}
                                    </p>
                                    <div className="flex items-start gap-2 text-muted-foreground">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            <p>
                                                {bill?.customer?.address ??
                                                    customer.address ??
                                                    '—'}
                                            </p>
                                            {customer.zone?.name && (
                                                <p>
                                                    Zone: {customer.zone.name}{' '}
                                                    {customer.plot_number &&
                                                        `· Plot: ${customer.plot_number}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {customer.phone && (
                                        <p className="text-muted-foreground">
                                            {customer.phone}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No customer information
                                </p>
                            )}
                        </section>

                        {/* Payment details */}
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <CreditCard className="h-4 w-4" />
                                Payment details
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Field</TableHead>
                                        <TableHead className="text-right">
                                            Value
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            Amount paid
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-green-600">
                                            {formatCurrency(amountPaid)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            Reference
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {payment.reference_number || '—'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            Method
                                        </TableCell>
                                        <TableCell className="text-right capitalize">
                                            {payment.payment_method || '—'}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-muted-foreground">
                                            Received by
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {payment.receiver?.name || '—'}
                                        </TableCell>
                                    </TableRow>
                                    {payment.notes && (
                                        <TableRow>
                                            <TableCell className="align-top text-muted-foreground">
                                                Notes
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {payment.notes}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </section>

                        {/* Bill/Invoice info */}
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <Receipt className="h-4 w-4" />
                                {payableTypeLabel} information
                            </h3>
                            {payment.payable ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <p className="font-medium">
                                            {payableTypeLabel} #{payableNumber}
                                        </p>
                                        <Badge
                                            variant="outline"
                                            className={
                                                payment.payable?.status ===
                                                'fully paid'
                                                    ? 'border-green-500 bg-green-50 text-green-700'
                                                    : 'border-amber-500 bg-amber-50 text-amber-700'
                                            }
                                        >
                                            {payment.payable?.status?.replace(
                                                '_',
                                                ' ',
                                            ) ?? '—'}
                                        </Badge>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                <TableHead>
                                                    Description
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Amount
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell className="text-muted-foreground">
                                                    Total charged
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(
                                                        payment.payable
                                                            ?.total_amount ??
                                                            payment.payable
                                                                ?.amount ??
                                                            0,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="text-muted-foreground">
                                                    Remaining balance
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {formatCurrency(
                                                        payment.balance ??
                                                            payment.payable
                                                                ?.current_balance ??
                                                            payment.payable
                                                                ?.balance ??
                                                            0,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>

                                    {/* Bill breakdown (bills only) */}
                                    {isBill && bill && (
                                        <div className="space-y-4 border-t pt-6">
                                            <h4 className="text-sm font-semibold text-muted-foreground">
                                                Bill breakdown
                                            </h4>

                                            <div>
                                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                    Meter reading & usage
                                                </p>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                            <TableHead>
                                                                Meter
                                                            </TableHead>
                                                            <TableHead>
                                                                Previous
                                                            </TableHead>
                                                            <TableHead>
                                                                Current
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Usage (m³)
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell className="font-medium">
                                                                {bill
                                                                    .meter_reading
                                                                    ?.meter
                                                                    ?.meter_number ??
                                                                    '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {bill
                                                                    .meter_reading
                                                                    ?.previous_reading ??
                                                                    '—'}{' '}
                                                                m³
                                                            </TableCell>
                                                            <TableCell>
                                                                {bill
                                                                    .meter_reading
                                                                    ?.current_reading ??
                                                                    '—'}{' '}
                                                                m³
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {consumption} m³
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                                    Charges breakdown
                                                </p>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                                            <TableHead>
                                                                Description
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Rate
                                                            </TableHead>
                                                            <TableHead className="text-right">
                                                                Amount
                                                            </TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell>
                                                                Water usage (
                                                                {consumption} m³
                                                                )
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">
                                                                {formatCurrency(
                                                                    bill.tariff,
                                                                )}
                                                                /m³
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    consumption *
                                                                        Number(
                                                                            bill.tariff ??
                                                                                0,
                                                                        ),
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell>
                                                                Fixed charges
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                —
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    bill.fix_charges,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell className="text-muted-foreground">
                                                                Previous balance
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                —
                                                            </TableCell>
                                                            <TableCell className="text-right text-muted-foreground">
                                                                {formatCurrency(
                                                                    bill.previous_balance,
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-t-2 font-semibold">
                                                            <TableCell>
                                                                Total due
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                —
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {formatCurrency(
                                                                    bill.total_amount ??
                                                                        bill.amount +
                                                                            Number(
                                                                                bill.previous_balance ??
                                                                                    0,
                                                                            ),
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No bill or invoice linked.
                                </p>
                            )}
                        </section>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
