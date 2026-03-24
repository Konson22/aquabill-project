import PrintBillCard from '@/components/print-bill-card';
import { Head } from '@inertiajs/react';

export default function PrintMultiple({ bills }) {
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
