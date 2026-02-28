import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

function buildChartData(monthlyTrend) {
    const today = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const monthStr = `${year}-${month}`;
        const found = (monthlyTrend || []).find((m) => m.month === monthStr);
        months.push(
            found
                ? {
                      month: monthStr,
                      paid: Number(found.paid),
                      unpaid: Number(found.unpaid),
                  }
                : { month: monthStr, paid: 0, unpaid: 0 },
        );
    }
    return months;
}

export default function SettlementTrendChart({
    monthlyTrend,
    tariffs = [],
    zones = [],
    tariffId = 'all',
    zoneId = 'all',
    onTariffChange,
    onZoneChange,
}) {
    const chartData = buildChartData(monthlyTrend);
    const totalCollected = chartData.reduce((s, r) => s + (r.paid ?? 0), 0);
    const totalOutstanding = chartData.reduce((s, r) => s + (r.unpaid ?? 0), 0);
    const totalBilled = totalCollected + totalOutstanding;

    return (
        <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm lg:col-span-4">
            <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">
                        Settlement trend (12 months)
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Collected vs outstanding by month
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <Select value={tariffId} onValueChange={onTariffChange}>
                        <SelectTrigger className="h-9 w-[160px] bg-background">
                            <SelectValue placeholder="All tariffs" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All tariffs</SelectItem>
                            {tariffs.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={zoneId} onValueChange={onZoneChange}>
                        <SelectTrigger className="h-9 w-[160px] bg-background">
                            <SelectValue placeholder="All zones" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All zones</SelectItem>
                            {zones.map((z) => (
                                <SelectItem key={z.id} value={String(z.id)}>
                                    {z.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 shrink-0 gap-2 border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
                        onClick={() => (window.location.href = route('payments.export'))}
                    >
                        <Download className="h-4 w-4" />
                        Export as Excel
                    </Button>
                </div>
            </div>
            <CardContent className="px-3 pb-5 pt-0">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold">Month</TableHead>
                            <TableHead className="text-right font-semibold">Total Billed</TableHead>
                            <TableHead className="text-right font-semibold">Outstanding</TableHead>
                            <TableHead className="text-right font-semibold">Collected</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {chartData.map((row, i) => {
                            const [y, m] = (row.month || '').split('-');
                            const monthLabel = y && m
                                ? new Date(Number(y), Number(m) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' })
                                : row.month;
                            return (
                                <TableRow key={i} className="transition-colors hover:bg-muted/50">
                                    <TableCell className="font-medium">{monthLabel}</TableCell>
                                    <TableCell className="text-right tabular-nums text-muted-foreground">
                                        {formatCurrency(row.paid + row.unpaid)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                                        {formatCurrency(row.unpaid)}
                                    </TableCell>
                                    <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(row.paid)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow className="border-t-2 border-border font-semibold bg-muted/30 hover:bg-muted/40">
                            <TableCell className="font-semibold">Total</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">
                                {formatCurrency(totalBilled)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-amber-600 dark:text-amber-400">
                                {formatCurrency(totalOutstanding)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(totalCollected)}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
