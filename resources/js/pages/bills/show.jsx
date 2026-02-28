import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Calendar,
    CreditCard,
    Droplets,
    MapPin,
    Printer,
    Receipt,
    User,
} from 'lucide-react';
import { useState } from 'react';

export default function BillShow({ bill }) {
    const [payOpen, setPayOpen] = useState(false);
    const department = usePage().props.auth?.user?.department;
    const canPrintOrEdit = department !== 'finance';

    // Consumption from meter reading (bill has no consumption column)
    const consumption =
        Number(bill.meter_reading?.current_reading ?? 0) -
        Number(bill.meter_reading?.previous_reading ?? 0);
    const waterUsageAmount = consumption * Number(bill.tariff ?? 0);
    const fixCharges = Number(bill.fix_charges ?? 0);
    const previousBalance = Number(bill.previous_balance ?? 0);
    // Current period total (water + fixed charges)
    const currentPeriodTotal = waterUsageAmount + fixCharges;
    // Total due = current period + previous balance
    const totalDue =
        Number(bill.total_amount) || currentPeriodTotal + previousBalance;

    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: payProcessing,
        errors: payErrors,
        reset: resetPay,
    } = useForm({
        bill_id: bill.id,
        amount: bill.current_balance,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('payments.store'), {
            onSuccess: () => {
                setPayOpen(false);
                resetPay();
            },
        });
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Bills',
            href: route('bills'),
        },
        {
            title: `Bill #${bill.bill_number}`,
            href: route('bills.show', bill.id),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Bill ${bill.bill_number}`} />

            <div className="mx-auto max-w-4xl space-y-6 pb-10">
                {/* Header + Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Bill #{bill.bill_number}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Bill information and payment history
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {bill.status !== 'fully paid' && (
                            <Button
                                onClick={() => setPayOpen(true)}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>
                        )}
                        {canPrintOrEdit && (
                            <Button variant="outline" asChild>
                                <a
                                    href={route('bills.print', bill.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print
                                </a>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Single card: all bill info */}
                <Card>
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-3">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Receipt className="h-5 w-5" />#
                                    {bill.bill_number}
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className={
                                        bill.status === 'fully paid'
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : bill.status === 'pending'
                                              ? 'border-red-500 bg-red-50 text-red-700'
                                              : 'border-amber-500 bg-amber-50 text-amber-700'
                                    }
                                >
                                    {bill.status?.replace('_', ' ')}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Issued {formatDate(bill.created_at)}
                                </span>
                                <span>·</span>
                                <span>Due {formatDate(bill.due_date)}</span>
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
                            <div className="space-y-1 text-sm">
                                <p className="font-medium">
                                    {bill.customer?.name}
                                </p>
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p>{bill?.customer?.address}</p>
                                        <p>
                                            Zone:{' '}
                                            {bill?.customer?.zone?.name ?? '—'}{' '}
                                            · Plot:{' '}
                                            {bill?.customer?.plot_number ?? '—'}
                                        </p>
                                    </div>
                                </div>
                                {bill.customer?.phone && (
                                    <p className="text-muted-foreground">
                                        {bill.customer.phone}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* Meter reading */}
                        <section>
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                <Droplets className="h-4 w-4" />
                                Meter reading & usage
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Meter</TableHead>
                                        <TableHead>Previous</TableHead>
                                        <TableHead>Current</TableHead>
                                        <TableHead>Reader</TableHead>
                                        <TableHead className="text-right">
                                            Usage (m³)
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium">
                                            {bill.meter_reading?.meter
                                                ?.meter_number ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {bill.meter_reading
                                                ?.previous_reading ?? '—'}{' '}
                                            m³
                                        </TableCell>
                                        <TableCell>
                                            {bill.meter_reading
                                                ?.current_reading ?? '—'}{' '}
                                            m³
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-muted-foreground">
                                                {bill.meter_reading?.reader
                                                    ?.name ?? '—'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {consumption} m³
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </section>

                        {/* Charges breakdown */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Charges breakdown
                            </h3>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead>Description</TableHead>
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
                                            Water usage ({consumption} m³)
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(bill.tariff)}/m³
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(waterUsageAmount)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>Fixed charges</TableCell>
                                        <TableCell className="text-right">
                                            —
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(bill.fix_charges)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-t font-semibold">
                                        <TableCell>Total amount</TableCell>
                                        <TableCell className="text-right">
                                            —
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(currentPeriodTotal)}
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
                                        <TableCell>Total due</TableCell>
                                        <TableCell className="text-right">
                                            —
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(totalDue)}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </section>

                        {/* Payment history */}
                        <section>
                            <h3 className="mb-3 text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Payment history
                            </h3>
                            {bill.payments && bill.payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead>Date</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Method</TableHead>
                                            <TableHead className="text-right">
                                                Amount
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bill.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>
                                                    {formatDate(
                                                        payment.payment_date,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {payment.reference_number ||
                                                        '—'}
                                                </TableCell>
                                                <TableCell className="capitalize">
                                                    {payment.payment_method}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-green-600">
                                                    {formatCurrency(
                                                        payment.amount,
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    No payments recorded yet.
                                </p>
                            )}
                        </section>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitPayment} className="grid gap-4 py-4">
                        <div className="mb-2 text-sm text-muted-foreground">
                            <p>
                                <strong>Bill #:</strong> {bill.bill_number}
                            </p>
                            <p>
                                <strong>Total Amount:</strong>{' '}
                                {formatCurrency(bill.total_amount)}
                            </p>
                            <p className="font-semibold text-red-500">
                                <strong>Balance Due:</strong>{' '}
                                {formatCurrency(bill.current_balance)}
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount Provided</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={payData.amount}
                                onChange={(e) =>
                                    setPayData('amount', e.target.value)
                                }
                            />
                            {payErrors.amount && (
                                <span className="text-xs text-red-500">
                                    {payErrors.amount}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment_date">Payment Date</Label>
                            <Input
                                id="payment_date"
                                type="date"
                                value={payData.payment_date}
                                onChange={(e) =>
                                    setPayData('payment_date', e.target.value)
                                }
                            />
                            {payErrors.payment_date && (
                                <span className="text-xs text-red-500">
                                    {payErrors.payment_date}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="reference_number">
                                Reference Number (Optional)
                            </Label>
                            <Input
                                id="reference_number"
                                value={payData.reference_number}
                                onChange={(e) =>
                                    setPayData(
                                        'reference_number',
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g. Transaction ID"
                            />
                            {payErrors.reference_number && (
                                <span className="text-xs text-red-500">
                                    {payErrors.reference_number}
                                </span>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Input
                                id="notes"
                                value={payData.notes}
                                onChange={(e) =>
                                    setPayData('notes', e.target.value)
                                }
                                placeholder="Additional details..."
                            />
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={payProcessing}>
                                Run Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
