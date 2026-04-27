import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PaymentModal from '@/components/payment-modal';
import {
    FileText,
    Search,
    Filter,
    Calendar,
    Download,
    Eye,
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
                                {bills.data.filter(b => b.status === 'unpaid').length}
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
                                ${bills.data.reduce((acc, b) => acc + parseFloat(b.total_amount), 0).toLocaleString()}
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
                                    <th className="px-6 py-4 text-center w-20">Invoice</th>
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
                                    <tr key={bill.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-mono text-xs font-bold text-muted-foreground">#{String(bill.id).padStart(6, '0')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground leading-tight">{bill.customer?.name}</span>
                                                <span className="text-xs text-muted-foreground">{bill.customer?.account_number}</span>
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
                                                <span className="text-[10px] text-muted-foreground">Rate: ${bill.unit_price}/unit</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-[11px] gap-0.5">
                                                <div className="flex justify-between w-32">
                                                    <span className="text-muted-foreground">Current:</span>
                                                    <span className="font-bold font-mono">${bill.current_charge}</span>
                                                </div>
                                                <div className="flex justify-between w-32">
                                                    <span className="text-muted-foreground">Arrears:</span>
                                                    <span className="font-bold font-mono text-red-500">${bill.previous_balance}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-base font-black text-foreground font-mono leading-none">
                                                    ${bill.total_amount}
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
                                                          : 'destructive'
                                                }
                                                className="uppercase text-[9px] font-black tracking-tighter"
                                            >
                                                {bill.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openPayment(bill)}
                                                    title={
                                                        bill.status === 'paid'
                                                            ? 'Already paid'
                                                            : bill.status ===
                                                              'forwarded'
                                                            ? 'Forwarded to next bill'
                                                            : bill.status ===
                                                              'partial'
                                                            ? 'Partially paid'
                                                            : 'Record payment'
                                                    }
                                                    disabled={
                                                        bill.status ===
                                                            'paid' ||
                                                        bill.status ===
                                                            'forwarded' ||
                                                        bill.status ===
                                                            'partial'
                                                    }
                                                >
                                                    <DollarSign
                                                        className={`h-4 w-4 ${
                                                            bill.status ===
                                                                'paid' ||
                                                            bill.status ===
                                                                'partial'
                                                                ? 'text-muted-foreground'
                                                                : 'text-emerald-600'
                                                        }`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    asChild
                                                >
                                                    <Link
                                                        href={route('bills.print', bill.id)}
                                                        target="_blank"
                                                    >
                                                        <Printer className="h-4 w-4 text-muted-foreground" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                    <Link href={route('bills.show', bill.id)}>
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </Link>
                                                </Button>
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
