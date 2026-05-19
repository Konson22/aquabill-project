import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn, formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, Camera, Pencil, Printer, User } from 'lucide-react';

function formatDisplayDate(value) {
    if (!value) {
        return '—';
    }

    try {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return String(value);
    }
}

function billLabel(bill) {
    const raw = bill?.bill_no ?? bill?.id;

    return `#${String(raw).padStart(6, '0')}`;
}

function statusVariant(status) {
    if (status === 'paid') {
        return 'success';
    }

    if (status === 'pending') {
        return 'destructive';
    }

    return 'outline';
}

function DetailTable({ title, rows }) {
    return (
        <div className="overflow-hidden rounded-md border bg-card">
            {title ? (
                <div className="border-b bg-muted/40 px-4 py-2.5">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
                </div>
            ) : null}
            <Table>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow key={row.label}>
                            <TableCell className="w-[38%] bg-muted/20 py-3 text-sm font-medium text-muted-foreground">
                                {row.label}
                            </TableCell>
                            <TableCell className="py-3 text-sm text-foreground">{row.value}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function Show({ reading }) {
    const customer = reading?.meter?.customer;
    const bill = reading?.bill;
    const consumption =
        reading?.consumption ?? Math.max(0, Number(reading?.current_reading ?? 0) - Number(reading?.previous_reading ?? 0));

    const breadcrumbs = [
        { title: 'Meter readings', href: route('readings.index') },
        { title: `Reading #${reading.id}`, href: route('readings.show', reading.id) },
    ];

    const readingRows = [
        { label: 'Reading ID', value: <span className="font-mono">#{reading.id}</span> },
        { label: 'Reading date', value: formatDisplayDate(reading.reading_date) },
        { label: 'Meter number', value: <span className="font-mono">{reading.meter?.meter_number ?? '—'}</span> },
        { label: 'Recorded by', value: reading.recorder?.name ?? 'System' },
        { label: 'Previous reading', value: <span className="font-mono tabular-nums">{reading.previous_reading ?? 0} m³</span> },
        { label: 'Current reading', value: <span className="font-mono tabular-nums">{reading.current_reading ?? 0} m³</span> },
        { label: 'Consumption', value: <span className="font-mono font-semibold tabular-nums">{consumption} m³</span> },
    ];

    if (reading.notes) {
        readingRows.push({ label: 'Notes', value: reading.notes });
    }

    const customerRows = [
        {
            label: 'Customer',
            value: customer?.id ? (
                <Link href={route('customers.show', customer.id)} className="font-medium underline-offset-4 hover:underline">
                    {customer.name}
                </Link>
            ) : (
                '—'
            ),
        },
        { label: 'Account', value: <span className="font-mono">{customer?.account_number ?? '—'}</span> },
        { label: 'Zone', value: customer?.zone?.name ?? '—' },
        { label: 'Tariff', value: customer?.tariff?.name ?? '—' },
    ];

    const unitPrice = Number(bill?.unit_price ?? customer?.tariff?.price_per_unit ?? 0);
    const billConsumption = Number(bill?.consumption ?? consumption);
    const tariffAmount = billConsumption * unitPrice;

    const billRows = bill
        ? [
              { label: 'Bill', value: <span className="font-mono">{billLabel(bill)}</span> },
              {
                  label: 'Status',
                  value: (
                      <Badge variant={statusVariant(bill.status)} className="h-5 capitalize">
                          {bill.status}
                      </Badge>
                  ),
              },
              {
                  label: 'Tariff amount',
                  value: (
                      <span className="font-mono tabular-nums">
                          {formatCurrency(tariffAmount)}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            ({formatCurrency(unitPrice)}/m³ × {billConsumption} m³)
                          </span>
                      </span>
                  ),
              },
              { label: 'Usage charge', value: <span className="font-mono tabular-nums">{formatCurrency(bill.current_charge)}</span> },
              { label: 'Fixed charge', value: <span className="font-mono tabular-nums">{formatCurrency(bill.fixed_charge)}</span> },
              {
                  label: 'Arrears',
                  value: (
                      <span
                          className={cn(
                              'font-mono tabular-nums',
                              Number(bill.previous_balance) > 0 && 'font-semibold text-destructive',
                          )}
                      >
                          {formatCurrency(bill.previous_balance)}
                      </span>
                  ),
              },
              {
                  label: 'Total due',
                  value: <span className="font-mono font-semibold tabular-nums">{formatCurrency(bill.total_amount)}</span>,
              },
              {
                  label: 'Actions',
                  value: (
                      <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                              <Link href={route('bills.show', bill.id)}>
                                  View bill
                                  <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                              </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                              <a href={route('bills.print', bill.id)} target="_blank" rel="noopener noreferrer">
                                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                                  Print
                              </a>
                          </Button>
                      </div>
                  ),
              },
          ]
        : [{ label: 'Bill', value: <span className="text-muted-foreground">Not generated</span> }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Reading · ${reading.meter?.meter_number ?? reading.id}`} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button variant="ghost" size="sm" className="-ml-2 w-fit gap-2 text-muted-foreground" asChild>
                        <Link href={route('readings.index')}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to readings
                        </Link>
                    </Button>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('readings.edit', reading.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit reading
                            </Link>
                        </Button>
                        {customer?.id ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('customers.show', customer.id)}>
                                    <User className="mr-2 h-4 w-4" />
                                    View customer
                                </Link>
                            </Button>
                        ) : null}
                    </div>
                </div>

                <Card className="overflow-hidden border-border/60 shadow-sm">
                    <CardHeader className="border-b pb-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                                <CardTitle className="text-xl">{customer?.name ?? 'Meter reading'}</CardTitle>
                                <p className="text-sm font-normal text-muted-foreground">
                                    Reading #{reading.id}
                                    <span className="font-mono"> · {reading.meter?.meter_number}</span>
                                </p>
                            </div>
                            {bill ? (
                                <Badge variant={statusVariant(bill.status)} className="h-6 shrink-0 capitalize">
                                    Bill {bill.status}
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="h-6 shrink-0">
                                    No bill
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Previous</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Current</TableHead>
                                    <TableHead className="text-xs font-bold uppercase tracking-wider">Consumption</TableHead>
                                    <TableHead className="text-right text-xs font-bold uppercase tracking-wider">Total due</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-mono text-base font-medium tabular-nums">
                                        {reading.previous_reading ?? 0} m³
                                    </TableCell>
                                    <TableCell className="font-mono text-base font-medium tabular-nums">
                                        {reading.current_reading ?? 0} m³
                                    </TableCell>
                                    <TableCell className="font-mono text-base font-semibold tabular-nums">{consumption} m³</TableCell>
                                    <TableCell className="text-right font-mono text-base font-semibold tabular-nums">
                                        {bill ? formatCurrency(bill.total_amount) : '—'}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                            </Table>
                        </div>

                        <DetailTable title="Reading details" rows={readingRows} />
                        <DetailTable title="Customer" rows={customerRows} />
                        <DetailTable title="Billing" rows={billRows} />
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/60 shadow-sm">
                    <CardHeader className="border-b pb-3">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Reading proof
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex min-h-[240px] items-center justify-center bg-muted/10 p-4 pt-6">
                        {reading.image_url ? (
                            <img
                                src={reading.image_url}
                                alt="Meter reading proof"
                                className="max-h-[400px] w-full object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
                                <Camera className="h-8 w-8 opacity-40" />
                                <p className="text-sm">No image uploaded</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
