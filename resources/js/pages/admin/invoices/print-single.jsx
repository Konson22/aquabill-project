import PrintInvoiceCard from '@/components/invoices/print-invoice';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintSingleInvoice({ invoice }) {
    useEffect(() => {
        // Auto-print when component loads
        window.print();
    }, []);

    return (
        <>
            <Head title={`Print Invoice #${invoice?.id || ''}`} />
            <div className="min-h-screen bg-gray-100 p-4">
                <PrintInvoiceCard invoice={invoice} />
            </div>
        </>
    );
}
