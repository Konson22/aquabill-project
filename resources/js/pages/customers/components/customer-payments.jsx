import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Receipt } from 'lucide-react';

export default function CustomerPayments({ bills }) {
    const list = Array.isArray(bills) ? bills : [];

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

    if (!list.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                <CreditCard className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p>No bill payment activity yet for this customer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-4 py-3">Bill</th>
                        <th className="px-4 py-3">Issued</th>
                        <th className="px-4 py-3 text-right">Total</th>
                        <th className="px-4 py-3 text-right">Paid</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                        <th className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {list.map((bill) => (
                        <tr key={bill.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-medium text-foreground">
                                <span className="inline-flex items-center gap-2">
                                    <Receipt className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono text-xs">{bill.bill_no ?? `BILL-${String(bill.id).padStart(6, '0')}`}</span>
                                </span>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {formatDate(bill.created_at)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                                {formatCurrency(bill.total_amount ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-700">
                                {formatCurrency(bill.amount_paid ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-amber-800">
                                {formatCurrency(bill.current_balance ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant="outline" className="capitalize text-[10px]">
                                    {bill.status ?? '—'}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
