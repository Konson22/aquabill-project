import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Download } from 'lucide-react';

export default function TariffBreakdownTable({ tariffRevenue }) {
    const tariffs = Array.isArray(tariffRevenue) ? tariffRevenue : [];

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Tariff breakdown
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Billed, collected, and collection rate by plan
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900"
                        onClick={() =>
                            (window.location.href = route('payments.export'))
                        }
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>
            <CardContent className="p-5">
                <div className="overflow-x-auto rounded-lg border border-border/60">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-semibold">
                                    Tariff plan
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    Billed
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    Collected
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    Outstanding
                                </TableHead>
                                <TableHead className="text-right font-semibold">
                                    Rate
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tariffs.map((tariff, index) => {
                                const totalBilled =
                                    Number(tariff.total_billed) || 0;
                                const collected =
                                    Number(tariff.collected) || 0;
                                const outstanding = Math.max(
                                    0,
                                    Math.round(
                                        (totalBilled - collected) * 100,
                                    ) / 100,
                                );
                                const rate =
                                    totalBilled > 0
                                        ? (collected / totalBilled) * 100
                                        : 0;
                                const key =
                                    tariff.id != null
                                        ? `tariff-${tariff.id}`
                                        : `tariff-${index}`;
                                return (
                                    <TableRow
                                        key={key}
                                        className="transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell className="font-medium">
                                            {tariff.name ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            {formatCurrency(totalBilled)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
                                            {formatCurrency(collected)}
                                        </TableCell>
                                        <TableCell className="text-right text-amber-600 tabular-nums dark:text-amber-400">
                                            {formatCurrency(outstanding)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge
                                                variant="secondary"
                                                className={
                                                    rate >= 90
                                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                                        : rate >= 70
                                                          ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                                          : 'bg-muted'
                                                }
                                            >
                                                {Number.isFinite(rate)
                                                    ? rate.toFixed(1)
                                                    : '0.0'}
                                                %
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
                {tariffs.length === 0 && (
                    <p className="py-12 text-center text-sm text-muted-foreground">
                        No tariff data available
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
