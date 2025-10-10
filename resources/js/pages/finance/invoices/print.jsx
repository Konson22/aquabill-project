import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

export default function InvoicePrint({ invoice }) {
    const formatCurrency = (n) => `${Number(n || 0).toLocaleString('en-SS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
    const formatDateLong = (d) => (d ? new Date(d).toLocaleDateString('en-SS', { year: 'numeric', month: 'long', day: '2-digit' }) : '');

    const isOverdue = (dueDate, status) => {
        if (status === 'paid' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    const displayStatus = isOverdue(invoice?.due_date, invoice?.status) ? 'overdue' : invoice?.status;

    useEffect(() => {
        // Auto-print when page loads
        window.print();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Print Invoice #${invoice?.invoice_number || invoice?.id}`} />

            <div className="mb-4 flex items-center justify-between px-6 print:hidden">
                <h1 className="text-xl font-semibold">Print Invoice #{invoice?.invoice_number || invoice?.id}</h1>
                <Button className="gap-2" onClick={handlePrint}>
                    <Printer className="h-4 w-4" /> Print
                </Button>
            </div>

            <div className="invoice-print-root w-full bg-white p-6 print:p-0">
                <style>
                    {`@media print { .invoice-print-root { font-size: 12px; } .invoice-print-root .text-base { font-size: 0.9rem !important; } .invoice-print-root .text-sm { font-size: 0.75rem !important; } .invoice-print-root .leading-5 { line-height: 1.1rem !important; } }`}
                </style>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="h-20 w-20 object-contain">
                        <img className="h-full w-full object-contain" src="/logo.jpg" alt="Logo" />
                    </div>
                    <div className="text-center">
                        <p className="text-base leading-5 font-semibold">
                            SOUTH SUDAN URBAN WATER CORPERATION
                            <br /> INVOICE
                            <br /> Invoice No: <span className="font-semibold text-red-600">#{invoice?.invoice_number || invoice?.id}</span>
                        </p>
                    </div>
                    <div className="h-20 w-20 object-contain">
                        <img className="h-full w-full object-contain" src="/logo.jpg" alt="Logo" />
                    </div>
                </div>

                {/* Main details */}
                <div className="mb-4 grid grid-cols-3 gap-6">
                    <div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">CUSTOMER NAME</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                {invoice?.customer ? `${invoice.customer.first_name} ${invoice.customer.last_name}` : '—'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">PHONE</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{invoice?.customer?.phone || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">ADDRESS</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{invoice?.customer?.address || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">REASON</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{invoice?.reason || '—'}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">ISSUE DATE</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{formatDateLong(invoice?.issue_date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">DUE DATE</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{formatDateLong(invoice?.due_date)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">STATUS</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                {displayStatus?.toUpperCase() || 'PENDING'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">CREATED</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{formatDateLong(invoice?.created_at)}</span>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-3 text-sm">
                            <span className="font-medium">AMOUNT DUE</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{formatCurrency(invoice?.amount_due)}</span>
                        </div>
                        {invoice?.payments && invoice.payments.length > 0 && (
                            <>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-medium">AMOUNT PAID</span>
                                    <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right text-green-600">
                                        {formatCurrency(invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0))}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="font-medium">BALANCE</span>
                                    <span
                                        className={`my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right ${
                                            invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0) >=
                                            parseFloat(invoice.amount_due || 0)
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {formatCurrency(
                                            parseFloat(invoice.amount_due || 0) -
                                                invoice.payments.reduce((sum, payment) => sum + parseFloat(payment.amount_paid || 0), 0),
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mb-6 flex items-center justify-between text-sm">
                    <div>
                        <div>Generated by System</div>
                        <p className="mt-2">Sign: Billing Officer</p>
                    </div>
                    <div className="flex-1"></div>
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-medium">TOTAL INVOICE</span>
                            <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">{formatCurrency(invoice?.amount_due)}</span>
                        </div>
                    </div>
                </div>

                <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
                    <li>Please settle this invoice by the due date to avoid any service interruptions.</li>
                    <li>For any inquiries regarding this invoice, contact: +211929928736 / +211929928737</li>
                </ul>
            </div>
        </>
    );
}
