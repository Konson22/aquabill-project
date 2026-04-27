import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, FileText, Printer, Zap } from 'lucide-react';
import { useState } from 'react';

export default function BillPrintingList({ bills }) {
    const billItems = Array.isArray(bills) ? bills : bills?.data || [];
    const pendingBills = billItems;
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedZone, setSelectedZone] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const monthOptions = Array.from(
        new Set(
            pendingBills.map((bill) =>
                new Date(bill.created_at).toISOString().slice(0, 7),
            ),
        ),
    ).sort((a, b) => b.localeCompare(a));
    const zoneOptions = Array.from(
        new Map(
            pendingBills
                .map((bill) => bill.customer?.zone)
                .filter((zone) => zone && zone.id)
                .map((zone) => [zone.id, zone]),
        ).values(),
    );
    const filteredBills = pendingBills.filter((bill) => {
        const billMonth = new Date(bill.created_at)
            .toISOString()
            .slice(0, 7);
        const monthMatch =
            selectedMonth === 'all' || billMonth === selectedMonth;
        const zoneMatch =
            selectedZone === 'all' ||
            String(bill.customer?.zone?.id) === selectedZone;
        const searchValue = searchTerm.trim().toLowerCase();
        const searchMatch =
            !searchValue ||
            String(bill.id).includes(searchValue) ||
            bill.customer?.name?.toLowerCase().includes(searchValue) ||
            bill.meter?.meter_number?.toLowerCase().includes(searchValue);
        return monthMatch && zoneMatch && searchMatch;
    });
    const allSelected =
        filteredBills.length > 0 &&
        filteredBills.every((bill) => selectedIds.includes(bill.id));

    const toggleSelectAll = (checked) => {
        setSelectedIds(checked ? filteredBills.map((bill) => bill.id) : []);
    };

    const toggleBillSelection = (billId, checked) => {
        setSelectedIds((prev) => {
            if (checked) {
                return prev.includes(billId) ? prev : [...prev, billId];
            }

            return prev.filter((id) => id !== billId);
        });
    };

    const printAllUrl =
        filteredBills.length > 0
            ? route('bills.bulk-print', {
                  ids: filteredBills.map((bill) => bill.id).join(','),
              })
            : null;

    const breadcrumbs = [
        {
            title: 'Dashboard',
            href: route('dashboard'),
        },
        {
            title: 'Bills',
            href: route('bills.index'),
        },
        {
            title: 'Pending Bills',
            href: route('bills.printing-list'),
        },
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pending Bills" />

            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between">
                      
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2">
                            <select
                                id="filter-month"
                                className="h-11 rounded-md border border-input bg-white px-3 text-sm"
                                value={selectedMonth}
                                onChange={(event) =>
                                    setSelectedMonth(event.target.value)
                                }
                            >
                                <option value="all">All Months</option>
                                {monthOptions.map((month) => (
                                    <option key={month} value={month}>
                                        {month}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                id="filter-zone"
                                className="h-11 rounded-md border border-input bg-white px-3 text-sm"
                                value={selectedZone}
                                onChange={(event) =>
                                    setSelectedZone(event.target.value)
                                }
                            >
                                <option value="all">All Zones</option>
                                {zoneOptions.map((zone) => (
                                    <option key={zone.id} value={zone.id}>
                                        {zone.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Button
                            className="h-10 gap-2"
                            asChild={!!printAllUrl}
                            disabled={!printAllUrl}
                        >
                            {printAllUrl ? (
                                <a
                                    href={printAllUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print All
                                </a>
                            ) : (
                                <span>
                                    <Printer className="h-4 w-4" />
                                    Print All
                                </span>
                            )}
                        </Button>
                    </div>
               </div>

                <Card className="flex flex-1 flex-col overflow-hidden shadow-none">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Pending Bills
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Total bills: {filteredBills.length}
                            </p>
                        </div>
                        <div className="w-full max-w-sm">
                            <Input
                                placeholder="Search bill, customer, meter..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table className="w-full border-collapse text-left">
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[48px]">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4"
                                            checked={allSelected}
                                            onChange={(event) =>
                                                toggleSelectAll(
                                                    event.target.checked,
                                                )
                                            }
                                            aria-label="Select all pending bills"
                                        />
                                    </TableHead>
                                    <TableHead className="w-[140px]">
                                        Bill ID
                                    </TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Meter No</TableHead>
                                    <TableHead>Billing Date</TableHead>
                                    <TableHead className="text-right">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Balance
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBills.length > 0 ? (
                                    filteredBills.map((bill) => (
                                        <TableRow
                                            key={bill.id}
                                            className="hover:bg-muted/5"
                                        >
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4"
                                                    checked={selectedIds.includes(
                                                        bill.id,
                                                    )}
                                                    onChange={(event) =>
                                                        toggleBillSelection(
                                                            bill.id,
                                                            event.target.checked,
                                                        )
                                                    }
                                                    aria-label={`Select bill #${String(bill.id).padStart(6, '0')}`}
                                                />
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                <Link
                                                    href={route(
                                                        'bills.show',
                                                        bill.id,
                                                    )}
                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    <FileText className="h-3 w-3" />
                                                    #{String(bill.id).padStart(6, '0')}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">
                                                        {bill.customer?.name ||
                                                            'Unknown'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 font-mono text-sm">
                                                    {bill.meter ? (
                                                        <>
                                                            <Zap className="h-3 w-3 text-amber-500" />
                                                            {bill.meter.meter_number}
                                                        </>
                                                    ) : (
                                                        <span className="text-muted-foreground">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="whitespace-nowrap">
                                                        {formatDate(
                                                            bill.created_at,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        bill.total_amount,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-sm text-muted-foreground">
                                                    {formatCurrency(
                                                        bill.current_balance,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="destructive"
                                                    className="capitalize"
                                                >
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    asChild
                                                    className="gap-2"
                                                >
                                                    <a
                                                        href={route(
                                                            'bills.print',
                                                            bill.id,
                                                        )}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        Print
                                                    </a>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText className="h-8 w-8 opacity-20" />
                                                <p>
                                                    No pending bills available.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                </Card>
            </div>
        </AppLayout>
    );
}