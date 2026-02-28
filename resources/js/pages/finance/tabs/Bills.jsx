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

function formatDate(dateString) {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
}

export default function BillsTab({ bills = [] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Bill No
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Customer
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Total
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Paid
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Due date
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Status
                        </TableHead>
                        <TableHead className="text-right text-xs font-medium text-muted-foreground">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {bills.length > 0 ? (
                        bills.map((bill) => (
                            <TableRow
                                key={bill.id}
                                className="border-border/40 hover:bg-muted/40"
                            >
                                <TableCell className="font-mono text-sm">
                                    <Link
                                        href={route('bills.show', bill.id)}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {bill.bill_number ?? '—'}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {bill.customer?.name ?? '—'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatCurrency(bill.total_amount ?? 0)}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatCurrency(bill.amount_paid ?? 0)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(bill.due_date)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            bill.status === 'fully paid'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="text-xs"
                                    >
                                        {bill.status ?? '—'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={route('bills.show', bill.id)}>
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
                                className="h-24 text-center text-sm text-muted-foreground"
                            >
                                No bills yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
