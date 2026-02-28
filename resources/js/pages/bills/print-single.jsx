import PrintBillCard from '@/components/print-bill-card';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export default function PrintSingle({ bill }) {
    const department = usePage().props.auth?.user?.department;

    useEffect(() => {
        if (department === 'finance') {
            router.visit(route('bills'));
            return;
        }
        window.print();
    }, [department]);

    if (department === 'finance') return null;

    return (
        <>
            <Head title={`Print Bill #${bill?.id || ''}`} />
            <div className="min-h-screen bg-gray-100 p-4">
                <PrintBillCard bill={bill} />
            </div>
        </>
    );
}
