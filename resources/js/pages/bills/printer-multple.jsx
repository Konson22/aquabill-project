import PrintBillCard from '@/components/print-bill-card';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintMultiple({ bills }) {
    useEffect(() => {
        // Auto-print when component loads
        // window.print();
    }, []);

    return (
        <>
            <Head title={`Print Bills #${bills?.length || ''}`} />
            <div className="min-h-screen bg-gray-100 p-4">
                {bills.map((bill) => (
                    <PrintBillCard key={bill.id} bill={bill} />
                ))}
            </div>
        </>
    );
}
