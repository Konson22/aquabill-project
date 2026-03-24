import PrintBillCard from '@/components/print-bill-card';
import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintSingle({ bill }) {
    useEffect(() => {
        window.print();
    }, []);

    return (
        <>
            <Head title={`Print Bill #${bill?.id || ''}`} />
            <div className="min-h-screen bg-gray-100 p-4">
                <PrintBillCard bill={bill} />
            </div>
        </>
    );
}
