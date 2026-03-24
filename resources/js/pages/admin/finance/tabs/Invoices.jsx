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

export default function InvoicesTab({ invoices = [] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="border-border/60 hover:bg-transparent">
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Invoice No
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Customer
                        </TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground">
                            Amount
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
                    {invoices.length > 0 ? (
                        invoices.map((invoice) => (
                            <TableRow
                                key={invoice.id}
                                className="border-border/40 hover:bg-muted/40"
                            >
                                <TableCell className="font-mono text-sm">
                                    <Link
                                        href={route('invoices.show', invoice.id)}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        {invoice.invoice_number ?? '—'}
                                    </Link>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {invoice.customer?.name ?? '—'}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {formatCurrency(invoice.amount ?? 0)}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {formatDate(invoice.due_date)}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            invoice.status === 'paid'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="text-xs"
                                    >
                                        {invoice.status ?? '—'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={route('invoices.show', invoice.id)}>
                                            View
                                        </Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="h-24 text-center text-sm text-muted-foreground"
                            >
                                No invoices yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
