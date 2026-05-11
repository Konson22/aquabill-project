import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PaymentModal from '@/components/payment-modal';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, cn } from '@/lib/utils';
import {
    Search,
    Download,
    Eye,
    MoreHorizontal,
    Printer,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    DollarSign,
} from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Billing & Invoices',
        href: '/bills',
    },
];

/** Payment is only for fully pending bills (not partial, paid, or forwarded). */
function canRecordPayment(status) {
    return status === 'pending';
}

export default function Bills({ bills, filters = {} }) {
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [activeBill, setActiveBill] = useState(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                route('bills.index'),
                {
                    search: search || undefined,
                    status: status !== 'all' ? status : undefined
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    replace: true,
                    only: ['bills', 'filters'],
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status]);

    const openPayment = (bill) => {
        setActiveBill(bill);
        setPaymentOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Invoices" />

            <div className="flex h-full w-full flex-col gap-6 p- md:p-3 animate-in fade-in duration-500">


                <div className="flex flex-col flex-1 bg-card rounded-2xl border shadow-sm overflow-hidden">
                    {/* Header with Tabs and Actions */}
                    <div className="bg-sky-800 pt-4 px-4 sm:px-6 flex flex-col md:flex-row gap-4 md:items-end justify-between">
                        <Tabs value={status} onValueChange={setStatus} className="w-full md:w-auto -mb-px overflow-hidden">
                            <TabsList className="flex w-full md:w-auto bg-transparent p-0 h-auto gap-1 overflow-x-auto hide-scrollbar">
                                <TabsTrigger
                                    value="all"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-[#6366f1] text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    All
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pending"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-[#6366f1] text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    Unpaid
                                </TabsTrigger>
                                <TabsTrigger
                                    value="partial"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-[#6366f1] text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    Partial
                                </TabsTrigger>
                                <TabsTrigger
                                    value="paid"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-[#6366f1] text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    Fully Paid
                                </TabsTrigger>
                                <TabsTrigger
                                    value="forwarded"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-[#6366f1] text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    Forwarded
                                </TabsTrigger>
                                <TabsTrigger
                                    value="overdue"
                                    className="whitespace-nowrap rounded-t-lg rounded-b-none border-0 px-6 py-2.5 text-[13px] font-bold transition-colors data-[state=active]:bg-card data-[state=active]:text-red-500 text-white/70 hover:bg-white/20 hover:text-white data-[state=inactive]:bg-white/10 data-[state=active]:shadow-none"
                                >
                                    Overdue
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="flex items-center gap-3 pb-3">
                            <Button variant="outline" size="sm" className="h-9 gap-2 shadow-sm rounded-lg bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white" asChild>
                                <a href={route('bills.export', { search: search || undefined, status: status !== 'all' ? status : undefined })}>
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Export</span>
                                </a>
                            </Button>
                            <Button size="sm" className="h-9 gap-2 bg-white text-[#6366f1] hover:bg-white/90 shadow-sm rounded-lg font-semibold" asChild>
                                <Link href={route('bills.printing-list')}>
                                    <CreditCard className="h-4 w-4" />
                                    <span className="hidden sm:inline">Print bills</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Toolbar: Search */}
                    <div className="flex items-center p-4 border-b ">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by Bill #, Customer name, Phone, or Meter..."
                                className="pl-9 bg-background border-gray-300/70 focus-visible:bg-background focus-visible:border-primary/30 h-10 rounded-xl transition-all"
                            />
                        </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="flex-1">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted border-y text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/30">
                                    <TableHead className="px-6 py-4 text-center ">Bill Number</TableHead>
                                    <TableHead className="px-6 py-4">Customer Details</TableHead>
                                    <TableHead className="px-6 py-4 ">Usage m³</TableHead>
                                    <TableHead className="px-6 py-4 ">Arrears</TableHead>
                                    <TableHead className="px-6 py-4 ">Current Charge</TableHead>
                                    <TableHead className="px-6 py-4 ">Total Due</TableHead>
                                    <TableHead className="px-6 py-4 text-center ">Status</TableHead>
                                    <TableHead className="px-6 py-4 text-right ">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                                            No bills found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bills.data.map((bill) => (
                                        <TableRow key={bill.bill_no} className="group hover:bg-blue-50/40 transition-colors duration-200 text-sm font-normal">
                                            <TableCell className="px-6 py-4 ">
                                                <span className="font-mono text-muted-foreground">#{String(bill.bill_no).padStart(6, '0')}</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {bill.customer?.name}
                                            </TableCell>

                                            <TableCell className="px-6 py-4 ">
                                                {bill.consumption} <span className="text-muted-foreground">m³</span>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 ">
                                                {formatCurrency(bill.previous_balance)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 ">
                                                {formatCurrency(bill.current_charge)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4  text-foreground">
                                                {formatCurrency(bill.total_amount)}
                                            </TableCell>

                                            <TableCell className="px-6 py-4 text-center ">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "uppercase text-[9px] font-black tracking-widest shadow-sm px-2 py-0.5",
                                                        bill.status === 'paid'
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                                            : bill.status === 'forwarded' || bill.status === 'partial'
                                                                ? 'bg-muted text-muted-foreground border-transparent hover:bg-muted'
                                                                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50'
                                                    )}
                                                >
                                                    {bill.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right ">
                                                <div className="flex justify-end opacity-80 transition-opacity group-hover:opacity-100">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 rounded-lg shadow-sm"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-md">
                                                            <DropdownMenuItem
                                                                disabled={!canRecordPayment(bill.status)}
                                                                title={
                                                                    !canRecordPayment(bill.status)
                                                                        ? 'Payments are only available while the bill is pending'
                                                                        : 'Record payment'
                                                                }
                                                                onSelect={() => openPayment(bill)}
                                                                className="cursor-pointer gap-2 py-2"
                                                            >
                                                                <DollarSign
                                                                    className={`h-4 w-4 ${canRecordPayment(bill.status) ? 'text-emerald-600' : 'text-muted-foreground'}`}
                                                                />
                                                                <span>Record payment</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link
                                                                    href={route('bills.print', bill.id)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="gap-2 py-2 w-full flex"
                                                                >
                                                                    <Printer className="h-4 w-4 text-muted-foreground" />
                                                                    <span>Print bill</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                                <Link href={route('bills.show', bill.id)} className="gap-2 py-2 w-full flex">
                                                                    <Eye className="h-4 w-4 text-blue-500" />
                                                                    <span>View bill</span>
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {bills.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/10">
                            <span className="text-xs font-medium text-muted-foreground">
                                Showing <span className="font-bold text-foreground">{bills.from}</span> to <span className="font-bold text-foreground">{bills.to}</span> of <span className="font-bold text-foreground">{bills.total}</span> invoices
                            </span>
                            <div className="flex items-center gap-1">
                                {bills.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        className="h-8 min-w-8 px-2 rounded-lg shadow-sm"
                                        asChild={!!link.url}
                                    >
                                        {link.url ? (
                                            <Link href={link.url}>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> :
                                                    link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> :
                                                        link.label}
                                            </Link>
                                        ) : (
                                            <span>
                                                {link.label === '&laquo; Previous' ? <ChevronLeft className="h-4 w-4" /> :
                                                    link.label === 'Next &raquo;' ? <ChevronRight className="h-4 w-4" /> :
                                                        link.label}
                                            </span>
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <PaymentModal
                open={paymentOpen}
                onOpenChange={(v) => {
                    setPaymentOpen(v);
                    if (!v) setActiveBill(null);
                }}
                bill={activeBill}
            />
        </AppLayout>
    );
}
