import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { DollarSign, Eye, Printer, Receipt } from 'lucide-react';

const PRINT_ROOT_ID = 'customer-bills-print';

function formatDate(value) {
    if (!value) {
        return '—';
    }

    try {
        return new Date(value).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

function billNumber(bill) {
    const raw = bill.bill_number ?? bill.bill_no ?? bill.id;

    return `#${String(raw).padStart(6, '0')}`;
}

function issuedByName(bill) {
    return bill.reading?.recorder?.name ?? '—';
}

function paymentDate(bill) {
    const date = bill.payments?.[0]?.payment_date;

    return date ? formatDate(date) : '—';
}

function canRecordPayment(status) {
    return status === 'pending';
}

function statusVariant(status) {
    if (status === 'paid') {
        return 'success';
    }

    if (status === 'pending') {
        return 'destructive';
    }

    return 'outline';
}

function CustomerBillsTable({ rows, onRecordPayment }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Bill</TableHead>
                    <TableHead>Issued by</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead className="">Prev. balance</TableHead>
                    <TableHead className="">Paid</TableHead>
                    <TableHead>Paid on </TableHead>
                    <TableHead className="">Total</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="text-right print:hidden">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rows.map((bill) => (
                    <TableRow key={bill.id}>
                        <TableCell className="font-mono text-xs">{billNumber(bill)}</TableCell>
                        <TableCell>{issuedByName(bill)}</TableCell>
                        <TableCell className="whitespace-nowrap">{formatDate(bill.created_at)}</TableCell>
                        <TableCell>
                            {formatCurrency(bill.previous_balance ?? 0)}
                        </TableCell>
                        <TableCell>
                            {formatCurrency(bill.payments_sum_amount ?? 0)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap ">{paymentDate(bill)}</TableCell>
                        <TableCell>
                            {formatCurrency(bill.total_amount ?? bill.total ?? 0)}
                        </TableCell>
                        <TableCell>
                            <Badge variant={statusVariant(bill.status)} className="h-5 capitalize text-[10px]">
                                {bill.status ?? '—'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right print:hidden">
                            <div className="flex justify-end gap-0.5">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={!canRecordPayment(bill.status) || !onRecordPayment}
                                    title={
                                        canRecordPayment(bill.status)
                                            ? 'Record payment'
                                            : 'Payments are only available while the bill is pending'
                                    }
                                    aria-label={`Record payment for ${billNumber(bill)}`}
                                    onClick={() => onRecordPayment?.(bill)}
                                >
                                    <DollarSign
                                        className={`h-4 w-4 ${canRecordPayment(bill.status) ? 'text-emerald-600' : 'text-muted-foreground'}`}
                                    />
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link
                                        href={route('bills.print', bill.id)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Print bill ${billNumber(bill)}`}
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                                    <Link href={route('bills.show', bill.id)} aria-label={`View bill ${billNumber(bill)}`}>
                                        <Eye className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

export default function CustomerBills({ bills, customerName, accountNumber, onRecordPayment }) {
    const rows = Array.isArray(bills) ? bills : [];

    if (rows.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/5 p-8 text-center text-sm text-muted-foreground">
                <Receipt className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                <p>No bills found for this customer.</p>
            </div>
        );
    }

    return (
        <>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #${PRINT_ROOT_ID},
                        #${PRINT_ROOT_ID} * {
                            visibility: visible;
                        }
                        #${PRINT_ROOT_ID} {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            padding: 1rem;
                        }
                    }
                `}
            </style>
            <div
                id={PRINT_ROOT_ID}
                className="overflow-hidden rounded-md border bg-white print:overflow-visible print:rounded-none print:border-0"
            >
                <div className="hidden border-b px-4 py-3 print:block">
                    <h2 className="text-lg font-bold text-foreground">Customer bills</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {customerName ?? 'Customer'}
                        {accountNumber ? (
                            <span className="font-mono font-semibold text-foreground"> · {accountNumber}</span>
                        ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Printed {new Date().toLocaleString('en-GB')}
                    </p>
                </div>
                <CustomerBillsTable rows={rows} onRecordPayment={onRecordPayment} />
            </div>
        </>
    );
}

export function printCustomerBillsTable() {
    window.print();
}
