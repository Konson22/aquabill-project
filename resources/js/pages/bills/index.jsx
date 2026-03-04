import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    CreditCard,
    Eye,
    FileText,
    MoreHorizontal,
    Printer,
    Search,
    Trash2,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const MONTH_OPTIONS = (() => {
    const opts = [{ value: 'all', label: 'All months' }];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        opts.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        });
    }
    return opts;
})();

export default function Bills({ bills, filters, tariffs = [] }) {
    const { delete: destroy } = useForm();
    const department = usePage().props.auth?.user?.department;
    const canPrintOrDelete = department !== 'finance';
    const [payOpen, setPayOpen] = useState(false);
    const [paymentBill, setPaymentBill] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [month, setMonth] = useState(filters.month || 'all');
    const [tariffId, setTariffId] = useState(filters.tariff_id || 'all');

    const {
        data: payData,
        setData: setPayData,
        post: postPay,
        processing: payProcessing,
        errors: payErrors,
        reset: resetPay,
    } = useForm({
        bill_id: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        reference_number: '',
        notes: '',
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            const query = {};
            if (search) query.search = search;
            if (status && status !== 'all') query.status = status;
            if (month && month !== 'all') query.month = month;
            if (tariffId && tariffId !== 'all') query.tariff_id = tariffId;
            const sameSearch = (filters.search || '') === search;
            const sameStatus = (filters.status || 'all') === status;
            const sameMonth = (filters.month || 'all') === month;
            const sameTariff = (filters.tariff_id || 'all') === tariffId;
            if (sameSearch && sameStatus && sameMonth && sameTariff) return;
            router.get(route('bills'), query, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, search ? 500 : 0);

        return () => clearTimeout(timer);
    }, [search, status, month, tariffId]);

    const handleDelete = (id) => {
        if (
            confirm(
                'Are you sure you want to delete this bill? This action cannot be undone.',
            )
        ) {
            destroy(route('bills.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const getBillTotal = (bill) => {
        if (bill == null) return 0;
        const total =
            bill.total_amount ??
            Number(bill.amount) + Number(bill.previous_balance ?? 0);
        return Number(total);
    };

    const getBillBalance = (bill) => {
        if (bill == null) return 0;
        const total = getBillTotal(bill);
        const paid = Number(bill.amount_paid ?? 0);
        return Math.max(0, total - paid);
    };

    const handlePayClick = (bill) => {
        setPaymentBill(bill);
        const balance = getBillBalance(bill);
        setPayData({
            bill_id: bill.id,
            amount: balance > 0 ? String(balance) : '',
            payment_date: new Date().toISOString().split('T')[0],
            payment_method: 'cash',
            reference_number: '',
            notes: '',
        });
        setPayOpen(true);
    };

    const submitPayment = (e) => {
        e.preventDefault();
        postPay(route('payments.store'), {
            onSuccess: () => {
                setPayOpen(false);
                resetPay();
                setPaymentBill(null);
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
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bills" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="h-9 w-[160px] bg-background">
                                <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTH_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={tariffId} onValueChange={setTariffId}>
                            <SelectTrigger className="h-9 w-[160px] bg-background">
                                <SelectValue placeholder="Tariff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All tariffs</SelectItem>
                                {tariffs.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-9 w-[160px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="partial paid">Partial paid</SelectItem>
                                <SelectItem value="fully paid">Fully paid</SelectItem>
                                <SelectItem value="forwarded">Forwarded</SelectItem>
                                <SelectItem value="balance forwarded">Balance forwarded</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                        >
                            <a
                                href={route('bills.export') + '?format=xlsx'}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FileText className="h-4 w-4" />
                                Export Excel
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            asChild
                            className="gap-2 border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 hover:text-sky-900"
                        >
                            <Link href={route('bills.printing-list')}>
                                <Printer className="h-4 w-4" />
                                Print Bill List
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border/80 shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/60 px-5 pb-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            Billing Management
                        </h2>
                        <div className="relative w-[500px]  sm:flex-none">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search bills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full bg-gray-50 pl-9"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Customer</TableHead>

                                    <TableHead>Meter No</TableHead>

                                    <TableHead>Billing Date</TableHead>
                                    <TableHead className="text-right">
                                        Prev/Bal
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Total Amount
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.data.length > 0 ? (
                                    bills.data.map((bill) => (
                                        <TableRow
                                            key={bill.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {bill.customer?.name ||
                                                            'Unknown'}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1 font-mono text-sm">
                                                    {(bill.meterReading?.meter
                                                        ?.meter_number ??
                                                    bill.customer?.meter
                                                        ?.meter_number) ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-amber-500" />
                                                            {bill.meterReading
                                                                ?.meter
                                                                ?.meter_number ??
                                                                bill.customer
                                                                    ?.meter
                                                                    ?.meter_number}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="whitespace-nowrap">
                                                        {formatDate(
                                                            bill.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <span className="text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        bill.previous_balance,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        bill.amount,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        getBillTotal(bill),
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        bill.status ===
                                                        'fully paid'
                                                            ? 'default'
                                                            : bill.status ===
                                                                'partial paid'
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                    className={`capitalize ${
                                                        bill.status ===
                                                        'fully paid'
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : ''
                                                    } ${
                                                        bill.status ===
                                                        'partial paid'
                                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                            : ''
                                                    }`}
                                                >
                                                    {bill.status ===
                                                        'fully paid' && (
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                    )}
                                                    {bill.status ===
                                                        'pending' && (
                                                        <AlertCircle className="mr-1 h-3 w-3" />
                                                    )}
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Open menu
                                                                </span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        'bills.show',
                                                                        bill.id,
                                                                    )}
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>

                                                            {[
                                                                'pending',
                                                                'partial paid',
                                                            ].includes(
                                                                bill.status,
                                                            ) && (
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handlePayClick(
                                                                            bill,
                                                                        )
                                                                    }
                                                                >
                                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                                    Record
                                                                    Payment
                                                                </DropdownMenuItem>
                                                            )}

                                                            {canPrintOrDelete && (
                                                                <DropdownMenuItem
                                                                    asChild
                                                                >
                                                                    <a
                                                                        href={route(
                                                                            'bills.print',
                                                                            bill.id,
                                                                        )}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <Printer className="mr-2 h-4 w-4" />
                                                                        Print Bill
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}

                                                            {canPrintOrDelete && (
                                                                <>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                bill.id
                                                                            )
                                                                        }
                                                                        disabled={[
                                                                            'fully paid',
                                                                            'forwarded',
                                                                            'partial paid',
                                                                            'balance forwarded',
                                                                        ].includes(
                                                                            bill.status,
                                                                        )}
                                                                        className="text-red-600 focus:text-red-600"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No bills found matching your
                                                    criteria.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t p-4">
                        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {bills.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {bills.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {bills.total}
                                </span>{' '}
                                results
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {bills.links &&
                                    bills.links.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');

                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className={
                                                    !link.url
                                                        ? 'cursor-default opacity-50'
                                                        : ''
                                                }
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payment Modal */}
            <Dialog open={payOpen} onOpenChange={setPayOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                        <DialogDescription>
                            Enter payment details for bill{' '}
                            <span className="font-mono font-medium text-foreground">
                                {paymentBill?.bill_number ?? paymentBill?.id}
                            </span>
                            .
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitPayment} className="space-y-4">
                        {paymentBill && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">
                                            Total Amount:
                                        </span>
                                        <div className="font-medium">
                                            {formatCurrency(
                                                getBillTotal(paymentBill),
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">
                                            Outstanding Balance:
                                        </span>
                                        <div className="font-bold text-red-600">
                                            {formatCurrency(
                                                Math.max(
                                                    0,
                                                    getBillBalance(
                                                        paymentBill,
                                                    ) -
                                                        (parseFloat(
                                                            payData.amount,
                                                        ) || 0),
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        Amount Provided
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max={
                                            paymentBill
                                                ? getBillBalance(paymentBill)
                                                : undefined
                                        }
                                        value={payData.amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const maxVal = paymentBill
                                                ? getBillBalance(paymentBill)
                                                : 0;
                                            if (
                                                val !== '' &&
                                                parseFloat(val) > maxVal
                                            ) {
                                                setPayData(
                                                    'amount',
                                                    String(maxVal),
                                                );
                                            } else {
                                                setPayData('amount', val);
                                            }
                                        }}
                                        required
                                    />
                                    {payErrors.amount && (
                                        <p className="text-xs text-destructive">
                                            {payErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="payment_date">
                                        Payment Date
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={payData.payment_date}
                                        onChange={(e) =>
                                            setPayData(
                                                'payment_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    {payErrors.payment_date && (
                                        <p className="text-xs text-destructive">
                                            {payErrors.payment_date}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reference_number">
                                    Reference Number{' '}
                                    <span className="text-red-500">*</span>
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
                                    placeholder="e.g. Transaction ID, Receipt No."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Notes{' '}
                                    <span className="text-xs text-muted-foreground">
                                        (Optional)
                                    </span>
                                </Label>
                                <Textarea
                                    id="notes"
                                    value={payData.notes}
                                    onChange={(e) =>
                                        setPayData('notes', e.target.value)
                                    }
                                    placeholder="Any additional comments..."
                                    className="h-20 resize-none"
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPayOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={payProcessing}>
                                {payProcessing
                                    ? 'Processing...'
                                    : 'Confirm Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
