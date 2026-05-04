import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Wrench, Calendar } from 'lucide-react';

export default function CustomerServiceCharges({ serviceCharges }) {
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

    if (!serviceCharges?.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                <Wrench className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p>No service charges found for this customer.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
                <thead>
                    <tr className="border-b bg-muted/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <th className="px-4 py-3">Charge ID</th>
                        <th className="px-4 py-3">Date Applied</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {serviceCharges.map((charge) => (
                        <tr key={charge.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-4 py-3 font-mono font-medium text-foreground">
                                CHG-{String(charge.id).padStart(5, '0')}
                            </td>
                            <td className="px-4 py-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(charge.created_at)}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {charge.type?.name ?? charge.charge_type ?? 'Service Charge'}
                            </td>
                            <td className="px-4 py-3">
                                <Badge variant={charge.status === 'paid' ? 'success' : (charge.status === 'unpaid' ? 'destructive' : 'outline')} className="capitalize text-[10px]">
                                    {charge.status ?? 'unpaid'}
                                </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-black text-red-600">
                                {formatCurrency(charge.amount ?? 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
