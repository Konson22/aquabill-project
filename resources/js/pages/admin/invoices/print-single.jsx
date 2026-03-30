import PrintInvoiceCard from '@/components/invoices/print-invoice';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintSingleInvoice({ invoice }) {
    useEffect(() => {
        window.print();
    }, []);

    const title =
        invoice?.invoice_number != null
            ? `Service fee & charges — ${invoice.invoice_number}`
            : 'Service fee & charges';

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-stone-200/90 p-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-3xl print:max-w-none">
                    <PrintInvoiceCard invoice={invoice} />
                </div>
            </div>
        </>
    );
}
