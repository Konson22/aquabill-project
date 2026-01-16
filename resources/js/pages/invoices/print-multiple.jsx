import PrintInvoiceCard from '@/components/invoices/print-invoice';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintMultipleInvoices({ invoices }) {
    useEffect(() => {
        // Auto-print when component loads
        if (invoices.length > 0) {
            setTimeout(() => {
                // window.print();
            }, 500);
        }
    }, [invoices]);

    return (
        <>
            <Head title="Print Invoices" />
            <div className="min-h-screen bg-white p-0 print:p-0">
                {invoices.map((invoice, index) => (
                    <div key={invoice.id} className="print:block">
                        <PrintInvoiceCard invoice={invoice} />
                    </div>
                ))}
            </div>
        </>
    );
}
