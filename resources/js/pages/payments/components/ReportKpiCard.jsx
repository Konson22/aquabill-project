import { Card, CardContent } from '@/components/ui/card';
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
    billed,
    collected,
    due,
    billedSuffix = '',
    collectedSuffix = '',
    dueSuffix = '',
}) {
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
           
            <Table className="p-0 ">
                <TableHeader className="p-0 m-0 bg-muted/50">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Metric</TableHead>
                        <TableHead className="text-right font-semibold text-muted-foreground">Count</TableHead>
                        <TableHead className="text-right font-semibold">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="p-0">
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-muted-foreground">Billed</TableCell>
                        <TableCell className="text-right text-muted-foreground">{billedSuffix}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-foreground">
                            {formatCurrency(billed)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">Collected</TableCell>
                        <TableCell className="text-right text-muted-foreground">{collectedSuffix}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(collected)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium text-amber-600 dark:text-amber-400">Due</TableCell>
                        <TableCell className="text-right text-muted-foreground">{dueSuffix}</TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-amber-600 dark:text-amber-400">
                            {formatCurrency(due)}
                        </TableCell>
                    </TableRow>
                    <TableRow className="border-t-2 border-border font-semibold transition-colors hover:bg-muted/50">
                        <TableCell className="font-semibold text-foreground">Total</TableCell>
                        <TableCell className="text-right text-muted-foreground">—</TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-foreground">
                            {formatCurrency(billed)}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
    );
}
