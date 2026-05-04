import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    CreditCard,
    ExternalLink,
    Search,
    TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs = [{ title: 'Overdue Bills', href: '/bills/overdue-bills' }];

function daysOverdue(dueDate) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Number.isFinite(days) && days > 0 ? days : null;
}

export default function OverdueBills({ bills }) {
    const [search, setSearch] = useState('');

    const filteredBills = useMemo(() => {
        const data = bills?.data ?? [];
        const needle = search.trim().toLowerCase();
        if (!needle) return data;

        return data.filter((bill) => {
            const id = String(bill.id ?? '').toLowerCase();
            const customerName = String(bill.customer?.name ?? '').toLowerCase();
            const account = String(bill.customer?.account_number ?? '').toLowerCase();
            const meter = String(bill.meter?.meter_number ?? '').toLowerCase();

            return (
                id.includes(needle) ||
                customerName.includes(needle) ||
                account.includes(needle) ||
                meter.includes(needle)
            );
        });
    }, [bills?.data, search]);

    const totals = useMemo(() => {
        const data = filteredBills;
        const totalOverdue = data.reduce((acc, b) => acc + Number(b.total_amount ?? 0), 0);
        const totalArrears = data.reduce((acc, b) => acc + Number(b.previous_balance ?? 0), 0);
        const maxDays = data.reduce((acc, b) => Math.max(acc, daysOverdue(b.due_date) ?? 0), 0);

        return {
            count: data.length,
            totalOverdue,
            totalArrears,
            maxDays,
        };
    }, [filteredBills]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Overdue Bills" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <TriangleAlert className="h-6 w-6 text-amber-600" />
                            Overdue Bills
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Unpaid bills with a due date that has already passed.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('bills.printing-list')}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Process Payments
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={route('bills.index')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                All Bills
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Overdue Count</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                                    <AlertCircle className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{totals.count.toLocaleString()}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Bills currently overdue</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Total Due</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-rose-50 flex items-center justify-center text-rose-700">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-rose-700">{formatCurrency(totals.totalOverdue)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Sum of totals for the list</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Arrears</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-700">
                                    <Calendar className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{formatCurrency(totals.totalArrears)}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Previous balances included</div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-muted-foreground">Max Days Late</CardTitle>
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{totals.maxDays.toLocaleString()}</div>
                            <div className="mt-1 text-xs text-muted-foreground">Worst case in current list</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full md:w-[28rem]">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by invoice #, customer, account, or meter..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="uppercase text-[9px] font-black tracking-widest">
                            Unpaid
                        </Badge>
                        <Badge variant="outline" className="uppercase text-[9px] font-black tracking-widest">
                            Due Date Passed
                        </Badge>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <TableHead className="px-4 py-3 text-center w-24">Invoice</TableHead>
                                <TableHead className="px-4 py-3">Customer</TableHead>
                                <TableHead className="px-4 py-3">Due Date</TableHead>
                                <TableHead className="px-4 py-3 text-right">Days Late</TableHead>
                                <TableHead className="px-4 py-3 text-right">Total Due</TableHead>
                                <TableHead className="px-4 py-3 text-right">Arrears</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.length > 0 ? (
                                filteredBills.map((bill) => {
                                    const overdueDays = daysOverdue(bill.due_date);

                                    return (
                                        <TableRow key={bill.id}>
                                            <TableCell className="px-4 py-4 text-center">
                                                <span className="font-mono text-xs font-bold text-muted-foreground">
                                                    #{String(bill.id).padStart(6, '0')}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground">{bill.customer?.name ?? '—'}</span>
                                                    <span className="text-xs text-muted-foreground">{bill.customer?.account_number ?? ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                                                {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-right">
                                                {overdueDays ? (
                                                    <Badge variant="outline" className="font-mono text-[10px] border-amber-200 text-amber-700 bg-amber-50/40">
                                                        {overdueDays}d
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-right font-mono text-rose-700">
                                                {formatCurrency(bill.total_amount)}
                                            </TableCell>
                                            <TableCell className="px-4 py-4 text-right font-mono text-muted-foreground">
                                                {formatCurrency(bill.previous_balance)}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                                        No overdue bills found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {bills?.links?.length > 3 && (
                        <div className="flex items-center justify-between border-t px-4 py-4 bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Showing {bills.from} to {bills.to} of {bills.total} overdue bills
                            </span>
                            <div className="flex items-center gap-1">
                                {bills.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        className="h-8 px-2 min-w-8"
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {link.label === '&laquo; Previous' ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : link.label === 'Next &raquo;' ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    link.label
                                                )}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : link.label === 'Next &raquo;' ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    link.label
                                                )}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
