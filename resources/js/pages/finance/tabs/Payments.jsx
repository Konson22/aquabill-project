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
import { Calendar } from 'lucide-react';

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
}

export default function PaymentsTab({ payments = [] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Reference
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Payable
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Customer
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Amount
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Date
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payments.length > 0 ? (
                        payments.map((payment) => {
                            const payable = payment.payable;
                            const payableLabel =
                                payable?.bill_number ?? payable?.invoice_number ?? '—';
                            const payableId = payable?.id;
                            const payableRoute =
                                payable?.bill_number != null
                                    ? route('bills.show', payableId)
                                    : payable?.invoice_number != null
                                      ? route('invoices.show', payableId)
                                      : null;
                            return (
                                <TableRow
                                    key={payment.id}
                                    className="border-border/40 hover:bg-muted/40"
                                >
                                    <TableCell className="font-mono text-sm">
                                        {payment.reference_number ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payableRoute ? (
                                            <Link
                                                href={payableRoute}
                                                className="font-medium text-primary hover:underline"
                                            >
                                                {payableLabel}
                                            </Link>
                                        ) : (
                                            payableLabel
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {payable?.customer?.name ?? '—'}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm text-emerald-600">
                                        {formatCurrency(payment.amount ?? 0)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(
                                                payment.payment_date ?? payment.updated_at,
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={route('payments.show', payment.id)}>
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-sm text-muted-foreground"
                            >
                                No payments yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
