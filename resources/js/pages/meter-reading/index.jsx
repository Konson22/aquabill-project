import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Activity, ChevronsUpDown, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function MeterReadings({ meterReadings, meters }) {
    const { auth } = usePage().props;
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        meter_id: '',
        reading_date: new Date().toISOString().split('T')[0],
        current_reading: '',
        status: 'pending',
    });

    const filteredMeters =
        query === ''
            ? meters
            : meters.filter((meter) =>
                  (meter.meter_number + meter.customer_name + meter.address)
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .includes(query.toLowerCase().replace(/\s+/g, '')),
              );

    const submitReading = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route('meter-readings.update', editingId), {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    setEditingId(null);
                    setSelectedMeter(null);
                    setQuery('');
                },
            });
        } else {
            post(route('meter-readings.store'), {
                onSuccess: () => {
                    setOpen(false);
                    reset();
                    setSelectedMeter(null);
                    setQuery('');
                },
            });
        }
    };

    const handleEdit = (reading) => {
        setEditingId(reading.id);
        setData({
            meter_id: reading.meter_id,
            reading_date: reading.reading_date,
            current_reading: reading.current_reading,
            status: reading.status,
        });
        setSelectedMeter(meters.find((m) => m.id === reading.meter_id) || null);
        setOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this reading?')) {
            router.delete(route('meter-readings.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Meter Readings',
            href: route('meter-readings'),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Readings" />
            <div className="flex h-full flex-col gap-6 p-4 md:p-0">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Meter Readings
                        </h1>
                        <p className="text-muted-foreground">
                            History of meter readings and consumption.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            asChild
                            className="h-10 gap-2 bg-white"
                        >
                            <Link href={route('meter-readings.report')}>
                                <Activity className="h-4 w-4" />
                                Reports
                            </Link>
                        </Button>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <Button
                                className="h-10"
                                onClick={() => {
                                    reset();
                                    setEditingId(null);
                                    setSelectedMeter(null);
                                    setQuery('');
                                    setOpen(true);
                                }}
                            >
                                Add Reading
                            </Button>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingId
                                            ? 'Edit Reading'
                                            : 'Add Meter Reading'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={submitReading}
                                    className="grid gap-4 py-4"
                                >
                                    <div className="grid gap-2">
                                        <Label htmlFor="meter">Meter</Label>
                                        <Combobox
                                            value={selectedMeter}
                                            onChange={(val) => {
                                                setSelectedMeter(val);
                                                setData('meter_id', val?.id);
                                            }}
                                            onClose={() => setQuery('')}
                                        >
                                            <div className="relative">
                                                <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-background text-left shadow-sm focus:outline-none sm:text-sm">
                                                    <ComboboxInput
                                                        className={cn(
                                                            'flex h-10 w-full rounded-md border border-input bg-transparent py-2 pr-10 pl-3 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                                                        )}
                                                        displayValue={(
                                                            meter,
                                                        ) =>
                                                            meter
                                                                ? `${meter.meter_number} - ${meter.customer_name}`
                                                                : ''
                                                        }
                                                        onChange={(event) =>
                                                            setQuery(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Search meter, customer or address..."
                                                    />
                                                    <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                        <ChevronsUpDown
                                                            className="h-4 w-4 text-muted-foreground"
                                                            aria-hidden="true"
                                                        />
                                                    </ComboboxButton>
                                                </div>
                                                <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                                    {filteredMeters.length ===
                                                        0 && query !== '' ? (
                                                        <div className="relative cursor-default px-4 py-2 text-muted-foreground select-none">
                                                            Nothing found.
                                                        </div>
                                                    ) : (
                                                        filteredMeters.map(
                                                            (meter) => (
                                                                <ComboboxOption
                                                                    key={
                                                                        meter.id
                                                                    }
                                                                    className={({
                                                                        active,
                                                                    }) =>
                                                                        `relative cursor-default py-2 pr-4 pl-10 select-none ${
                                                                            active
                                                                                ? 'bg-accent text-accent-foreground'
                                                                                : 'text-popover-foreground'
                                                                        }`
                                                                    }
                                                                    value={
                                                                        meter
                                                                    }
                                                                >
                                                                    {({
                                                                        selected,
                                                                        active,
                                                                    }) => (
                                                                        <>
                                                                            <div className="flex flex-col">
                                                                                <span
                                                                                    className={`block truncate ${
                                                                                        selected
                                                                                            ? 'font-medium'
                                                                                            : 'font-normal'
                                                                                    }`}
                                                                                >
                                                                                    {
                                                                                        meter.meter_number
                                                                                    }{' '}
                                                                                    -{' '}
                                                                                    {
                                                                                        meter.customer_name
                                                                                    }
                                                                                </span>
                                                                                <span className="truncate text-xs text-muted-foreground">
                                                                                    {
                                                                                        meter.address
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            {selected ? (
                                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                                                    <Check
                                                                                        className="h-4 w-4"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </span>
                                                                            ) : null}
                                                                        </>
                                                                    )}
                                                                </ComboboxOption>
                                                            ),
                                                        )
                                                    )}
                                                </ComboboxOptions>
                                            </div>
                                        </Combobox>
                                        {errors.meter_id && (
                                            <span className="text-xs text-red-500">
                                                {errors.meter_id}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">
                                            Reading Date
                                        </Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.reading_date}
                                            onChange={(e) =>
                                                setData(
                                                    'reading_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.reading_date && (
                                            <span className="text-xs text-red-500">
                                                {errors.reading_date}
                                            </span>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Previous Reading</Label>
                                        <Input
                                            value={
                                                selectedMeter?.last_reading ??
                                                '0'
                                            }
                                            disabled
                                            className="bg-muted"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_reading">
                                            Current Reading
                                        </Label>
                                        <div className="flex flex-col gap-1">
                                            <Input
                                                id="reading"
                                                type="number"
                                                step="0.01"
                                                value={data.current_reading}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData(
                                                        'current_reading',
                                                        val,
                                                    );
                                                }}
                                                placeholder="0.00"
                                            />
                                            {selectedMeter &&
                                                (selectedMeter.last_reading ||
                                                    selectedMeter.last_reading ===
                                                        0) &&
                                                parseFloat(
                                                    data.current_reading || '0',
                                                ) <=
                                                    parseFloat(
                                                        selectedMeter.last_reading,
                                                    ) && (
                                                    <span className="text-xs text-red-500">
                                                        Must be greater than
                                                        previous reading (
                                                        {
                                                            selectedMeter.last_reading
                                                        }
                                                        )
                                                    </span>
                                                )}
                                        </div>
                                        {errors.current_reading && (
                                            <span className="text-xs text-red-500">
                                                {errors.current_reading}
                                            </span>
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                (selectedMeter &&
                                                    (selectedMeter.last_reading ||
                                                        selectedMeter.last_reading ===
                                                            0) &&
                                                    parseFloat(
                                                        data.current_reading ||
                                                            '0',
                                                    ) <=
                                                        parseFloat(
                                                            selectedMeter.last_reading,
                                                        ))
                                            }
                                        >
                                            Save Reading
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="flex flex-1 flex-col overflow-hidden border-t-2 border-slate-200">
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted/50">
                                <TableRow>
                                    <TableHead>Meter Serial</TableHead>
                                    <TableHead>Home / Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Bill</TableHead>
                                    <TableHead>Readings</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {meterReadings.data.length > 0 ? (
                                    meterReadings.data.map((reading) => (
                                        <TableRow
                                            key={reading.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell className="font-medium">
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono"
                                                >
                                                    {reading.meter
                                                        ?.meter_number || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {reading.home?.customer
                                                            ?.name || 'Unknown'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {reading.home
                                                            ?.address || '-'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    reading.reading_date,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {reading.bill ? (
                                                    <Link
                                                        href={route(
                                                            'bills.show',
                                                            reading.bill.id,
                                                        )}
                                                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                                    >
                                                        {
                                                            reading.bill
                                                                .bill_number
                                                        }
                                                        <Eye className="h-3 w-3" />
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        -
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1 text-xs">
                                                    <div className="flex w-24 justify-between">
                                                        <span className="text-muted-foreground">
                                                            Prev:
                                                        </span>
                                                        <span>
                                                            {
                                                                reading.previous_reading
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex w-24 justify-between">
                                                        <span className="font-medium">
                                                            Curr:
                                                        </span>
                                                        <span className="font-bold">
                                                            {
                                                                reading.current_reading
                                                            }
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {(
                                                    parseFloat(
                                                        reading.current_reading,
                                                    ) -
                                                    parseFloat(
                                                        reading.previous_reading,
                                                    )
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        reading.bill?.status ===
                                                        'overdue'
                                                            ? 'destructive'
                                                            : 'outline'
                                                    }
                                                    className="capitalize"
                                                >
                                                    {reading.bill?.status ===
                                                    'overdue'
                                                        ? 'Overdue'
                                                        : reading.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="View Details"
                                                        className="h-8 w-8"
                                                    >
                                                        <Link
                                                            href={route(
                                                                'meter-readings.show',
                                                                reading.id,
                                                            )}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {auth.user?.department ===
                                                        'admin' &&
                                                        (!reading.bill ||
                                                            reading.bill
                                                                .status ===
                                                                'pending') && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            reading,
                                                                        )
                                                                    }
                                                                    title="Edit"
                                                                    className="h-8 w-8"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            handleDelete(
                                                                reading.id,
                                                            )
                                                        }
                                                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            No meter readings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="border-t p-4">
                        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-muted-foreground">
                                Showing{' '}
                                <span className="font-medium">
                                    {meterReadings.from || 0}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {meterReadings.to || 0}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">
                                    {meterReadings.total}
                                </span>{' '}
                                results
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {meterReadings.links &&
                                    meterReadings.links.map((link, index) => {
                                        const label = link.label
                                            .replace('&laquo; Previous', 'Prev')
                                            .replace('Next &raquo;', 'Next');
                                        return (
                                            <Button
                                                key={index}
                                                variant={
                                                    link.active
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                disabled={!link.url}
                                                asChild={!!link.url}
                                                className={
                                                    !link.url
                                                        ? 'cursor-default opacity-50'
                                                        : ''
                                                }
                                            >
                                                {link.url ? (
                                                    <Link
                                                        href={link.url}
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                ) : (
                                                    <span
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                )}
                                            </Button>
                                        );
                                    })}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
