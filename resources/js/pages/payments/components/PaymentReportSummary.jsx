import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

export default function PaymentReportSummary({
    totalCollected,
    totalBilled,
    totalOutstanding,
    collectionRate,
}) {
    return (
        <Card className="overflow-hidden rounded-xl border border-border/80">
            <div className="flex flex-wrap items-center gap-6 px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Total collected
                        </p>
                        <p className="text-xl font-bold tabular-nums text-foreground">
                            {formatCurrency(totalCollected)}
                        </p>
                    </div>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Total billed
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-muted-foreground">
                        {formatCurrency(totalBilled)}
                    </p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Outstanding
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                        {formatCurrency(totalOutstanding)}
                    </p>
                </div>
                <div className="ml-auto">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    collection rate
                    </p>
                    <p className="text-lg font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                    {collectionRate.toFixed(1)}%
                    </p>
                </div>
                </div>
            </div>
        </Card>
    );
}
