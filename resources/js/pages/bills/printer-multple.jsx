import PrintBillCard from '@/components/print-bill-card';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintMultiple({ bills }) {
    const department = usePage().props.auth?.user?.department;

    useEffect(() => {
        if (department === 'finance') {
            router.visit(route('bills'));
            return;
        }
    }, [department]);

    if (department === 'finance') return null;

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
