import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export default function ReportKpiCard({
    icon: Icon,
    iconClassName,
    title,
    subtitle,
    waterConsumptionTotal = 0,
    fixChargesTotal = 0,
    totalBilled = 0,
    collected = 0,
    outstanding = 0,
    collectionRatePct = 0,
}) {
    const safeCollectionRate =
        outstanding > 0 && collectionRatePct > 99.9
            ? Math.min(collectionRatePct, 99.9)
            : collectionRatePct;
    return (
        <Card className="overflow-hidden px-3 rounded-md border border-border/80">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClassName}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">
                        {title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {subtitle}
                    </p>
                </div>
            </div>

            <Table className="mt-3">
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Metric</TableHead>
                        <TableHead className="text-right font-semibold">
                            Amount
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                            Water Consumption (total)
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                            {formatCurrency(waterConsumptionTotal)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                            Fix Charges (total)
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                            {formatCurrency(fixChargesTotal)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                            Total Billed
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-foreground">
                            {formatCurrency(totalBilled)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                            Collected
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(collected)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-600 dark:text-amber-400">
                            Outstanding
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
                            {formatCurrency(outstanding)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">
                            Collection Rate
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                            {safeCollectionRate.toFixed(1)}%
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    );
}
