import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar } from 'lucide-react';

export default function CustomerPayments({ payments }) {
    const formatDate = (value) => {
        if (!value) return '—';
        try {
            return new Date(value).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return String(value);
        }
    };

    if (!payments?.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p>No payments found for this customer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-4 py-3">Receipt #</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Method</th>
                        <th className="px-4 py-3 text-right">Amount (SSP)</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">
                                {payment.receipt_number ?? `PAY-${String(payment.id).padStart(6, '0')}`}
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(payment.payment_date || payment.created_at)}
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant="outline" className="capitalize text-[10px] bg-muted/30">
                                    {payment.payment_method ?? 'Cash'}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-black text-emerald-600">
                                {Number(payment.amount ?? 0).toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
