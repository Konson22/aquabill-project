import { Button } from '@/components/ui/button';
import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import { useEffect } from 'react';

export default function InvoicePrintMultiple({ invoices = [] }) {
    const formatCurrency = (n) => `${Number(n || 0).toLocaleString('en-SS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SSP`;
    const formatDateLong = (d) => (d ? new Date(d).toLocaleDateString('en-SS', { year: 'numeric', month: 'long', day: '2-digit' }) : '');

    const isOverdue = (dueDate, status) => {
        if (status === 'paid' || status === 'cancelled') return false;
        return new Date(dueDate) < new Date();
    };

    const handlePrint = () => {
        window.print();
    };

    useEffect(() => {
        // Auto-print when page loads
        window.print();
    }, []);

    return (
        <>
            <Head title={`Print ${invoices?.length || 0} Invoices`} />
            <style>
                {`@media print {
                    @page { margin: 0.3in; }
                    /* Ensure three invoices per page and spacing per invoice */
                    .invoice-item { 
                        break-inside: avoid; 
                        page-break-inside: avoid; 
                        margin-bottom: 0.5rem !important;
                        height: calc(100vh / 3 - 0.55in); /* Adjusted for smaller font */
                        display: flex;
                        flex-direction: column;
                    }
                    .invoice-item:nth-child(3n):not(:last-child) { 
                        page-break-after: always; 
                        break-after: page; 
                    }

                    /* Make the invoice fill available height and smaller print font */
                    .invoice-item .invoice-print-root,
                    .invoice-item .invoice-print-root * {
                        font-size: 10px !important;   /* smaller font size for all elements */
                        line-height: 1.15 !important;
                    }
                    .invoice-item .invoice-print-root {
                        flex: 1 1 auto;
                        display: flex;
                        flex-direction: column;
                        padding: 0.4rem !important; /* tighter padding for smaller font */
                    }
                }`}
            </style>
            <div className="min-h-screen bg-white">
                {/* Print button - hidden when printing */}
                <div className="border-b bg-gray-100 p-4 print:hidden">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold">Print {invoices?.length || 0} Invoices</h1>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print All
                        </Button>
                    </div>
                </div>

                {/* Invoices content */}
                <div className="p-4">
                    {(invoices || []).map((invoice, index) => {
                        const displayStatus = isOverdue(invoice?.due_date, invoice?.status) ? 'overdue' : invoice?.status;

                        return (
                            <div key={invoice.id} className="invoice-item">
                                <div className="invoice-print-root w-full bg-white p-6 print:p-0">
                                    {/* Header */}
                                    <div className="mb-6 flex items-center justify-between">
                                        <div className="h-20 w-20 object-contain">
                                            <img className="h-full w-full object-contain" src="/logo.jpg" alt="Logo" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-base leading-5 font-semibold">
                                                SOUTH SUDAN URBAN WATER CORPERATION
                                                <br /> INVOICE
                                                <br /> Invoice No:{' '}
                                                <span className="font-semibold text-red-600">#{invoice?.invoice_number || invoice?.id}</span>
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
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {invoice?.customer?.phone || '—'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">ADDRESS</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {invoice?.customer?.address || '—'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">REASON</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {invoice?.reason || '—'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">ISSUE DATE</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {formatDateLong(invoice?.issue_date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">DUE DATE</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {formatDateLong(invoice?.due_date)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">STATUS</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {displayStatus?.toUpperCase() || 'PENDING'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">CREATED</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {formatDateLong(invoice?.created_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-medium">AMOUNT DUE</span>
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {formatCurrency(invoice?.amount_due)}
                                                </span>
                                            </div>
                                            {invoice?.payments && invoice.payments.length > 0 && (
                                                <>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="font-medium">AMOUNT PAID</span>
                                                        <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right text-green-600">
                                                            {formatCurrency(
                                                                invoice.payments.reduce(
                                                                    (sum, payment) => sum + parseFloat(payment.amount_paid || 0),
                                                                    0,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="font-medium">BALANCE</span>
                                                        <span
                                                            className={`my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right ${
                                                                invoice.payments.reduce(
                                                                    (sum, payment) => sum + parseFloat(payment.amount_paid || 0),
                                                                    0,
                                                                ) >= parseFloat(invoice.amount_due || 0)
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                            }`}
                                                        >
                                                            {formatCurrency(
                                                                parseFloat(invoice.amount_due || 0) -
                                                                    invoice.payments.reduce(
                                                                        (sum, payment) => sum + parseFloat(payment.amount_paid || 0),
                                                                        0,
                                                                    ),
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
                                                <span className="my-0.5 flex-1 rounded bg-gray-100 px-2 py-0.5 text-right">
                                                    {formatCurrency(invoice?.amount_due)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
                                        <li>Please settle this invoice by the due date to avoid any service interruptions.</li>
                                        <li>For any inquiries regarding this invoice, contact: +211929928736 / +211929928737</li>
                                    </ul>
                                </div>
                                {/* Page break after every 3 invoices (except for the last invoice) */}
                                {(index + 1) % 3 === 0 && index < invoices.length - 1 && <div className="page-break hidden print:block"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
