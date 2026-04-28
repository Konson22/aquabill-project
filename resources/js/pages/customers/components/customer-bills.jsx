import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Eye } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CustomerBills({ bills }) {
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

    if (!bills?.length) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/5">
                <Receipt className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                <p>No bills found for this customer.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between gap-4 rounded-lg border bg-card p-4 hover:bg-muted/10 transition-colors shadow-sm">
                    <div className="min-w-0 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                Invoice #{String(bill.bill_number || bill.id).padStart(6, '0')}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Issued {formatDate(bill.created_at)} • Due {formatDate(bill.due_date)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <Badge variant={bill.status === 'paid' ? 'success' : (bill.status === 'unpaid' ? 'destructive' : 'outline')} className="capitalize text-[10px] mb-1">
                                {bill.status ?? '—'}
                            </Badge>
                            <p className="font-mono font-black text-sm block">
                                SSP {Number(bill.total_amount ?? bill.total ?? 0).toLocaleString()}
                            </p>
                        </div>
                        <Button asChild variant="ghost" size="icon">
                            <Link href={`/bills/${bill.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
