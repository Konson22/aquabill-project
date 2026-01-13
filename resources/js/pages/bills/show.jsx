import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Head, useForm } from '@inertiajs/react';
import { CreditCard, Printer, User } from 'lucide-react';
import { useState } from 'react';

export default function BillShow({ bill }) {
    const [payOpen, setPayOpen] = useState(false);

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

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Actions Toolbar */}
                <div className="flex items-center justify-between print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Invoice Details
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage and track billing information.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {bill.status !== 'paid' && (
                            <Button
                                onClick={() => setPayOpen(true)}
                                className="bg-purple-600 text-white hover:bg-purple-700"
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>
                        )}
                        <Button variant="outline" asChild>
                            <a
                                href={route('bills.print', bill.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print PDF
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Paper Invoice */}
                <Card className="min-h-[800px] bg-white p-8 shadow-sm md:p-12 print:shadow-none">
                    {/* Invoice Header */}
                    <div className="flex flex-col items-center border-b pb-8 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
                            <span className="text-2xl font-bold text-blue-600">
                                SSUWC
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            South Sudan Urban Water Corporation
                        </h2>
                        <div className="mt-2 text-sm text-muted-foreground">
                            <p>Juba, South Sudan</p>
                            <p>contact@ssuwc.com | +211 912 345 678</p>
                        </div>
                    </div>

                    {/* Bill To & Details */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Bill To
                            </h3>
                            <div className="space-y-1">
                                <div className="text-lg font-bold text-gray-900">
                                    {bill.customer?.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>{bill.home?.address}</p>
                                    <p>
                                        Zone: {bill.home?.zone?.name} | Plot:{' '}
                                        {bill.home?.plot_number}
                                    </p>
                                    <p>{bill.customer?.phone}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <h3 className="mb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Invoice Details
                            </h3>
                            <div className="space-y-1">
                                <div className="text-lg font-bold text-gray-900">
                                    #{bill.bill_number}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>Date: {formatDate(bill.created_at)}</p>
                                    <p>Due: {formatDate(bill.due_date)}</p>
                                    <Badge
                                        variant="outline"
                                        className={`mt-1 h-5 px-2 text-xs capitalize ${
                                            bill.status === 'paid'
                                                ? 'border-green-500 bg-green-50 text-green-600'
                                                : bill.status === 'unpaid'
                                                  ? 'border-red-500 bg-red-50 text-red-600'
                                                  : 'border-yellow-500 bg-yellow-50 text-yellow-600'
                                        }`}
                                    >
                                        {bill.status?.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="my-8 border-b" />

                    {/* Meter Details */}
                    <div className="mb-8">
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Meter Reading & Consumption
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead className="w-[150px]">
                                        Meter Number
                                    </TableHead>
                                    <TableHead>Previous Reading</TableHead>
                                    <TableHead>Current Reading</TableHead>
                                    <TableHead>Collected By</TableHead>
                                    <TableHead className="text-right">
                                        Usage (m³)
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">
                                        {
                                            bill.meter_reading?.meter
                                                ?.meter_number
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {bill.meter_reading?.previous_reading}{' '}
                                        m³
                                    </TableCell>
                                    <TableCell>
                                        {bill.meter_reading?.current_reading} m³
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                            </div>
                                            <span className="text-sm">
                                                {bill.meter_reading?.reader
                                                    ?.name || 'System'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {bill.consumption} m³
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="my-8 border-b" />

                    {/* Financial Summary */}
                    {/* Consumption Breakdown */}
                    <div className="mb-8">
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Consumption Breakdown
                        </h3>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">
                                        Units / Rate
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>
                                        Water Usage ({bill.consumption} m³)
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(bill.tariff)} / m³
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(
                                            bill.consumption * bill.tariff,
                                        )}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fixed Charges</TableCell>

                                    <TableCell className="text-right">
                                        -
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(bill.fix_charges)}
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="text-muted-foreground">
                                        Previous Balance
                                    </TableCell>
                                    <TableCell className="text-right">
                                        -
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {formatCurrency(bill.previous_balance)}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex flex-col gap-8 md:flex-row">
                        <div className="flex-1">
                            <h3 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                                Notes
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Please ensure payment is made by the due date.
                                Checks should be made payable to Utility
                                Company.
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="space-y-3 rounded-lg bg-muted/50 p-4">
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total Amount</span>
                                    <span>
                                        {formatCurrency(bill.total_amount)}
                                    </span>
                                </div>
                                <div className="my-2 border-t border-muted-foreground/20" />
                                <div className="flex justify-between text-lg font-bold text-primary">
                                    <span>Balance Due</span>
                                    <span>
                                        {formatCurrency(bill.current_balance)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="my-8 border-b" />

                    {/* Payment History Table */}
                    <div>
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Payment History
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
                                            <TableCell>
                                                {payment.reference_number ||
                                                    '-'}
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {payment.payment_method}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-green-600">
                                                {formatCurrency(payment.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-sm text-muted-foreground italic">
                                No payments recorded yet.
                            </div>
                        )}
                    </div>
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
