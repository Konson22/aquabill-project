import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PaymentModal from '@/components/payment-modal';
import { formatCurrency } from '@/lib/utils';
import {
    FileText,
    Search,
    Filter,
    Calendar,
    Download,
    Eye,
    MoreHorizontal,
    Printer,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    AlertCircle
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

export default function Bills({ bills }) {
    const [paymentOpen, setPaymentOpen] = useState(false);
    const [activeBill, setActiveBill] = useState(null);

    const openPayment = (bill) => {
        setActiveBill(bill);
        setPaymentOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Billing & Invoices" />

            <div className="flex h-full flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileText className="h-6 w-6 text-blue-500" />
                            Billing & Invoices
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage customer invoices, track payments, and monitor outstanding balances.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                            <Link href={route('bills.printing-list')}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Process Payments
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Generated</p>
                            <p className="text-xl font-black">{bills.total}</p>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Unpaid</p>
                            <p className="text-xl font-black">
                                {bills.data.filter((b) => canRecordPayment(b.status)).length}
                            </p>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Revenue</p>
                            <p className="text-xl font-black text-emerald-600">
                                {formatCurrency(
                                    bills.data.reduce(
                                        (acc, b) =>
                                            acc + parseFloat(b.total_amount),
                                        0,
                                    ),
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Billing Cycle</p>
                            <p className="text-xl font-black">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by Invoice #, Customer or Account..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Status
                        </Button>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="flex-1 overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {/* <th className="px-6 py-4 text-center w-20">Invoice</th> */}
                                    <th className="px-6 py-4">Customer Details</th>
                                    <th className="px-6 py-4">Consumption</th>
                                    <th className="px-6 py-4">Amount Breakdown</th>
                                    <th className="px-6 py-4">Total Due</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {bills.data.map((bill) => (
                                    <tr key={bill.bill_no} className="hover:bg-muted/30 transition-colors group">
                                        {/* <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-xs font-bold text-muted-foreground">#{String(bill.bill_no).padStart(6, '0')}</span>
                                        </td> */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground leading-tight">{bill.customer?.name}</span>
                                               
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-blue-200 text-blue-600 bg-blue-50/50">
                                                        {bill.meter?.meter_number}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5 font-black text-primary">
                                                    {bill.consumption} <span className="text-[10px] font-normal text-muted-foreground">m³</span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">
                                                    Rate:{' '}
                                                    {formatCurrency(bill.unit_price)}
                                                    /unit
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[11px] gap-0.5">
                                                <div className="flex justify-between w-32">
                                                    <span className="text-muted-foreground">Current:</span>
                                                    <span className="font-bold font-mono">
                                                        {formatCurrency(
                                                            bill.current_charge,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between w-32">
                                                    <span className="text-muted-foreground">Arrears:</span>
                                                    <span className="font-bold font-mono text-red-500">
                                                        {formatCurrency(
                                                            bill.previous_balance,
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-foreground font-mono leading-none">
                                                    {formatCurrency(
                                                        bill.total_amount,
                                                    )}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground mt-1">
                                                    Due: {new Date(bill.due_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge
                                                variant={
                                                    bill.status === 'paid'
                                                        ? 'success'
                                                        : bill.status === 'forwarded'
                                                          ? 'outline'
                                                          : bill.status === 'partial'
                                                            ? 'outline'
                                                            : 'destructive'
                                                }
                                                className="uppercase text-[9px] font-black tracking-tighter"
                                            >
                                                {bill.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end opacity-80 transition-opacity group-hover:opacity-100">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="h-8 gap-1.5 px-2.5"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                            disabled={!canRecordPayment(bill.status)}
                                                            title={
                                                                !canRecordPayment(bill.status)
                                                                    ? 'Payments are only available while the bill is pending'
                                                                    : 'Record payment'
                                                            }
                                                            onSelect={() => openPayment(bill)}
                                                        >
                                                            <DollarSign
                                                                className={
                                                                    canRecordPayment(bill.status)
                                                                        ? 'text-emerald-600'
                                                                        : 'text-muted-foreground'
                                                                }
                                                            />
                                                            Record payment
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link
                                                                href={route('bills.print', bill.id)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Printer className="text-muted-foreground" />
                                                                Print bill
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('bills.show', bill.id)}>
                                                                <Eye className="text-blue-500" />
                                                                View bill
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {bills.links.length > 3 && (
                        <div className="flex items-center justify-between border-t px-6 py-4 bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                Showing {bills.from} to {bills.to} of {bills.total} invoices
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

function Input({ className, ...props }) {
    return (
        <input
            className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        />
    );
}
