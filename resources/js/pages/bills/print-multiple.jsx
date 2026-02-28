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
        window.print();
    }, [department]);

    if (department === 'finance') return null;

    return (
        <>
            <Head title={`Print Bills #${bills?.length || ''}`} />
            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 8mm;
                        }
                        .print-bill-page {
                            background: white !important;
                            padding: 0 !important;
                        }
                        .print-bill-item {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .print-bill-item:nth-of-type(3n) {
                            page-break-after: always !important;
                            break-after: page !important;
                        }
                    }
                `}
            </style>
            <div className="print-bill-page min-h-screen bg-gray-100 p-4">
                {bills.map((bill) => (
                    <div className="print-bill-item" key={bill.id}>
                        <PrintBillCard bill={bill} />
                    </div>
                ))}
            </div>
        </>
    );
}
