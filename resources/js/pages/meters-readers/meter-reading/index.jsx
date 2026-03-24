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
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    Combobox,
    ComboboxButton,
    ComboboxInput,
    ComboboxOption,
    ComboboxOptions,
} from '@headlessui/react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Camera,
    Check,
    ChevronsUpDown,
    Eye,
    Pencil,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const MONTH_OPTIONS = (() => {
    const opts = [{ value: 'all', label: 'All months' }];
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        opts.push({
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
            label: d.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
            }),
        });
    }
    return opts;
})();

export default function MeterReadings({ meterReadings, meters, filters = {} }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedMeter, setSelectedMeter] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [month, setMonth] = useState(filters.month || 'all');

    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('meter-readings'),
                {
                    month: month && month !== 'all' ? month : undefined,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);
        return () => clearTimeout(timer);
    }, [month]);

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

    const handleAddOpen = () => {
        setEditingId(null);
        reset();
        setSelectedMeter(null);
        setQuery('');
        setData({
            meter_id: '',
            reading_date: new Date().toISOString().split('T')[0],
            current_reading: '',
            status: 'pending',
        });
        setOpen(true);
    };

    const handleEdit = (reading) => {
        setEditingId(reading.id);
        const dateStr =
            (reading.reading_date?.date || reading.reading_date || '')
                .toString()
                .split('T')[0] || new Date().toISOString().split('T')[0];
        setData({
            meter_id: reading.meter_id,
            reading_date: dateStr,
            current_reading: reading.current_reading,
            status: reading.status,
        });
        setSelectedMeter(meters.find((m) => m.id === reading.meter_id) || null);
        setOpen(true);
    };

    const handleDialogClose = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setEditingId(null);
            setSelectedMeter(null);
            setQuery('');
            reset();
        }
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

    const filteredReadings = meterReadings.data.filter((reading) => {
        if (reading.is_initial !== false) return false;
        if (!search.trim()) return true;
        const term = search.toLowerCase();
        return (
            reading.meter?.meter_number?.toLowerCase().includes(term) ||
            reading.customer?.name?.toLowerCase().includes(term) ||
            reading.home?.customer?.name?.toLowerCase().includes(term) ||
            reading.bill?.bill_number?.toLowerCase().includes(term)
        );
    });

    const clearFilters = () => {
        setMonth('all');
        setSearch('');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Meter Readings" />
            <div className="flex flex-col gap-8 pb-10">
                {/* Page header */}
                <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Meter Readings
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Track readings and consumption by meter.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="h-9 w-[180px] bg-background">
                                <SelectValue placeholder="All months" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTH_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" asChild className="gap-2">
                            <Link href={route('meter-readings.report')}>
                                <Activity className="h-4 w-4" />
                                Reports
                            </Link>
                        </Button>
                        <Button size="sm" onClick={handleAddOpen} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Reading
                        </Button>
                        <Dialog open={open} onOpenChange={handleDialogClose}>
                            <DialogContent className="gap-0 p-0 sm:max-w-[420px]">
                                <DialogHeader className="border-b px-6 py-4">
                                    <DialogTitle className="text-base">
                                        {editingId
                                            ? 'Edit Reading'
                                            : 'Add Meter Reading'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form
                                    onSubmit={submitReading}
                                    className="grid gap-4 px-6 py-5"
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
                                        <Label>Last Reading</Label>
                                        <Input
                                            value={
                                                selectedMeter?.last_reading ??
                                                '0'
                                            }
                                            disabled
                                            className="bg-muted font-mono"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Current reading must be greater than
                                            last reading.
                                        </p>
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
                                                min={
                                                    selectedMeter?.last_reading ??
                                                    0
                                                }
                                                value={data.current_reading}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setData(
                                                        'current_reading',
                                                        val,
                                                    );
                                                }}
                                                placeholder={
                                                    selectedMeter?.last_reading !=
                                                    null
                                                        ? String(
                                                              selectedMeter.last_reading,
                                                          )
                                                        : '0.00'
                                                }
                                            />
                                            {selectedMeter &&
                                                (selectedMeter.last_reading !=
                                                    null ||
                                                    selectedMeter.last_reading ===
                                                        0) &&
                                                parseFloat(
                                                    data.current_reading || '0',
                                                ) <=
                                                    parseFloat(
                                                        selectedMeter.last_reading,
                                                    ) && (
                                                    <span className="text-xs text-red-500">
                                                        Current reading must be
                                                        greater than last
                                                        reading (
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
                                    <DialogFooter className="border-t px-6 py-4">
                                        <Button
                                            type="submit"
                                            size="sm"
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
                </header>

                {/* Readings card */}
                <Card className="overflow-hidden rounded-xl border border-border/80 shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-border/60  px-5 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            Reading history
                            <Badge variant="secondary" className="font-mono text-xs">
                                {meterReadings.total ?? 0}
                            </Badge>
                        </h2>
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:justify-end sm:pl-4">
                            <div className="relative min-w-0 flex-1 sm:max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Meter, customer, or bill number..."
                                    className="h-12 w-full bg-gray-50 pl-9"
                                />
                            </div>
                            {(search || (month && month !== 'all')) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/60 hover:bg-transparent">
                                    <TableHead className="w-0 whitespace-nowrap text-xs font-medium text-muted-foreground">
                                        Meter
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Customer
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Date
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Prev
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Curr
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Usage
                                    </TableHead>
                                    <TableHead className="text-xs font-medium text-muted-foreground">
                                        Bill
                                    </TableHead>
                                    <TableHead className="w-0 text-right text-xs font-medium text-muted-foreground">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredReadings.length > 0 ? (
                                    filteredReadings.map((reading) => (
                                        <TableRow
                                            key={reading.id}
                                            className="border-border/40 hover:bg-muted/40"
                                        >
                                            <TableCell className="whitespace-nowrap py-3">
                                                <Badge variant="secondary" className="font-mono text-xs">
                                                    {reading.meter?.meter_number || '-'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-3 text-sm">
                                                {reading.customer?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap py-3">
                                                <div className="flex items-center gap-1.5 text-sm">
                                                    {formatDate(reading.reading_date)}
                                                    {reading.image && (
                                                        <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 font-mono text-sm text-muted-foreground">
                                                {reading.previous_reading}
                                            </TableCell>
                                            <TableCell className="py-3 font-mono text-sm font-medium">
                                                {reading.current_reading}
                                            </TableCell>
                                            <TableCell className="py-3 font-mono text-sm">
                                                {(
                                                    parseFloat(reading.current_reading) -
                                                    parseFloat(reading.previous_reading)
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="py-3">
                                                {reading.bill ? (
                                                    <Link
                                                        href={route('bills.show', reading.bill.id)}
                                                        className="text-sm font-medium text-primary hover:underline"
                                                    >
                                                        {reading.bill.bill_number}
                                                    </Link>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="py-3 text-right">
                                                <div className="flex justify-end gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        asChild
                                                        title="View"
                                                        className="h-8 w-8"
                                                    >
                                                        <Link href={route('meter-readings.show', reading.id)}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    {(!reading.bill ||
                                                        reading.bill.status ===
                                                            'pending') && (
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
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(reading.id)}
                                                        disabled={
                                                            reading.bill &&
                                                            ['fully paid', 'forwarded', 'partial paid', 'balance forwarded'].includes(
                                                                reading.bill.status,
                                                            )
                                                        }
                                                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                                            className="h-40 text-center text-sm text-muted-foreground"
                                        >
                                            No meter readings found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{meterReadings.from ?? 0}</span> to{' '}
                            <span className="font-medium text-foreground">{meterReadings.to ?? 0}</span> of{' '}
                            <span className="font-medium text-foreground">{meterReadings.total ?? 0}</span> results
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {meterReadings.links?.map((link, index) => {
                                const label = link.label
                                    .replace('&laquo; Previous', 'Prev')
                                    .replace('Next &raquo;', 'Next');
                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        asChild={!!link.url}
                                        className={!link.url ? 'pointer-events-none opacity-50' : 'min-w-9'}
                                    >
                                        {link.url ? (
                                            <Link href={link.url} dangerouslySetInnerHTML={{ __html: label }} />
                                        ) : (
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
