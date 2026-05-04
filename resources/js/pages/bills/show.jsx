import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Printer,
    Download,
    CreditCard,
    ArrowLeft,
    Droplet,
    Calendar,
    User,
    MapPin,
    Activity,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function Show({ bill }) {
    const breadcrumbs = [
        { title: 'Billing', href: '/bills' },
        { title: `Invoice #${String(bill.id).padStart(6, '0')}`, href: `/bills/${bill.id}` },
    ];

    const statusConfig = {
        pending: { color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle, label: 'Pending' },
        paid: { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2, label: 'Paid' },
        partial: { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock, label: 'Partial' },
        forwarded: { color: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: Clock, label: 'Forwarded' },
    };

    const currentStatus = statusConfig[bill.status] || statusConfig.pending;
    const StatusIcon = currentStatus.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Invoice #${String(bill.id).padStart(6, '0')}`} />

            <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
                {/* Actions Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between no-print">
                    <Link href="/bills" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Billing List
                    </Link>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route('bills.print', bill.id)} target="_blank" rel="noopener noreferrer">
                                <Printer className="mr-2 h-4 w-4" />
                                Print Invoice
                            </a>
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                        {bill.status === 'pending' && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Record Payment
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Invoice Card */}
                <div className="bg-card border shadow-xl rounded-2xl overflow-hidden print:shadow-none print:border-none">
                    {/* Invoice Header Stripe */}
                    <div className="h-2 bg-blue-600 w-full" />

                    <div className="p-8 md:p-12 space-y-12">
                        {/* Company & Invoice Identity */}
                        <div className="flex flex-col md:flex-row justify-between gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Droplet className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-blue-900">AquaBill <span className="text-blue-500">Pro</span></h2>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Water Utility Management</p>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <p>123 Utility Avenue, Aqua City</p>
                                    <p>Contact: +254 700 000 000</p>
                                    <p>Email: billing@aquabill.com</p>
                                </div>
                            </div>

                            <div className="text-right space-y-2">
                                <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Invoice</h1>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-mono font-bold text-blue-600">#{String(bill.id).padStart(6, '0')}</span>
                                    <Badge variant="outline" className={`mt-2 px-3 py-1 uppercase text-[10px] font-black tracking-widest ${currentStatus.color}`}>
                                        <StatusIcon className="mr-1.5 h-3 w-3" />
                                        {currentStatus.label}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Customer & Dates Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-dashed border-muted">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User className="h-3 w-3" /> Bill To
                                </h3>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-foreground">{bill.customer?.name}</p>
                                    <p className="text-sm text-muted-foreground font-mono">Account: {bill.customer?.account_number}</p>
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>Zone: {bill.customer?.zone?.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:text-right">
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date Issued</h4>
                                    <p className="text-sm font-bold">{new Date(bill.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Due Date</h4>
                                    <p className="text-sm font-bold text-red-600">{new Date(bill.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Meter Details</h4>
                                    <p className="text-sm font-bold">{bill.meter?.meter_number} ({bill.meter?.meter_type})</p>
                                </div>
                            </div>
                        </div>

                        {/* Consumption Details */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Activity className="h-3 w-3" /> Consumption Breakdown
                            </h3>
                            <div className="bg-muted/30 rounded-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center border">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Previous Reading</p>
                                    <p className="text-2xl font-mono font-bold">{bill.reading?.previous_reading} <span className="text-xs font-normal">m³</span></p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="h-px w-8 bg-muted hidden md:block" />
                                    <ChevronRight className="h-5 w-5 text-muted-foreground mx-4" />
                                    <div className="h-px w-8 bg-muted hidden md:block" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Reading</p>
                                    <p className="text-2xl font-mono font-bold text-blue-600">{bill.reading?.current_reading} <span className="text-xs font-normal">m³</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Table */}
                        <div className="space-y-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                        <th className="py-3 text-left">Description</th>
                                        <th className="py-3 text-center">Qty / Value</th>
                                        <th className="py-3 text-right">Unit Price</th>
                                        <th className="py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50 font-medium">
                                    <tr>
                                        <td className="py-5">
                                            <p className="font-bold">Water Consumption</p>
                                            <p className="text-[10px] text-muted-foreground tracking-tight italic">Measured usage for the period</p>
                                        </td>
                                        <td className="py-5 text-center font-mono">{bill.consumption} m³</td>
                                        <td className="py-5 text-right font-mono">
                                            {formatCurrency(bill.unit_price)}
                                        </td>
                                        <td className="py-5 text-right font-bold font-mono">
                                            {formatCurrency(
                                                bill.consumption *
                                                    bill.unit_price,
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-5">
                                            <p className="font-bold">Fixed Service Charge</p>
                                            <p className="text-[10px] text-muted-foreground tracking-tight italic">Standard monthly infrastructure maintenance</p>
                                        </td>
                                        <td className="py-5 text-center font-mono">1 Units</td>
                                        <td className="py-5 text-right font-mono">
                                            {formatCurrency(bill.fixed_charge)}
                                        </td>
                                        <td className="py-5 text-right font-bold font-mono">
                                            {formatCurrency(bill.fixed_charge)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Summary Section */}
                            <div className="flex justify-end">
                                <div className="w-full md:w-80 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Current Charges</span>
                                        <span className="font-bold font-mono">
                                            {formatCurrency(bill.current_charge)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Previous Balance (Arrears)</span>
                                        <span
                                            className={`font-bold font-mono ${parseFloat(bill.previous_balance) > 0 ? 'text-red-500' : ''}`}
                                        >
                                            {formatCurrency(
                                                bill.previous_balance,
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-4 border-t-2 border-foreground flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-xs font-black uppercase tracking-tighter text-foreground">Total Amount Due</span>
                                            <p className="text-[8px] text-muted-foreground italic leading-none">Inclusive of all taxes and fees</p>
                                        </div>
                                        <span className="text-3xl font-black text-foreground tracking-tighter font-mono">
                                            {formatCurrency(bill.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Notes */}
                        <div className="pt-12 border-t text-center space-y-2">
                            <p className="text-xs text-muted-foreground font-medium italic">Thank you for being a valued customer. Please pay by the due date to avoid service interruption.</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Generated by AquaBill Cloud Service</p>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .animate-in { animation: none !important; }
                }
            ` }} />
        </AppLayout>
    );
}