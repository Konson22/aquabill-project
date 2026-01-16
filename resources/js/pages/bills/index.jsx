import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle,
    CreditCard,
    Eye,
    FileText,
    MoreHorizontal,
    Printer,
    Trash2,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Bills({ bills, filters }) {
    const { delete: destroy } = useForm();
    const [payOpen, setPayOpen] = useState(false);
    const [paymentBill, setPaymentBill] = useState(null);
    const [search, setSearch] = useState(filters.search || '');
    const [selected, setSelected] = useState(new Set());

    const toggleAll = (checked) => {
        if (checked) {
            setSelected(
                new Set(
                    bills.data
                        .filter((bill) => bill.status === 'pending')
                        .map((bill) => bill.id),
                ),
            );
        } else {
            setSelected(new Set());
        }
    };

    const toggleOne = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const handleBulkPrint = () => {
        const ids = Array.from(selected).join(',');
        const url = route('bills.bulk-print', { ids });
        window.open(url, '_blank');
    };

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
            if (search !== (filters.search || '')) {
                router.get(
                    route('bills'),
                    { search: search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

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

    const handlePayClick = (bill) => {
        setPaymentBill(bill);
        setPayData({
            bill_id: bill.id,
            amount: bill.current_balance,
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
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Billing Management
                        </h1>
                        <p className="text-muted-foreground">
                            Generate bills, track payments, and manage
                            outstanding balances.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild className="gap-2">
                            <Link href={route('bills.report')}>
                                <BarChart3 className="h-4 w-4" />
                                View Reports
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Results Table */}
                <Card className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2">
                        <div className="flex gap-2">
                            {selected.size > 0 && (
                                <Button
                                    variant="default"
                                    onClick={handleBulkPrint}
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print Selected ({selected.size})
                                </Button>
                            )}
                            <Link href={route('bills.export')}>
                                <Button variant="outline" className="gap-2">
                                    <FileText className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </Link>
                        </div>
                        <div className="relative w-full max-w-md">
                            <Input
                                placeholder="Search bills..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={
                                                bills.data.filter(
                                                    (b) =>
                                                        b.status === 'pending',
                                                ).length > 0 &&
                                                selected.size ===
                                                    bills.data.filter(
                                                        (b) =>
                                                            b.status ===
                                                            'pending',
                                                    ).length
                                            }
                                            onCheckedChange={toggleAll}
                                            disabled={
                                                bills.data.filter(
                                                    (b) =>
                                                        b.status === 'pending',
                                                ).length === 0
                                            }
                                            aria-label="Select all pending"
                                            className="border-gray-500"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[120px]">
                                        Bill ID
                                    </TableHead>
                                    <TableHead>Customer</TableHead>

                                    <TableHead>Meter No</TableHead>

                                    <TableHead>Billing Date</TableHead>
                                    <TableHead className="text-right">
                                        Prev. Balance
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Curr. Balance
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
                                            data-state={
                                                selected.has(bill.id) &&
                                                'selected'
                                            }
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selected.has(
                                                        bill.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleOne(bill.id)
                                                    }
                                                    disabled={
                                                        bill.status !==
                                                        'pending'
                                                    }
                                                    aria-label={`Select bill ${bill.id}`}
                                                    className="border-gray-500"
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                <Link
                                                    href={route(
                                                        'bills.show',
                                                        bill.id,
                                                    )}
                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    {bill.bill_number}
                                                </Link>
                                            </TableCell>
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
                                                    {bill.home?.meter ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-amber-500" />
                                                            {
                                                                bill.home.meter
                                                                    .meter_number
                                                            }
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
                                                        bill.total_amount,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span
                                                    className={`text-sm font-medium ${
                                                        bill.current_balance > 0
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }`}
                                                >
                                                    {formatCurrency(
                                                        bill.current_balance,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        bill.status === 'paid'
                                                            ? 'default' // Using default (usually black/primary) for paid
                                                            : bill.status ===
                                                                'partial'
                                                              ? 'secondary' // Using secondary (usually gray) for partial
                                                              : 'destructive' // Red for unpaid/overdue
                                                    }
                                                    className={`capitalize ${
                                                        bill.status === 'paid'
                                                            ? 'bg-green-600 hover:bg-green-700'
                                                            : ''
                                                    } ${
                                                        bill.status ===
                                                        'partial'
                                                            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                            : ''
                                                    }`}
                                                >
                                                    {bill.status === 'paid' && (
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                    )}
                                                    {bill.status ===
                                                        'unpaid' && (
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

                                                            {bill.status ==
                                                            'pending' ? (
                                                                <>
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
                                                                            Print
                                                                            Bill
                                                                        </a>
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : null}

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        bill.id,
                                                                    )
                                                                }
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
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
                                {paymentBill?.bill_number}
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
                                                paymentBill.total_amount,
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
                                                    paymentBill.current_balance -
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
                                        max={paymentBill?.current_balance}
                                        value={payData.amount}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (
                                                paymentBill &&
                                                parseFloat(val) >
                                                    paymentBill.current_balance
                                            ) {
                                                setPayData(
                                                    'amount',
                                                    paymentBill.current_balance,
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
