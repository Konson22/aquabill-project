import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';

export default function PaymentsTab({ allPayments }) {
    return (
        <>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="h-4 w-4" />
                    Payment History
                </h2>
            </div>
            {allPayments.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Reference</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Meter No</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allPayments.map((payment) => (
                                <TableRow
                                    key={payment.id}
                                    className="hover:bg-muted/50"
                                >
                                    <TableCell className="font-mono font-medium">
                                        {payment.reference_number}
                                    </TableCell>
                                    <TableCell>
                                        {payment.source_href ? (
                                            <Link
                                                href={payment.source_href}
                                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset hover:bg-blue-100 hover:underline"
                                            >
                                                {payment.source}
                                            </Link>
                                        ) : (
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-700/10 ring-inset">
                                                {payment.source}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {payment.meter_number ?? '—'}
                                    </TableCell>
                                    <TableCell className="font-medium text-green-600">
                                        {new Intl.NumberFormat('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        }).format(payment.amount)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            payment.date,
                                        ).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                        {payment.payment_method}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <CreditCard className="mb-4 h-10 w-10 opacity-20" />
                    <p>No payments found for this customer.</p>
                </div>
            )}
        </>
    );
}
